import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AssessorsTool from './pages/AssessorsTool';
import AssessorsGuide from './pages/AssessorsGuide';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import AcademicArchitect from './pages/AcademicArchitect';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAppPage = ['/dashboard', '/assessors-tool', '/assessors-guide', '/academic-architect'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/assessors-tool" element={<AssessorsTool />} />
          <Route path="/assessors-guide" element={<AssessorsGuide />} />
          <Route path="/academic-architect" element={<AcademicArchitect />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/dashboard" 
            element={<Dashboard />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isAppPage && <Footer />}
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/254790172531" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-emerald-600 transition-all hover:scale-110 group"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help? Chat with us!
        </span>
      </a>
    </div>
  );
};

export default App;
