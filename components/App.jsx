import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './Navbar';
import HealthDashboard from './HealthDashboard';

// Placeholder components for other pages
const Chat = React.lazy(() => import('./ChatInterface').then(m => ({ default: m.ChatInterface })));
const Analyze = React.lazy(() => import('./ReportAnalyzer'));
const Emergency = React.lazy(() => import('./EmergencyMode'));
const SymptomChecker = React.lazy(() => import('./AISymptomChecker'));

export default function App() {
  return (
    <Router>
      <React.Suspense fallback={<div className="text-center py-10">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <HealthDashboard />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Chat />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Analyze />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Emergency />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptom-checker"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <SymptomChecker />
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
} 