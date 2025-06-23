const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeReport } = require('../controllers/reportController');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit
});

router.post('/analyze', upload.single('report'), analyzeReport);

module.exports = router; 