"use client"
import { useState } from "react"
import { ChatInterface } from "@/components/ChatInterface"
import HealthDashboard from "@/components/HealthDashboard"
import EmergencyMode from "@/components/EmergencyMode"
import ReportAnalyzer from "@/components/ReportAnalyzer"
import AISymptomChecker from "@/components/AISymptomChecker"
import dynamic from 'next/dynamic';
const App = dynamic(() => import('../components/App'), { ssr: false });

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'emergency' | 'analyzer' | 'symptom'>('dashboard')

  return <App />;
}

export default Index
