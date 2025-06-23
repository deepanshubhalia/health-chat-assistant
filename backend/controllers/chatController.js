const callAI = require("../utils/callAI");

function detectAgent(message) {
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
    "fever", "headache", "pain", "ache", "sore", "nausea", "vomiting",
    "diarrhea", "constipation", "cough", "cold", "flu", "symptom",
    "feeling sick", "not feeling well", "ill", "sick"
  ];
  
  if (symptomKeywords.some(keyword => msg.includes(keyword))) {
    return "symptom";
  }
  
  // Nutrition detection
  const nutritionKeywords = [
    "diet", "nutrition", "food", "eating", "meal", "calories", "protein",
    "vitamins", "supplements", "weight", "obese", "overweight", "underweight",
    "vegetarian", "vegan", "gluten", "allergy", "intolerance"
  ];
  
  if (nutritionKeywords.some(keyword => msg.includes(keyword))) {
    return "nutrition";
  }
  
  // Default to wellness
  return "wellness";
}

async function handleChat(req, res) {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "Message is required and must be a string" 
      });
    }
    
    // Detect which agent should handle this message
    const agentType = detectAgent(message);
    
    console.log(`Detected agent: ${agentType} for message: "${message}"`);
    
    // Call the AI with the appropriate agent
    const aiResponse = await callAI(agentType, message);
    
    // Return the response with agent information
    res.json({
      response: aiResponse,
      agent: agentType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Chat controller error:", error);
    
    res.status(500).json({
      error: "Failed to process chat message",
      details: error.message
    });
  }
}

module.exports = {
  handleChat
};

// Additional endpoint for manual agent selection
exports.chatWithAgent = async (req, res) => {
  try {
    const { message, agent } = req.body;
    
    if (!message || !agent) {
      return res.status(400).json({ error: "Message and agent are required" });
    }
    
    const validAgents = ['wellness', 'symptom', 'nutrition', 'emergency'];
    if (!validAgents.includes(agent)) {
      return res.status(400).json({ error: "Invalid agent specified" });
    }
    
    const aiResponse = await callAI(agent, message);
    
    // Ensure the response has the agent prefix for frontend compatibility
    let formattedResponse = aiResponse;
    if (!aiResponse.includes('Agent:')) {
      const agentNames = {
        wellness: 'Wellness Agent',
        symptom: 'Symptom Agent', 
        nutrition: 'Nutrition Agent',
        emergency: 'Emergency Agent'
      };
      formattedResponse = `${agentNames[agent] || 'Health Agent'}: ${aiResponse}`;
    }
    
    res.json({ 
      agent, 
      response: formattedResponse,
      message: formattedResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("Chat with agent error:", err);
    res.status(500).json({ 
      error: "AI failed to respond",
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}; 