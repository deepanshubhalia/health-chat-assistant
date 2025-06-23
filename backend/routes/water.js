const express = require('express');
const router = express.Router();
const { waterData, initializeData } = require('../data/store');

// Reset data (for testing)
router.post('/reset', (req, res) => {
  initializeData();
  res.send({ success: true });
});

// GET weekly data
router.get('/week', (req, res) => {
  res.json(waterData);
});

// Update water for a specific day (sets the amount)
router.post('/', (req, res) => {
  const { date, amount } = req.body;
  
  if (!date || amount === undefined) {
    return res.status(400).send({ success: false, message: 'Date and amount are required' });
  }
  
  const existingEntry = waterData.find(w => w.date === date);
  
  if (existingEntry) {
    existingEntry.amount = amount;
  } else {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    waterData.push({ date, dayName, amount });
  }
  
  res.send({ success: true, data: waterData });
});

module.exports = router; 