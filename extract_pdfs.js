const pdf = require('./node_modules/pdf-parse');
const fs = require('fs');
const path = require('path');

const pdfFiles = [
  'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\21c5033d-4228-4ae7-a26b-f274e995d1b6\\media__1784100995961.pdf',
  'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\21c5033d-4228-4ae7-a26b-f274e995d1b6\\media__1784100999814.pdf',
  'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\21c5033d-4228-4ae7-a26b-f274e995d1b6\\media__1784101004355.pdf'
];

async function extractAll() {
  for (const filePath of pdfFiles) {
    const fileName = path.basename(filePath);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`FILE: ${fileName}`);
    console.log('='.repeat(60));
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      console.log(`Pages: ${data.numpages}`);
      console.log(`\n--- TEXT CONTENT ---\n`);
      console.log(data.text);
    } catch (err) {
      console.error(`ERROR processing ${fileName}:`, err.message);
    }
  }
}

extractAll();
