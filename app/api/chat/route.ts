import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Agent detection function
function detectAgent(message: string): string {
  const msg = message.toLowerCase();
  
  // Emergency detection - highest priority
  const emergencyKeywords = [
    "chest pain", "heart attack", "stroke", "unconscious", "not breathing",
    "severe bleeding", "broken bone", "head injury", "seizure", "overdose",
    "poisoning", "choking", "drowning", "burn", "emergency", "urgent",
    "critical", "severe pain", "can't breathe", "dizzy", "fainting"
  ];
  
  if (emergencyKeywords.some(keyword => msg.includes(keyword))) {
    return "emergency";
  }
  
  // Symptom detection
  const symptomKeywords = [
    "fever", "headache", "pain", "ache", "sore", "swelling", "rash",
    "cough", "cold", "flu", "nausea", "vomiting", "diarrhea", "constipation",
    "fatigue", "tired", "weak", "dizzy", "lightheaded", "shortness of breath",
    "wheezing", "symptom", "condition", "diagnosis", "treatment"
  ];
  
  if (symptomKeywords.some(keyword => msg.includes(keyword))) {
    return "symptom";
  }
  
  // Nutrition detection
  const nutritionKeywords = [
    "diet", "nutrition", "food", "meal", "eating", "calories", "protein",
    "vitamins", "supplements", "vegetarian", "vegan", "gluten", "dairy",
    "sugar", "fat", "carbohydrates", "fiber", "antioxidants", "minerals",
    "breakfast", "lunch", "dinner", "snack", "recipe", "cooking"
  ];
  
  if (nutritionKeywords.some(keyword => msg.includes(keyword))) {
    return "nutrition";
  }
  
  // Default to wellness
  return "wellness";
}

// Agent-specific system prompts
const agentPrompts = {
  wellness: `You are a Wellness Agent, a friendly and knowledgeable health coach. Your role is to provide:
- Lifestyle and wellness advice
- Diet and nutrition guidance
- Mental health and stress management tips
- Exercise and fitness recommendations
- General wellness best practices

Always be encouraging, supportive, and provide practical, actionable advice. Start your response with "Wellness Agent:" and keep responses conversational and helpful.`,
  
  symptom: `You are a Symptom Agent, a medical information assistant. Your role is to:
- Ask clarifying questions about symptoms
- Provide general information about common conditions
- Suggest when to seek medical attention
- Offer general home remedies and self-care tips
- Help users understand their symptoms better

IMPORTANT: Always remind users to consult healthcare professionals for serious concerns. Start your response with "Symptom Agent:" and be informative but cautious.`,
  
  nutrition: `You are a Nutrition Agent, a dietary and nutrition specialist. Your role is to provide:
- Dietary advice and meal planning tips
- Nutritional information about foods
- Supplement recommendations
- Special diet guidance (diabetic, heart-healthy, etc.)
- Hydration and healthy eating habits

Always provide evidence-based nutrition advice. Start your response with "Nutrition Agent:" and be educational and supportive.`,
  
  emergency: `You are an Emergency Detection System. Your role is to:
- Identify potential emergency situations
- Provide immediate guidance for urgent health concerns
- Direct users to emergency services when needed
- Offer first aid advice when appropriate
- Help assess the severity of symptoms

CRITICAL: If you detect emergency keywords (chest pain, severe bleeding, unconsciousness, etc.), immediately recommend calling emergency services. Start your response with "Emergency Agent:" and be direct and urgent when needed.`
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const userMessage = latestMessage.content;
    
    // Detect the appropriate agent
    const detectedAgent = detectAgent(userMessage);
    
    // Get the agent-specific system prompt
    const systemPrompt = agentPrompts[detectedAgent as keyof typeof agentPrompts] || agentPrompts.wellness;

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      maxTokens: 500,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
    
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
