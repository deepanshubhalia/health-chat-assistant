const express = require('express');
const router = express.Router();
const { callAI } = require('../utils/callAI');

// Fallback symptom analysis function
function analyzeSymptomsFallback(userInput) {
  const input = userInput.toLowerCase();
  let urgency = 'Mild - Self-Care';
  let causes = [];
  let remedies = [];
  let doctorVisit = 'Monitor your symptoms and consult a doctor if they persist or worsen.';

  // Basic keyword analysis
  if (input.includes('chest pain') || input.includes('heart') || input.includes('breathing')) {
    urgency = 'Critical';
    causes = ['Could be related to cardiovascular or respiratory issues'];
    doctorVisit = 'Seek immediate medical attention for chest pain or breathing difficulties.';
  } else if (input.includes('fever') && input.includes('high')) {
    urgency = 'See Doctor Soon';
    causes = ['Possible infection or inflammatory condition'];
    remedies = ['Rest, stay hydrated, monitor temperature'];
  } else if (input.includes('headache') && input.includes('severe')) {
    urgency = 'See Doctor Soon';
    causes = ['Could be migraine, tension headache, or other neurological issue'];
    remedies = ['Rest in a quiet, dark room', 'Stay hydrated', 'Avoid bright lights'];
  } else if (input.includes('dizzy') || input.includes('lightheaded')) {
    urgency = 'Mild - Self-Care';
    causes = ['Dehydration, low blood sugar, or inner ear issues'];
    remedies = ['Sit or lie down', 'Stay hydrated', 'Eat something if hungry'];
  } else if (input.includes('nausea') || input.includes('vomiting')) {
    urgency = 'Mild - Self-Care';
    causes = ['Stomach virus, food poisoning, or motion sickness'];
    remedies = ['Stay hydrated with small sips', 'Rest', 'Avoid solid foods initially'];
  } else {
    causes = ['General symptoms that may have various causes'];
    remedies = ['Rest, stay hydrated, monitor symptoms'];
  }

  return `1. 🔍 Possible Causes:
- ${causes.join('\n- ')}

2. ⚠️ Urgency Level: ${urgency}

3. 🏠 Home Remedies or Tips:
- ${remedies.join('\n- ')}

4. 🏥 When to See a Doctor: ${doctorVisit}

Note: This is a basic analysis. For accurate diagnosis, please consult a healthcare professional.`;
}

router.post('/analyze-symptom', async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'Symptom input is required' });
  }

  const prompt = `
You're an expert medical assistant. A user will describe their symptoms in simple language.
Your task is to analyze it and return a response in the following format:

1. 🔍 Possible Causes: List 2-3 possible conditions
2. ⚠️ Urgency Level: Critical / See Doctor Soon / Mild - Self-Care
3. 🏠 Home Remedies or Tips: Simple tips if symptoms are mild
4. 🏥 When to See a Doctor: Mention key red flags for doctor visit

Symptoms: "${userInput}"

Respond only with medically sound advice. Avoid guessing critical diagnoses.
Keep the tone simple, safe, and user-friendly.
`;

  try {
    const response = await callAI(prompt);
    res.json({ answer: response });
  } catch (error) {
    console.error('Symptom Analysis Error:', error);
    console.log('Using fallback analysis for symptoms:', userInput);
    
    // Use fallback analysis when AI fails
    const fallbackResponse = analyzeSymptomsFallback(userInput);
    res.json({ answer: fallbackResponse });
  }
});

module.exports = router; 