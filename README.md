# 💖 LifeLine AI – Your AI-Powered Health Companion

LifeLine AI is your personal wellness and emergency assistant powered by AI. From tracking daily health habits to helping in critical situations, LifeLine AI is built to support you every step of the way.

---

## 🌟 Inspiration

- Many people delay help for health issues or lack awareness.
- Emergencies often cause panic — people don't know what to do.
- We wanted to build a **smart, always-available health assistant**.
- LifeLine AI helps users take charge of their health with AI-powered features, real-time insights, and quick emergency tools.

---

## 💡 Features

### 🧠 AI Chat Assistant
- Multi-agent system:
  - **Wellness Agent** – General health tips
  - **Symptom Agent** – Analyze your symptoms
  - **Emergency Agent** – Critical situation handling
- Interactive chat UI with auto-scroll and agent names
- Natural, empathetic AI replies via Hugging Face

### 📊 Health Dashboard
- **Mood Tracker** – Emoji-based selection
- **Water Tracker** – Tap cups to log intake (250ml/cup)
- **Sleep Tracker** – Log sleep hours per day
- **Weekly Summary** – Auto-generated insights based on your inputs
- **Charts** – Line chart for sleep, bar chart for water
- Fully responsive and animated UI with **Framer Motion**

### 🚨 Emergency Mode
- Glowing **SOS Button**
- Live **location tracking**
- List of **emergency contacts**
- Integrated **CPR guide video**

### 📄 Report Analyzer
- Upload PDF or image of medical report
- AI extracts:
  - 📄 Summary
  - 💊 Medicines (if any)
  - ⚠️ Warnings
- Powered by **Hugging Face** and OCR

### 🤒 Symptom Checker
- Enter symptoms in plain English
- AI returns:
  - 🔍 Possible Causes
  - ⚠️ Urgency Level
  - 🏠 Home Remedies
  - 🏥 When to See a Doctor

### 🔐 Authentication
- Login & Register with real-time validation
- Logged-in username appears dynamically
- Secure session via `localStorage`
- Clean logout flow

---

## 🚀 Tech Stack

- **Frontend**: Next.js, React.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **AI Integration**: Hugging Face APIs
- **OCR**: Built-in support (via Hugging Face for PDFs/images)
- **Design**: v0.dev, Dribbble, Flaticon

---

## 🛠️ How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Hugging Face API Token (free at [huggingface.co](https://huggingface.co))

### Installation

```bash
# Clone the repo
git clone https://github.com/deepanshubhalia/health-chat-assistant.git
cd health-chat-assistant

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Create environment files
# Backend: Create backend/.env
echo "HUGGINGFACE_API_KEY=your_actual_token_here" > backend/.env

# Frontend: Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local
```

### Running the Application

```bash
# Terminal 1: Start Backend Server
cd backend
npm run dev
# Backend runs on http://localhost:5001

# Terminal 2: Start Frontend Server
npm run dev
# Frontend runs on http://localhost:3000
```

### Getting Your Hugging Face API Token

1. Go to [huggingface.co](https://huggingface.co)
2. Sign up/Login
3. Go to Settings → Access Tokens
4. Create a new token
5. Copy and paste it in your `backend/.env` file

---

## 📁 Project Structure

```
health-chat-assistant/
├── components/          # React components
├── pages/              # Next.js pages
├── backend/            # Express.js backend
│   ├── server.js       # Main server file
│   └── .env           # Backend environment variables
├── public/            # Static assets
└── README.md          # This file
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

This application is for educational and informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
