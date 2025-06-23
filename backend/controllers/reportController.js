const pdfParse = require('pdf-parse'); // for PDF
const { createWorker } = require('tesseract.js'); // OCR for JPG

const { analyzeTextWithAI } = require('../utils/callAI');

// A mock function for extracting text from an image
async function extractTextFromImage(buffer) {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(buffer);
  await worker.terminate();
  return text;
};


exports.analyzeReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  
  const file = req.file;

  try {
    let text = '';
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = file.buffer;
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (file.mimetype.startsWith('image/')) {
      text = await extractTextFromImage(file.buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file type.' });
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Could not extract enough text from the document to analyze.' });
    }

    // Call the AI to analyze the extracted text
    const analysis = await analyzeTextWithAI(text);
    
    // The AI is expected to return a JSON string, so we parse it.
    // In a real app, you'd want more robust error handling here.
    const structuredResponse = JSON.parse(analysis);
    
    res.json(structuredResponse);

  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ error: 'Failed to analyze report.', details: error.message });
  }
}; 