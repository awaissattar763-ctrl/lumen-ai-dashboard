const pdf = require('pdf-parse');
console.log('setWorker method exists?', typeof pdf.PDFParse.setWorker);
if (typeof pdf.PDFParse.setWorker === 'function') {
  console.log('setWorker method string:', pdf.PDFParse.setWorker.toString());
}
