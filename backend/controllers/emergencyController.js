const sendSMS = require('../utils/sendSMS');

exports.triggerEmergency = async (req, res) => {
  const { location, user } = req.body;

  // Validate required fields
  if (!location || !location.lat || !location.lng) {
    return res.status(400).json({ error: 'Location coordinates are required' });
  }

  if (!user) {
    return res.status(400).json({ error: 'User information is required' });
  }

  const message = `${user} triggered an emergency!\nLocation: https://www.google.com/maps?q=${location.lat},${location.lng}`;
  
  // Emergency contact numbers from environment variables
  const contacts = [
    process.env.EMERGENCY_CONTACT_1,
    process.env.EMERGENCY_CONTACT_2
  ].filter(contact => contact && contact !== 'your_phone_number_here');

  if (contacts.length === 0) {
    return res.status(400).json({ error: 'No emergency contacts configured' });
  }

  try {
    console.log(`Emergency triggered by ${user} at location: ${location.lat}, ${location.lng}`);
    
    // Send SMS to all emergency contacts
    const smsResults = await Promise.all(
      contacts.map(num => sendSMS(num, message))
    );
    
    console.log(`Emergency alerts sent to ${smsResults.length} contacts`);
    
    res.status(200).json({ 
      status: 'alert_sent',
      message: 'Emergency alerts sent successfully',
      contactsNotified: smsResults.length,
      location: location
    });
  } catch (err) {
    console.error('Failed to send emergency alerts:', err);
    res.status(500).json({ 
      error: 'Failed to send alerts',
      details: err.message 
    });
  }
};

// Health check endpoint for emergency service
exports.emergencyHealth = async (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'emergency',
    timestamp: new Date().toISOString()
  });
}; 