async function test() {
  try {
    const pdf = require('pdf-parse');
    const PDFParseClass = pdf.PDFParse;
    
    console.log('Importing pdf.worker.mjs...');
    require('pdfjs-dist/legacy/build/pdf.worker.mjs');
    
    console.log('Setting dummy workerSrc...');
    PDFParseClass.setWorker('dummy-worker-src');
    
    const mockPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 21 >>\nstream\nBT /F1 12 Tf ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n284\n%%EOF'
    );
    
    console.log('Parsing...');
    const parserInstance = new PDFParseClass({ data: mockPdfBuffer });
    const parsedPdf = await parserInstance.getText();
    console.log('Success! Parsed text:', parsedPdf.text);
  } catch (e) {
    console.error('CAUGHT ERROR:', e);
  }
}

test();
