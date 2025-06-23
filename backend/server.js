const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const chatRoutes = require('./routes/chatRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const reportRoutes = require('./routes/reportRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const waterRoutes = require('./routes/water');
const sleepRoutes = require('./routes/sleep');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// CORS configuration - OPEN for debugging
app.use(cors());

// Rate limiting - More permissive for dashboard
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute (much higher)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Health Chat AI Backend'
  });
});

// Chat routes
app.use('/api/chat', chatRoutes);

// Emergency routes
app.use('/api/emergency', emergencyRoutes);

// Report analyzer routes
app.use('/api/report', reportRoutes);

// Symptom analyzer routes
app.use('/api', symptomRoutes);

// Water tracking routes
app.use('/api/water', waterRoutes);

// Sleep tracking routes
app.use('/api/sleep', sleepRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Health Chat AI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🚨 Emergency endpoint: http://localhost:${PORT}/api/emergency`);
  console.log(`📄 Report Analyzer endpoint: http://localhost:${PORT}/api/report/analyze`);
  console.log(`🩺 Symptom Analyzer endpoint: http://localhost:${PORT}/api/analyze-symptom`);
  console.log(`💧 Water tracking endpoint: http://localhost:${PORT}/api/water`);
  console.log(`😴 Sleep tracking endpoint: http://localhost:${PORT}/api/sleep`);
});

module.exports = app; 