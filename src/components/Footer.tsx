import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Mail, 
  Phone, 
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-20 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <img 
                  src="https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl" 
                  alt="Smart TVET Systems Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-display font-black text-white tracking-tight">
                Smart <span className="text-indigo-400">TVET</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed font-medium">
              Empowering TVET trainers with AI-driven tools to simplify curriculum planning and enhance vocational training quality across the globe.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Planner</Link></li>
              <li><Link to="/assessors-tool" className="hover:text-indigo-400 transition-colors">Assessors Tool</Link></li>
              <li><Link to="/assessors-guide" className="hover:text-indigo-400 transition-colors">Notes/Guides</Link></li>
              <li><Link to="/academic-architect" className="hover:text-indigo-400 transition-colors">Academic Architect</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display uppercase tracking-widest text-xs">Contact Us</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>support@smarttvet.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>+254 790 172 531</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>WhatsApp Support Available 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <p>© {currentYear} Smart TVET Systems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Powered by AI
            </span>
            <span>Made with ❤️ for Trainers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
