"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import axios from "axios"
import BlurText from "./BlurText"

interface WaterData {
  date: string
  dayName: string
  amount: number
}

interface SleepData {
  date: string
  dayName: string
  hours: number
}

// Debounce utility
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

const HealthDashboard = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [waterIntake, setWaterIntake] = useState(0)
  const [filledCups, setFilledCups] = useState<boolean[]>(new Array(8).fill(false))
  const [sleepHours, setSleepHours] = useState(7)
  const [waterData, setWaterData] = useState<WaterData[]>([])
  const [sleepData, setSleepData] = useState<SleepData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('');

  const moods = ["😞", "😐", "🙂", "😃", "🤩"]
  const moodMessages = [
    "Sorry you're feeling down. Take it easy and remember to care for yourself.",
    "It's okay to feel neutral. Maybe a walk or some music will help!",
    "Glad you're feeling good! Keep up the positive vibes.",
    "Awesome! Spread your happiness today!",
    "You're on top of the world! Keep shining! 🌟"
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [waterResponse, sleepResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/water/week'),
        axios.get('http://localhost:5001/api/sleep/week')
      ]);
      
      const today = new Date().toISOString().split('T')[0];

      if (waterResponse.data) {
        setWaterData(waterResponse.data);
        const todayWater = waterResponse.data.find((w: WaterData) => w.date === today);
        if (todayWater) {
          setWaterIntake(todayWater.amount);
          setFilledCups(new Array(8).fill(false).map((_, i) => i < Math.floor(todayWater.amount / 250)));
        }
      }

      if (sleepResponse.data) {
        setSleepData(sleepResponse.data);
        const todaySleep = sleepResponse.data.find((s: SleepData) => s.date === today);
        if (todaySleep) {
          setSleepHours(todaySleep.hours);
        }
      }
      
    } catch (err: any) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const name = localStorage.getItem('lifeline_name') || 'User';
    setUserName(name);
  }, []);

  const handleCupClick = async (index: number) => {
    const cupsToFill = filledCups[index] && index === filledCups.filter(Boolean).length - 1 ? index : index + 1;
    const newWaterIntake = cupsToFill * 250;

    const today = new Date().toISOString().split('T')[0];
    const oldWaterData = [...waterData];

    // Optimistic UI Update
    setFilledCups(new Array(8).fill(false).map((_, i) => i < cupsToFill));
    setWaterIntake(newWaterIntake);
    setWaterData(prevData => {
        const newData = [...prevData];
        const todayEntryIndex = newData.findIndex(d => d.date === today);
        if (todayEntryIndex !== -1) {
            newData[todayEntryIndex] = { ...newData[todayEntryIndex], amount: newWaterIntake };
        }
        return newData;
    });

    try {
      await axios.post('http://localhost:5001/api/water', {
        date: today,
        amount: newWaterIntake
      });
    } catch (error) {
      console.error('Error updating water intake:', error);
      // Revert on error
      setWaterData(oldWaterData);
      const oldTodayData = oldWaterData.find(d => d.date === today);
      if (oldTodayData) {
        const oldCupsToFill = Math.floor(oldTodayData.amount / 250);
        setFilledCups(new Array(8).fill(false).map((_, i) => i < oldCupsToFill));
        setWaterIntake(oldTodayData.amount);
      }
      setError('Failed to update water intake. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const saveSleep = async (hours: number) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await axios.post('http://localhost:5001/api/sleep', {
        date: today,
        hours: hours
      });
    } catch (error) {
      console.error('Error updating sleep hours:', error);
      setError('Failed to save sleep data.');
      fetchData(); // Revert to server state
      setTimeout(() => setError(null), 3000);
    }
  };

  const debouncedSaveSleep = useCallback(debounce(saveSleep, 500), []);

  const handleSleepChange = (hours: number) => {
    setSleepHours(hours);

    const today = new Date().toISOString().split('T')[0];
    setSleepData(prevData => {
      const newData = [...prevData];
      const todayEntryIndex = newData.findIndex(d => d.date === today);
      if (todayEntryIndex !== -1) {
        newData[todayEntryIndex] = { ...newData[todayEntryIndex], hours: hours };
      }
      return newData;
    });

    debouncedSaveSleep(hours);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getWeeklySummary = () => {
    const avgWater = waterData.length > 0 ? waterData.reduce((sum, day) => sum + day.amount, 0) / waterData.length : 0;
    const avgSleep = sleepData.length > 0 ? sleepData.reduce((sum, day) => sum + day.hours, 0) / sleepData.length : 0;
    
    return {
      sleep: `Your average sleep on a day is ${avgSleep.toFixed(1)} hours.`,
      water: `You're averaging ${Math.round(avgWater)}ml of water daily. Keep drinking more water!`
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  const chartVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wellness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-blue-200 flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="bg-white/90 shadow-2xl rounded-3xl px-8 py-8 flex flex-col items-center mb-8">
          <BlurText
            text={`${getGreeting()}, ${userName}!`}
            delay={100}
            animateBy="words"
            direction="top"
            className="text-3xl font-bold text-blue-700 mb-2"
          />
          <p className="text-lg text-gray-700">Ready to track your wellness journey today?</p>
        </div>
        {/* Error Banner */}
        {error && (
          <motion.div 
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <motion.div 
          className="max-w-4xl mx-auto space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mood Tracker */}
          <motion.div 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            variants={cardVariants}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How are you feeling today?</h2>
            <div className="flex justify-center space-x-4">
              {moods.map((mood, index) => (
                <motion.button
                  key={index}
                  className={`text-4xl p-3 rounded-2xl transition-all duration-200 ${
                    selectedMood === index 
                      ? 'ring-4 ring-teal-200 bg-teal-50 scale-110' 
                      : 'hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(index)}
                >
                  {mood}
                </motion.button>
              ))}
            </div>
            {selectedMood !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4 text-center"
              >
                <span className="inline-block bg-gradient-to-r from-blue-100 to-green-100 text-teal-700 px-5 py-3 rounded-2xl shadow font-medium text-base md:text-lg">
                  {moodMessages[selectedMood]}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Water Intake Tracker */}
          <motion.div 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            variants={cardVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Water Intake</h2>
              <span className="text-2xl font-bold text-sky-600">{waterIntake}ml</span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {filledCups.map((filled, index) => (
                <motion.button
                  key={index}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    filled 
                      ? 'bg-sky-500 border-sky-500 text-white' 
                      : 'border-sky-300 text-sky-400 hover:border-sky-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCupClick(index)}
                >
                  {filled ? '💧' : '🥤'}
                </motion.button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">Click cups to track your intake (250ml each)</p>
          </motion.div>

          {/* Sleep Tracker */}
          <motion.div 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            variants={cardVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Sleep Pattern</h2>
              <span className="text-2xl font-bold text-indigo-600">{sleepHours} hrs</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avg sleep on day: {sleepHours} hrs
              </label>
              <input
                type="range"
                min="5"
                max="13"
                step="0.5"
                value={sleepHours}
                onChange={(e) => handleSleepChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5h</span>
                <span>9h</span>
                <span>13h</span>
              </div>
            </div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sleep Chart */}
            <motion.div 
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
              variants={chartVariants}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sleep Pattern</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dayName" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Water Chart */}
            <motion.div 
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
              variants={chartVariants}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Water Intake</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dayName" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Weekly Summary */}
          <motion.div 
            className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl p-6 shadow-lg text-white"
            variants={cardVariants}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4">Weekly Summary</h2>
            <div className="space-y-3">
              <p className="text-teal-50">{getWeeklySummary().sleep}</p>
              <p className="text-teal-50">{getWeeklySummary().water}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

export default HealthDashboard 