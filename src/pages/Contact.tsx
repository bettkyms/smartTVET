import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px] opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold mb-8 tracking-wider uppercase backdrop-blur-sm">
              <Mail className="w-4 h-4 mr-2" />
              Contact Our Team
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[0.9] tracking-tight font-display">
              Let's Start a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Conversation</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Have a question about our platform or need technical support? We're here to help you get the most out of Smart TVET Systems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-32 relative -mt-16 z-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 font-display">Contact Details</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">support@smarttvet.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">+254 790 172 531</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                      <MapPin className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">Nairobi, Kenya</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Connect on WhatsApp</p>
                  <a 
                    href="https://wa.me/254790172531" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Start Chatting
                  </a>
                </div>
              </div>

              <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <Sparkles className="w-10 h-10 mb-6 text-indigo-200" />
                  <h4 className="text-2xl font-bold mb-4 font-display">Need a Demo?</h4>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                    Schedule a personalized walkthrough of our AI tools with one of our experts.
                  </p>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all">
                    Book a Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 p-12 lg:p-16 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
                {formState === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 font-display">Message Sent!</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-sm mx-auto">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setFormState('idle')}
                      className="mt-12 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 font-display tracking-tight">Send us a Message</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-12 font-medium">Fill out the form below and we'll be in touch shortly.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="John Doe"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all font-medium dark:text-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                          <input 
                            required
                            type="email" 
                            placeholder="john@example.com"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all font-medium dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                        <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all font-medium appearance-none dark:text-white">
                          <option>General Inquiry</option>
                          <option>Technical Support</option>
                          <option>Billing Question</option>
                          <option>Feature Request</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                        <textarea 
                          required
                          rows={6}
                          placeholder="How can we help you?"
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all font-medium resize-none dark:text-white"
                        ></textarea>
                      </div>

                      <button 
                        type="submit"
                        disabled={formState === 'submitting'}
                        className="btn-primary w-full py-5 text-lg shadow-xl shadow-indigo-100 dark:shadow-none disabled:opacity-50"
                      >
                        {formState === 'submitting' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Send className="w-5 h-5" />
                            Send Message
                          </div>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
