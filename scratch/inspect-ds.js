const pdf = require('pdf-parse');
// Call setWorker to initialize globalThis.pdfjs
pdf.PDFParse.setWorker('test-path');

console.log('globalThis.pdfjs keys:', Object.keys(globalThis.pdfjs || {}));
if (globalThis.pdfjs && globalThis.pdfjs.GlobalWorkerOptions) {
  console.log('GlobalWorkerOptions keys:', Object.keys(globalThis.pdfjs.GlobalWorkerOptions));
  console.log('GlobalWorkerOptions workerSrc:', globalThis.pdfjs.GlobalWorkerOptions.workerSrc);
}
