const pdf = require('pdf-parse');

async function test() {
  try {
    console.log('Initializing setWorker...');
    pdf.PDFParse.setWorker('dummy-path');
    
    const pdfjs = globalThis.pdfjs;
    console.log('Requiring pdf.worker.mjs or pdf.worker.js...');
    
    // Let's import the worker and see what it does
    const workerModule = require('pdfjs-dist/legacy/build/pdf.worker.mjs');
    console.log('Worker module keys:', Object.keys(workerModule));
    
    // In Node.js, let's see if the worker sets a global or can be set on GlobalWorkerOptions
    console.log('Worker initialized. Let\'s try parsing a PDF now!');
    
    const mockPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 21 >>\nstream\nBT /F1 12 Tf ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n284\n%%EOF'
    );
    
    const parserInstance = new pdf.PDFParse({ data: mockPdfBuffer });
    const parsedPdf = await parserInstance.getText();
    console.log('Success! Parsed text:', parsedPdf.text);
  } catch (e) {
    console.error('CAUGHT ERROR:', e);
  }
}

test();
