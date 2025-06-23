const Tesseract = require('tesseract.js');

module.exports = async function extractTextFromImage(buffer) {
  try {
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
      logger: m => console.log(m) // Log progress
    });
    return text;
  } catch (error) {
    console.error('Error with Tesseract OCR:', error);
    throw new Error('Failed to extract text from image.');
  }
}; 