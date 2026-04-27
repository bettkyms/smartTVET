import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Sparkles, 
  LayoutDashboard, 
  Info, 
  Mail, 
  LogOut,
  User,
  ChevronDown,
  BookOpen,
  FileText,
  PenTool,
  ClipboardList,
  Settings,
  Layers,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/', icon: Sparkles },
    { name: 'Planner', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assessors Tool', path: '/assessors-tool', icon: PenTool },
    { name: 'Notes/Guides', path: '/curriculum-explorer', icon: BookOpen },
    { name: 'RoW', path: '/record-of-work', icon: ClipboardList },
    { name: 'Solver', path: '/screenshot-solver', icon: Zap },
    { name: 'Architect', path: '/academic-architect', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between h-18 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group py-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <img 
                  src="https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl" 
                  alt="Smart TVET Systems Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-display font-black text-slate-900 tracking-tight">
                Smart <span className="text-indigo-600">TVET</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <link.icon className={`w-4 h-4 ${isActive(link.path) ? 'text-indigo-600' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            ))}

            <div className="w-px h-6 bg-slate-100 mx-4" />

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-50 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold transition-all ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <link.icon className="w-6 h-6" />
                  {link.name}
                </Link>
              ))}
              <div className="pt-6">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full py-4 text-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
