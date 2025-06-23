const express = require('express');
const router = express.Router();
const { sleepData } = require('../data/store');

// GET weekly data
router.get('/week', (req, res) => {
  res.json(sleepData);
});

// Update sleep for a specific day
router.post('/', (req, res) => {
  const { date, hours } = req.body;
  
  if (!date || hours === undefined) {
    return res.status(400).send({ success: false, message: 'Date and hours are required' });
  }
  
  const existingEntry = sleepData.find(s => s.date === date);
  
  if (existingEntry) {
    existingEntry.hours = hours;
  } else {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    sleepData.push({ date, dayName, hours });
  }
  
  res.send({ success: true, data: sleepData });
});

module.exports = router; 