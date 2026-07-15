const pdfModule = require('./node_modules/pdf-parse');
const fs = require('fs');
const path = require('path');

// Check what the module exports
console.log('Module type:', typeof pdfModule);
console.log('Module keys:', Object.keys(pdfModule));

// pdf-parse may export the function directly, or as .default
const pdfParse = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);

const pdfFiles = [
  'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\21c5033d-4228-4ae7-a26b-f274e995d1b6\\media__1784100995961.pdf',
  'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\21c5033d-4228-4ae7-a26b-f274e995d1b6\\media__1784100999814.pdf',
  'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\21c5033d-4228-4ae7-a26b-f274e995d1b6\\media__1784101004355.pdf'
];

async function extractAll() {
  for (const filePath of pdfFiles) {
    const fileName = path.basename(filePath);
    console.log('\n' + '='.repeat(60));
    console.log('FILE: ' + fileName);
    console.log('='.repeat(60));
    try {
      const dataBuffer = fs.readFileSync(filePath);
      console.log('Buffer size:', dataBuffer.length);
      const data = await pdfParse(dataBuffer);
      console.log('Pages:', data.numpages);
      console.log('\n--- TEXT CONTENT ---\n');
      console.log(data.text);
    } catch (err) {
      console.error('ERROR processing ' + fileName + ':', err.message);
      console.error(err.stack);
    }
  }
}

extractAll();
