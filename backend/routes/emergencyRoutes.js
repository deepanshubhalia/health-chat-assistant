const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// Emergency trigger endpoint
router.post('/trigger', emergencyController.triggerEmergency);

// Health check endpoint
router.get('/health', emergencyController.emergencyHealth);

module.exports = router; 