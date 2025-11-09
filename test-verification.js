// Test script to verify the document verification endpoint
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Create a test PDF content (simple text-based PDF)
const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Monthly Income: $5000) Tj
72 700 Td
(FICO Score: 750) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
274
%%EOF`;

// Write test PDF
fs.writeFileSync('test-document.pdf', testPdfContent);

async function testDocumentVerification() {
  try {
    const form = new FormData();
    
    // Add the test PDF file
    form.append('document', fs.createReadStream('test-document.pdf'));
    
    // Add user finance information
    form.append('ficoScore', '750');
    form.append('monthlyIncome', '5000');
    form.append('carPrice', '30000');
    form.append('ssn', '1234');

    const response = await fetch('http://localhost:4001/api/verify-documents', {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    console.log('Verification Result:', JSON.stringify(result, null, 2));

    // Clean up test file
    fs.unlinkSync('test-document.pdf');

  } catch (error) {
    console.error('Test failed:', error);
    // Clean up test file even if test fails
    try {
      fs.unlinkSync('test-document.pdf');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testDocumentVerification();