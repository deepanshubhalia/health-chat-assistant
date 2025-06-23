import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Heart, Shield, Activity, Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem('lifeline_user'));
    setTimeout(() => {
      setIsLoading(false);
      if (user && user.email === email && user.password === password) {
        localStorage.setItem('lifeline_logged_in', 'true');
        localStorage.setItem('lifeline_name', user.name);
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-teal-300 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-1000">
        <div className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-blue-200/20 rounded-2xl">
          <div className="text-center space-y-6 pb-8 pt-8">
            {/* Logo/Brand Section */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-gradient-to-br from-green-400 to-teal-400 shadow-md">
                  <Activity className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                LifeLine AI
              </h1>
              <p className="text-gray-600 text-sm font-medium">Your personal health assistant</p>
            </div>
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Heart className="h-3 w-3" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
          <div className="space-y-6 px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-700 font-medium text-sm flex items-center gap-2">
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`h-12 w-full bg-white/70 border-2 transition-all duration-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pl-12 pr-4 rounded-xl ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200'}`}
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-gray-700 font-medium text-sm flex items-center gap-2">
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className={`h-12 w-full bg-white/70 border-2 transition-all duration-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pl-12 pr-12 rounded-xl ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200'}`}
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200 text-center">
                  {error}
                </p>
              )}
              {/* Forgot Password Link */}
              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                >
                  Sign up here
                </Link>
              </p>
            </div>
            {/* Footer Trust Message */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">Trusted by healthcare professionals worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 