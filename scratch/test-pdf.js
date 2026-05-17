try {
  const pdf = require('pdf-parse');
  console.log('Keys of pdf:', Object.keys(pdf));
  console.log('Type of pdf:', typeof pdf);
  if (pdf.PDFParse) {
    console.log('PDFParse class exists!');
  } else {
    console.log('PDFParse class does NOT exist.');
  }
} catch (e) {
  console.error('Error importing pdf-parse:', e);
}
