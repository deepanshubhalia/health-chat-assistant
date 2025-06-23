"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, HeartPulse, AlertTriangle, Search, Home, Stethoscope, MapPin } from "lucide-react";

interface SymptomResult {
  possibleCauses: string[];
  urgency: {
    level: 'Critical' | 'Moderate' | 'Mild';
    description: string;
  };
  homeRemedies: string[];
  whenToVisitDoctor: string;
  nearbyDoctors: { name: string; specialty: string; address: string }[];
}

export default function AISymptomChecker() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");

  const parseAIResponse = (response: string): SymptomResult => {
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
    let possibleCauses: string[] = [];
    let urgencyLevel: 'Critical' | 'Moderate' | 'Mild' = 'Mild';
    let urgencyDescription = '';
    let homeRemedies: string[] = [];
    let whenToVisitDoctor = '';
    let nearbyDoctors: { name: string; specialty: string; address: string }[] = [];

    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('🔍 Possible Causes:')) {
        currentSection = 'causes';
        continue;
      } else if (line.includes('⚠️ Urgency Level:')) {
        currentSection = 'urgency';
        continue;
      } else if (line.includes('🏠 Home Remedies') || line.includes('🏠 Home Remedies or Tips:')) {
        currentSection = 'remedies';
        continue;
      } else if (line.includes('🏥 When to See a Doctor:') || line.includes('🏥 When to Visit a Doctor:')) {
        currentSection = 'doctor';
        continue;
      }

      if (currentSection === 'causes' && line.startsWith('-')) {
        possibleCauses.push(line.substring(1).trim());
      } else if (currentSection === 'urgency') {
        if (line.includes('Critical')) {
          urgencyLevel = 'Critical';
        } else if (line.includes('Moderate') || line.includes('See Doctor Soon')) {
          urgencyLevel = 'Moderate';
        } else if (line.includes('Mild') || line.includes('Self-Care')) {
          urgencyLevel = 'Mild';
        }
        urgencyDescription = line;
      } else if (currentSection === 'remedies' && line.startsWith('-')) {
        homeRemedies.push(line.substring(1).trim());
      } else if (currentSection === 'doctor') {
        whenToVisitDoctor = line;
      }
    }

    // Add placeholder nearby doctors
    nearbyDoctors = [
      { name: "Dr. Sarah Johnson", specialty: "General Physician", address: "123 Health St, Wellness City" },
      { name: "Downtown Urgent Care", specialty: "Urgent Care Clinic", address: "456 Care Ave, Wellness City" }
    ];

    return {
      possibleCauses: possibleCauses.length > 0 ? possibleCauses : ['Common cold or flu', 'Stress-related symptoms'],
      urgency: {
        level: urgencyLevel,
        description: urgencyDescription || 'Symptoms appear to be manageable at home.'
      },
      homeRemedies: homeRemedies.length > 0 ? homeRemedies : ['Get adequate rest', 'Stay hydrated', 'Monitor symptoms'],
      whenToVisitDoctor: whenToVisitDoctor || 'If symptoms persist for more than a week or worsen, consult a healthcare provider.',
      nearbyDoctors
    };
  };

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError("Please describe your symptoms.");
      return;
    }
    
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch('http://localhost:5001/api/analyze-symptom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: input }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const data = await res.json();
      setResponse(data.answer || 'No response received');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColorClasses = (level: 'Critical' | 'Moderate' | 'Mild') => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'Mild':
        return 'bg-green-100 text-green-800 border-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-blue-50 flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
          className="text-center mb-8"
        >
          <div className="flex flex-col items-center">
            <div className="bg-white/70 rounded-full shadow-lg p-4 mb-3">
              <HeartPulse className="h-12 w-12 text-green-500 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 tracking-tight drop-shadow-lg">
              AI Symptom Checker
            </h1>
            <p className="text-base md:text-lg text-gray-600 font-medium">
              Get instant, AI-powered health insights
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
          className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-blue-100 mb-8"
        >
          <label htmlFor="symptoms" className="block text-lg font-semibold text-gray-700 mb-3">
            Describe your symptoms:
          </label>
          <textarea
            id="symptoms"
            className="w-full h-28 md:h-32 p-4 border border-gray-200 rounded-xl bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 placeholder-gray-400 text-base transition-all shadow-sm mb-2"
            placeholder="e.g. I feel dizzy and have a slight fever"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm mt-1 mb-2">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.03, background: 'linear-gradient(90deg,#34d399,#60a5fa)' }}
            whileTap={{ scale: 0.97 }}
            className="mt-2 w-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <motion.span
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
              >
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="tracking-wide animate-pulse">Analyzing...</span>
              </motion.span>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Check Symptoms
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {response && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-green-100 mb-4"
            >
              <div className="flex items-center mb-5">
                <HeartPulse className="h-8 w-8 text-green-500 mr-3 animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-800">AI Symptom Analysis</h2>
              </div>
              <div className="space-y-4">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base md:text-lg">
                  {response}
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50/70 rounded-lg border-l-4 border-blue-300">
                <p className="text-sm text-blue-800">
                  <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 