const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");

// Main chat endpoint with automatic agent detection
router.post("/", handleChat);

module.exports = router; 