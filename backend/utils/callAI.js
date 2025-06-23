const axios = require('axios');

// Hugging Face API Configuration
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN || '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';

const headers = {
  Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
};

const agentPrompts = {
    wellness: `You are a friendly and encouraging wellness assistant. You provide general health tips, mindfulness exercises, and motivational support. Keep your responses concise, positive, and under 100 words. Never give medical advice.`,
    symptom: `You are a helpful symptom checker assistant. You ask clarifying questions to understand user symptoms better. You provide potential causes but always state clearly that you are not a doctor and the user must consult a healthcare professional for a diagnosis.`,
    nutrition: `You are a knowledgeable nutrition assistant. You provide information on healthy eating, balanced diets, and the nutritional value of different foods. You must not create meal plans but can give general advice. Always recommend consulting a registered dietitian for personalized plans.`,
    emergency: `You are an emergency response assistant. Your only role is to recognize an emergency and tell the user to contact emergency services immediately. Your response should be direct and clear, for example: "Based on what you've said, this could be a medical emergency. Please contact your local emergency services immediately."`
};

async function callAI(agentType, userMessage) {
    console.log(`Calling AI with agent: ${agentType}`);

    // Check if the API key is missing or is a placeholder value.
    if (!process.env.HUGGINGFACE_TOKEN || process.env.HUGGINGFACE_TOKEN === "YOUR_HUGGINGFACE_TOKEN") {
        console.warn("HUGGINGFACE_TOKEN is not set or is a placeholder. Using fallback response.");
        return getFallbackResponse(agentType, userMessage);
    }

    const systemPrompt = agentPrompts[agentType] || agentPrompts.wellness;
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;

    try {
        // Use a more reliable text generation model
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { 
                inputs: fullPrompt,
                parameters: {
                    max_length: 150,
                    temperature: 0.7,
                    do_sample: true,
                    return_full_text: false
                }
            },
            { 
                headers,
                timeout: 10000 // 10 second timeout
            }
        );

        if (response.data && response.data[0] && response.data[0].generated_text) {
            let generatedText = response.data[0].generated_text;
            // Clean up the response to remove the original prompt
            if (generatedText.includes(fullPrompt)) {
                generatedText = generatedText.replace(fullPrompt, '').trim();
            }
            return generatedText || getFallbackResponse(agentType, userMessage);
        } else {
            // Fallback to a simple response if the model doesn't return expected format
            return getFallbackResponse(agentType, userMessage);
        }
    } catch (error) {
        console.error("Hugging Face API call failed:", error.response?.data || error.message);
        return getFallbackResponse(agentType, userMessage);
    }
}

// Function to get appropriate fallback responses based on agent type and user message
function getFallbackResponse(agentType, userMessage) {
    const message = userMessage.toLowerCase();
    
    // Symptom-specific responses
    if (agentType === 'symptom') {
        if (message.includes('cold') || message.includes('fever') || message.includes('flu')) {
            return "I understand you're experiencing cold/fever symptoms. While I can't provide a diagnosis, I recommend rest, staying hydrated, and monitoring your temperature. If symptoms persist or worsen, please consult a healthcare professional immediately.";
        }
        if (message.includes('headache') || message.includes('pain')) {
            return "I hear you're experiencing pain. While I can't diagnose the cause, consider rest, hydration, and over-the-counter pain relief if appropriate. If pain is severe or persistent, please seek medical attention.";
        }
        if (message.includes('stomach') || message.includes('nausea') || message.includes('vomit')) {
            return "I understand you're having stomach issues. Stay hydrated with clear fluids and rest. If symptoms are severe, persistent, or accompanied by other concerning symptoms, please consult a doctor immediately.";
        }
        return "I understand you're experiencing symptoms. While I can't provide a diagnosis, I recommend consulting a healthcare professional for proper evaluation. If symptoms are severe, please seek immediate medical attention.";
    }
    
    // Wellness-specific responses
    if (agentType === 'wellness') {
        if (message.includes('eat') || message.includes('food') || message.includes('diet')) {
            return "For nutrition advice, focus on a balanced diet with plenty of fruits, vegetables, whole grains, and lean proteins. Consider consulting a registered dietitian for personalized guidance.";
        }
        if (message.includes('sleep') || message.includes('tired') || message.includes('rest')) {
            return "Good sleep is essential for wellness! Aim for 7-9 hours per night, maintain a consistent sleep schedule, and create a relaxing bedtime routine. Consider limiting screen time before bed.";
        }
        if (message.includes('stress') || message.includes('anxiety') || message.includes('worried')) {
            return "Managing stress is important for wellness. Try deep breathing exercises, meditation, regular physical activity, and maintaining social connections. Consider speaking with a mental health professional if needed.";
        }
        return "I'm here to support your wellness journey! Consider taking a moment to breathe deeply, stay hydrated, and get adequate rest. Remember, small daily habits contribute to overall well-being.";
    }
    
    // Nutrition-specific responses
    if (agentType === 'nutrition') {
        if (message.includes('protein') || message.includes('meat') || message.includes('vegetarian')) {
            return "Protein is essential for health. Good sources include lean meats, fish, eggs, legumes, nuts, and dairy. For personalized nutrition advice, consult a registered dietitian.";
        }
        if (message.includes('vitamin') || message.includes('supplement')) {
            return "While supplements can be helpful, it's best to get nutrients from whole foods. Consult with a healthcare provider or dietitian before starting any supplements.";
        }
        return "For personalized nutrition advice, I recommend consulting a registered dietitian. In general, focus on a balanced diet with plenty of fruits, vegetables, and whole grains.";
    }
    
    // Emergency-specific responses
    if (agentType === 'emergency') {
        return "If you're experiencing a medical emergency, please call your local emergency services immediately. Don't wait for an online response.";
    }
    
    // Default response
    return "I'm here to help with your health concerns. Please try again in a moment, or if this is an emergency, call 911 immediately.";
}

// The analyzeTextWithAI function for medical report analysis
async function analyzeTextWithAI(text) {
    if (!process.env.HUGGINGFACE_TOKEN || process.env.HUGGINGFACE_TOKEN === "YOUR_HUGGINGFACE_TOKEN") {
        console.warn("HUGGINGFACE_TOKEN is not set for analysis. Using fallback.");
        return {
            summary: "AI analysis is not available due to configuration issues.",
            medicines: [],
            warnings: ["Service not configured."],
        };
    }

    try {
        console.log("🤖 Starting Hugging Face API calls for analysis...");
        
        // 1. Summarize
        console.log("📝 Calling BART summarization model...");
        const summaryPromise = axios.post(
            'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
            { 
                inputs: text,
                parameters: {
                    max_length: 150,
                    min_length: 30,
                    do_sample: false,
                }
            },
            { headers }
        );

        // 2. Named Entity Recognition (NER) for Medicines
        console.log("💊 Calling biomedical NER model...");
        const nerPromise = axios.post(
            'https://api-inference.huggingface.co/models/d4data/biomedical-ner-all',
            { inputs: text },
            { headers }
        );

        const [summaryRes, nerRes] = await Promise.all([summaryPromise, nerPromise]);
        
        console.log("📊 Summary response:", summaryRes.data);
        console.log("💊 NER response:", nerRes.data);
        
        // Extract medicines from NER output
        const meds = nerRes.data
            .flat() // The model can return an array of arrays
            .filter((item) => item.entity_group === 'DRUG' || item.entity_group === 'CHEMICAL')
            .map((item) => item.word.replace(/##/g, ''));

        console.log("💊 Extracted medicines:", meds);

        const uniqueMeds = [...new Set(meds)];

        const result = {
            summary: summaryRes.data[0].summary_text,
            medicines: uniqueMeds,
            warningCount: (text.match(/warning|danger|urgent|alert|low|high|abnormal/gi) || []).length,
            charCount: text.length,
        };
        
        console.log("✅ Final result:", result);
        return result;
    } catch (error) {
        console.error("❌ Hugging Face API Analysis Error:", error.response?.data || error.message);
        return {
            summary: "Failed to analyze the report due to a service error.",
            medicines: [],
            warnings: ["Could not connect to the analysis service."],
        };
    }
}

// Export both functions, but callAI is the default for chat.
module.exports = callAI;
module.exports.analyzeTextWithAI = analyzeTextWithAI; 