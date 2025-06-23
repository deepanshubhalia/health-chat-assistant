let waterData = [];
let sleepData = [];

const initializeData = () => {
  waterData = [];
  sleepData = [];
  const today = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = daysOfWeek[date.getDay()];
    
    const existingWater = waterData.find(w => w.date === dateStr);
    if (!existingWater) {
      waterData.push({
        date: dateStr,
        dayName: dayName,
        amount: Math.floor(Math.random() * 1000) + 500
      });
    }
    
    const existingSleep = sleepData.find(s => s.date === dateStr);
    if (!existingSleep) {
      sleepData.push({
        date: dateStr,
        dayName: dayName,
        hours: Math.floor(Math.random() * 3) + 6
      });
    }
  }
};

initializeData();

module.exports = {
  waterData,
  sleepData,
  initializeData
}; 