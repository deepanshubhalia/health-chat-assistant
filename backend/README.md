# Health Chat AI Backend

This is the backend AI service for the Health Chat Assistant application. It provides intelligent agent-based responses for health-related queries.

## Features

- **Multi-Agent AI System**: Automatically detects and routes queries to appropriate AI agents
- **Emergency Detection**: Identifies urgent health situations and provides immediate guidance
- **Specialized Agents**: 
  - Wellness Agent: Lifestyle and general health advice
  - Symptom Agent: Medical information and symptom guidance
  - Nutrition Agent: Dietary and nutrition advice
  - Emergency Agent: Urgent health situation handling

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### POST `/api/chat`
Main chat endpoint that automatically detects the appropriate agent.

**Request:**
```json
{
  "message": "I have a headache"
}
```

**Response:**
```json
{
  "agent": "symptom",
  "aiResponse": "Symptom Agent: I understand you're experiencing a headache...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST `/api/chat/agent`
Chat with a specific agent.

**Request:**
```json
{
  "message": "What should I eat for breakfast?",
  "agent": "nutrition"
}
```

### GET `/health`
Health check endpoint.

## Agent Detection

The system automatically detects the appropriate agent based on keywords:

- **Emergency**: chest pain, heart attack, stroke, unconscious, etc.
- **Symptom**: fever, headache, pain, cough, etc.
- **Nutrition**: diet, food, meal, calories, etc.
- **Wellness**: exercise, stress, lifestyle, etc.

## Security Features

- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation
- Error handling

## Development

```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Start production server
npm start
```

## Integration with Frontend

The backend is designed to work seamlessly with the Next.js frontend. The frontend makes API calls to these endpoints and displays the AI responses in the chat interface. 