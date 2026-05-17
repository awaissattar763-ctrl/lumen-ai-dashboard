const pdf = require('pdf-parse');
console.log('PDFParse properties:', Object.getOwnPropertyNames(pdf.PDFParse));
console.log('PDFParse prototype properties:', Object.getOwnPropertyNames(pdf.PDFParse.prototype));

// Let's see what the constructor accepts by printing its string representation
console.log('PDFParse constructor string:', pdf.PDFParse.toString());
