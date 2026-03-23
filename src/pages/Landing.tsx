import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Share2, 
  Users, 
  Zap, 
  ArrowRight,
  Layout,
  Cpu,
  Globe
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section - Modern SaaS Style */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-100/40 rounded-full blur-[100px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-100/30 rounded-full blur-[80px]"></div>
        </div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-3/5 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 tracking-wider uppercase">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered TVET Planning
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[0.9] mb-8">
                  Empowering <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">TVET Trainers</span>
                </h1>
                
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Plan lessons, create course outlines, and build session matrices in minutes. 
                  Spend less time on paperwork and more time training.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/dashboard"
                    className="btn-primary text-lg px-10 py-5 group"
                  >
                    Start Planning Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="btn-secondary text-lg px-10 py-5"
                  >
                    Learn More
                  </Link>
                </div>
                
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-50 grayscale">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Layout className="w-5 h-5" />
                    <span>CDACC Standards</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Cpu className="w-5 h-5" />
                    <span>AI-Driven</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Globe className="w-5 h-5" />
                    <span>Global Access</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:w-2/5 relative">
              <motion.div
                initial={{ opacity: 0, x: 50, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 2 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <div className="glass-card rounded-[2.5rem] p-3 shadow-2xl overflow-hidden">
                   <div className="bg-white rounded-[2rem] overflow-hidden shadow-inner aspect-[4/5] lg:aspect-[3/4] flex items-center justify-center border border-slate-100">
                      <img 
                        src="https://lh3.googleusercontent.com/d/1xK9tI7Xgsuhx7KGfShn6zXBI4dvWe9eo" 
                        alt="Smart TVET Systems Banner" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                   </div>
                </div>
                
                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 glass-card p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                    <div className="text-sm font-bold text-slate-900">Plan Generated</div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -right-6 glass-card p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">AI Speed</div>
                    <div className="text-sm font-bold text-slate-900">0.4s Processing</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">Built for Modern Trainers</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Everything you need to manage your TVET training materials and streamline your workflow with the power of Gemini AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-10 rounded-[2.5rem] hover:bg-slate-800 transition-all group">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Instant AI Generation</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                Generate full 9-column matrices and session plans from just a curriculum snippet. Our AI understands CDACC standards and crafts professional documentation in seconds.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-10 rounded-[2.5rem] hover:bg-slate-800 transition-all group">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Import</h3>
              <p className="text-slate-400 leading-relaxed">
                Upload existing PDFs or Word docs and let AI extract the structure for you. No more manual data entry.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-10 rounded-[2.5rem] hover:bg-slate-800 transition-all group">
              <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Share2 className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">One-Click Export</h3>
              <p className="text-slate-400 leading-relaxed">
                Download perfectly formatted .docx files ready for printing or submission. Professional layouts guaranteed.
              </p>
            </div>

            <div className="md:col-span-2 bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Community Driven</h3>
                <p className="text-indigo-100 text-lg leading-relaxed max-w-xl">
                  Join a growing community of TVET trainers sharing resources and enhancing the quality of vocational training across the globe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 p-16 lg:p-24 rounded-[3rem] shadow-2xl"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-slate-900 leading-tight">Ready to transform your <br /> <span className="text-indigo-600">training experience?</span></h2>
            <p className="text-slate-600 mb-12 max-w-2xl mx-auto text-xl leading-relaxed">
              Join thousands of trainers who are already saving hours every week with Smart TVET Systems.
            </p>
            <Link
              to="/dashboard"
              className="btn-primary text-xl px-12 py-6 inline-flex"
            >
              Start Planning Now
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
