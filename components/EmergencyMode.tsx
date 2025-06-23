"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MapPin, AlertTriangle, X, Play, Heart, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Utility function for getting user location
const getUserLocation = (callback: (location: { lat: number; lng: number }) => void) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        callback({ lat, lng });
      },
      () => {
        alert('Unable to access location');
      }
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
};

const EmergencyMode = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showCPRVideo, setShowCPRVideo] = useState(false)

  // Limit to 3 emergency contacts as required
  const emergencyContacts = [
    { name: "Emergency Services", phone: "911", type: "emergency" },
    { name: "Dr. Sarah Johnson", phone: "+1 (555) 123-4567", type: "doctor" },
    { name: "Mom", phone: "+1 (555) 987-6543", type: "family" },
  ]

  // Get user location on component mount using the utility function
  useEffect(() => {
    getUserLocation((location) => {
      setUserLocation(location);
    });
  }, [])

  const handleSOS = () => {
    const confirmed = window.confirm("Send emergency alert?");
    if (!confirmed) return;

    getUserLocation((coords) => {
      fetch('http://localhost:5001/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: coords,
          user: 'John Doe', // Or pull from context
        })
      })
      .then(response => {
        if (response.ok) {
          setIsEmergencyActive(true);
          console.log("Emergency alert sent successfully!");
        } else {
          console.error("Failed to send emergency alert");
        }
      })
      .catch(error => {
        console.error("Error sending emergency alert:", error);
      });
    });
  };

  const handleSOSClick = () => {
    handleSOS();
  }

  const handleConfirmEmergency = () => {
    setIsEmergencyActive(true)
    setShowConfirmDialog(false)
    // Here you would trigger actual emergency protocols
    console.log("Emergency mode activated!")
  }

  const handleCallContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleCPRVideo = () => {
    setShowCPRVideo(true)
  }

  const sosButtonVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(239, 68, 68, 0.7)",
        "0 0 0 20px rgba(239, 68, 68, 0)",
        "0 0 0 0 rgba(239, 68, 68, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 pb-24 md:pb-4">
      <motion.div 
        className="max-w-6xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="text-center"
          variants={cardVariants}
        >
          <h1 className="text-4xl font-bold text-red-600 mb-2">Emergency Response</h1>
          <p className="text-gray-600">Quick access to emergency services and contacts</p>
        </motion.div>

        {/* SOS Button - Hidden on mobile (will be fixed at bottom) */}
        <motion.div 
          className="hidden md:flex justify-center"
          variants={cardVariants}
        >
          <motion.button
            className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center group"
            variants={sosButtonVariants}
            initial="initial"
            animate="animate"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSOSClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-white text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
              <span className="text-lg font-bold">SOS</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Emergency Contacts */}
          <motion.div variants={cardVariants}>
            <Card className="h-full shadow-lg border-red-200">
              <CardHeader className="bg-red-50 border-b border-red-200">
                <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                  <Phone className="w-6 h-6" />
                  Emergency Contacts
                </h2>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      </div>
                      <Button
                        onClick={() => handleCallContact(contact.phone)}
                        className={`ml-3 ${
                          contact.type === 'emergency' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                        size="sm"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Live Location Map */}
          <motion.div variants={cardVariants}>
            <Card className="h-full shadow-lg border-red-200">
              <CardHeader className="bg-red-50 border-b border-red-200">
                <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                  <Navigation className="w-6 h-6" />
                  Your Location
                </h2>
              </CardHeader>
              <CardContent className="p-4">
                {userLocation ? (
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                    {/* Placeholder map with location indicator */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative">
                          <MapPin className="w-16 h-16 mx-auto mb-2 text-red-500 animate-pulse" />
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Location Active</p>
                        <p className="text-xs text-gray-500">
                          {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">GPS coordinates will be shared with emergency services</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2 text-red-400" />
                      <p className="text-sm">Requesting location...</p>
                      <p className="text-xs mt-1">Please allow location access for emergency services</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* CPR Guide with YouTube Video */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-lg border-red-200">
            <CardHeader className="bg-red-50 border-b border-red-200">
              <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                <Heart className="w-6 h-6" />
                CPR Guide
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Perform CPR</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                      <p>Check for responsiveness and call emergency services</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                      <p>Place hands on center of chest, interlock fingers</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                      <p>Push hard and fast - 100-120 compressions per minute</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                      <p>Give 2 rescue breaths after every 30 compressions</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <motion.button
                    className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCPRVideo}
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Status */}
        {isEmergencyActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">Emergency Mode Active</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Fixed SOS Button for Mobile - Bottom Center */}
      <motion.div 
        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center group"
          variants={sosButtonVariants}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSOSClick}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-white text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-1" />
            <span className="text-sm font-bold">SOS</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Emergency Alert
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to trigger Emergency Mode? This will:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li>• Contact emergency services</li>
                  <li>• Share your location</li>
                  <li>• Alert your emergency contacts</li>
                </ul>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmEmergency}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Alert Now
                  </Button>
                  <Button
                    onClick={() => setShowConfirmDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* CPR Video Dialog */}
      <AnimatePresence>
        {showCPRVideo && (
          <Dialog open={showCPRVideo} onOpenChange={setShowCPRVideo}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  CPR Training Video
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/-NodDRTsV88?autoplay=1"
                    title="CPR Training Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Watch this official CPR training video from the American Heart Association
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EmergencyMode 