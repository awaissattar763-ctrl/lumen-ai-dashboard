import { createClient } from './server'

/**
 * Downloads a document from Supabase storage, extracts its plain text on the server,
 * splits it into sliding window text chunks, and logs the records inside public.document_chunks.
 */
export async function processDocumentText(documentId: string, storagePath: string) {
  const supabase = createClient()

  // 1. Authenticate server user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  try {
    // 2. Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(storagePath)

    if (downloadError || !fileData) {
      console.error('Storage download error:', downloadError)
      throw new Error(downloadError?.message || 'Failed to download file from storage.')
    }

    // 3. Convert blob into array buffer and parse text using custom PDFParse class
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 3.1. High-fidelity Server-Side Render (SSR) polyfills for browser-only globals (DOMMatrix, window, self, document)
    // to prevent pdfjs-dist/pdf-parse from crashing during Next.js serverless execution on Vercel.
    if (typeof global !== 'undefined') {
      if (!('DOMMatrix' in global)) {
        (global as any).DOMMatrix = class DOMMatrix {
          a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
          constructor(init?: string | number[]) {
            if (Array.isArray(init)) {
              this.a = init[0] ?? 1;
              this.b = init[1] ?? 0;
              this.c = init[2] ?? 0;
              this.d = init[3] ?? 1;
              this.e = init[4] ?? 0;
              this.f = init[5] ?? 0;
            }
          }
        };
      }
      if (!('self' in global)) {
        (global as any).self = global;
      }
      if (!('window' in global)) {
        (global as any).window = global;
      }
      if (!('document' in global)) {
        (global as any).document = {
          createElement: () => ({
            getContext: () => ({
              drawImage: () => {},
              putImageData: () => {},
              createImageData: () => ({}),
              setTransform: () => {},
              scale: () => {},
              translate: () => {},
              rotate: () => {},
            }),
          }),
        };
      }
    }

    // Dynamically import pdf-parse at runtime to optimize Next.js compile-time trace memory
    const pdf = await import('pdf-parse')
    const pdfModule = (pdf as any).default || pdf
    const PDFParseClass = pdfModule.PDFParse || pdf.PDFParse
    if (!PDFParseClass) {
      throw new Error('PDFParse constructor class could not be resolved from pdf-parse module.')
    }

    const parserInstance = new PDFParseClass({ data: buffer })
    const parsedPdf = await parserInstance.getText()
    const fullText = parsedPdf.text

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('PDF has no extractable text contents.')
    }

    // 4. Chunk text into elegant overlapping windows within 500-1000 chars limit
    const chunks = chunkText(fullText, 800, 150) // 800 characters chunk, 150 overlap

    // 5. Build database records
    const chunkRecords = chunks.map((chunk, i) => ({
      document_id: documentId,
      user_id: user.id,
      chunk_index: i,
      content: chunk.trim(),
    }))

    // 6. Batch insert chunks inside database concurrently for max parallel pipeline efficiency
    const batchSize = 80
    const insertPromises = []
    for (let i = 0; i < chunkRecords.length; i += batchSize) {
      const batch = chunkRecords.slice(i, i + batchSize)
      insertPromises.push(
        supabase
          .from('document_chunks')
          .insert(batch)
          .then(({ error }) => {
            if (error) {
              console.error('Error inserting document chunk batch:', error)
              throw new Error(error.message);
            }
          })
      )
    }
    await Promise.all(insertPromises);

    return { success: true, chunksCount: chunks.length }
  } catch (err: any) {
    console.error('Failed to parse and process document chunks:', err)
    throw err
  }
}

/**
 * Splits document text into overlapping sliding-window chunks.
 */
function chunkText(text: string, size = 1200, overlap = 250): string[] {
  // Normalize double whitespaces and line endings
  const normalizedText = text.replace(/\s+/g, ' ').replace(/\n+/g, ' ')
  const chunks: string[] = []
  
  let index = 0
  while (index < normalizedText.length) {
    const chunk = normalizedText.slice(index, index + size)
    if (chunk.trim().length > 0) {
      chunks.push(chunk)
    }
    index += size - overlap
  }
  
  return chunks
}
