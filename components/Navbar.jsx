import React, { useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Chat', path: '/chat' },
  { name: 'Symptom Checker', path: '/symptom-checker' },
  { name: 'Report Analyzer', path: '/analyze' },
  { name: 'Emergency', path: '/emergency' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = localStorage.getItem('lifeline_name') || 'User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Framer Motion variants
  const menuVariants = {
    closed: { x: '100%' },
    open: { x: 0 },
  };

  return (
    <nav className="w-full z-30">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-200 via-blue-100 to-blue-200 shadow-lg mb-6 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl text-blue-700">LifeLine AI</span>
          <span className="hidden md:inline text-gray-500 text-base ml-2">|</span>
          <span className="hidden md:inline text-base text-gray-700">👋 Hello, <span className="font-semibold text-green-700">{name}</span>!</span>
        </div>
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-2 md:gap-4 items-center">
          {navItems.map(item => (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
            >
              <NavLink
                to={item.path}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-md'
                    : 'text-blue-700 hover:bg-blue-100 hover:text-green-700'
                }`}
              >
                {item.name}
              </NavLink>
            </motion.div>
          ))}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="ml-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-all"
          >
            Logout
          </motion.button>
        </div>
        {/* Hamburger for Mobile */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-7 h-7 text-blue-700" />
        </button>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed top-0 right-0 w-4/5 max-w-xs h-full bg-gradient-to-br from-green-100 via-blue-50 to-blue-200 shadow-2xl z-50 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-xl text-blue-700">LifeLine AI</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Close menu"
              >
                <X className="w-7 h-7 text-blue-700" />
              </button>
            </div>
            <span className="text-base text-gray-700 mb-6">👋 Hello, <span className="font-semibold text-green-700">{name}</span>!</span>
            <div className="flex flex-col gap-3 flex-1">
              {navItems.map(item => (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <NavLink
                    to={item.path}
                    className={`block px-4 py-3 rounded-xl font-medium text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-md'
                        : 'text-blue-700 hover:bg-blue-100 hover:text-green-700'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="mt-8 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-all text-lg"
            >
              Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 