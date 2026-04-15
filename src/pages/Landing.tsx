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
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24 lg:pt-0 lg:pb-0">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 items-center gap-16 lg:gap-24">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black mb-8 tracking-[0.2em] uppercase">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Next-Gen TVET Architecture
                </div>
                
                <h1 className="text-6xl lg:text-[100px] font-black tracking-tight text-slate-900 dark:text-white leading-[0.88] mb-8">
                  Architect <br />
                  <span className="text-indigo-600 dark:text-indigo-400 italic font-serif">Education.</span>
                </h1>
                
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-bold">
                  The AI-powered operating system for modern TVET trainers. 
                  Automate curriculum mapping, assessment generation, and session planning with surgical precision.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <Link
                    to="/dashboard"
                    className="btn-primary text-sm px-12 py-6 group rounded-full shadow-xl shadow-indigo-500/20"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="flex items-center justify-center gap-3 px-12 py-6 text-sm font-black text-slate-900 dark:text-white hover:text-indigo-600 transition-colors uppercase tracking-widest"
                  >
                    The Vision
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_64px_128px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="px-4 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-slate-700">
                      smart-tvet-systems.app
                    </div>
                    <div className="w-12"></div>
                  </div>
                  
                  {/* Populated UI Mockup */}
                  <div className="p-6 lg:p-10 grid lg:grid-cols-[200px_1fr] gap-10">
                    <div className="hidden lg:block space-y-8">
                      <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                        <Layout className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                      </div>
                      <div className="space-y-2 px-2">
                        {[
                          { icon: FileText, label: "Curriculum" },
                          { icon: Zap, label: "Assessments" },
                          { icon: Users, label: "Students" },
                          { icon: Globe, label: "Standards" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                            <item.icon className="w-4 h-4" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-8 px-2 space-y-4">
                        <div className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Storage</div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-indigo-500 rounded-full"></div>
                        </div>
                        <div className="text-[8px] font-bold text-slate-400 italic">64% used</div>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Recent Projects</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Architecture</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "KNQF 4", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30", icon: FileText },
                          { label: "CDACC Map", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30", icon: Zap },
                          { label: "Matrix", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30", icon: Layout }
                        ].map((card, i) => (
                          <div key={i} className={`${card.bg} p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center text-center`}>
                            <card.icon className={`w-6 h-6 ${card.color} mb-2`} />
                            <span className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{card.label}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Engine</div>
                              <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Stable</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                            <span>Mapping</span>
                            <span className="text-indigo-600">98%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "98%" }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                              className="h-full bg-indigo-600 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Micro-UI Elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -right-8 bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">Mapped</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By & Stats Section */}
      <section className="py-24 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="max-w-xs text-center lg:text-left">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Trusted By</h3>
              <div className="flex flex-wrap justify-center lg:justify-start gap-10 opacity-40 grayscale dark:invert">
                <div className="text-2xl font-black tracking-tighter">TVET-CDACC</div>
                <div className="text-2xl font-black tracking-tighter">KNQA</div>
                <div className="text-2xl font-black tracking-tighter">UNESCO</div>
              </div>
            </div>
            
            <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { val: "95%", label: "Time Saved" },
                { val: "100%", label: "Compliant" },
                { val: "0.4s", label: "AI Speed" },
                { val: "24/7", label: "Cloud Access" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{stat.val}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
              From curriculum to <br />
              <span className="text-indigo-600">classroom in seconds.</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
              Our streamlined workflow eliminates the friction of administrative planning.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {[
              {
                step: "01",
                title: "Upload Curriculum",
                desc: "Simply paste your curriculum text or upload a document. Our AI understands the structure immediately.",
                icon: FileText
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Gemini AI maps learning outcomes, performance criteria, and assessment methods with precision.",
                icon: Sparkles
              },
              {
                step: "03",
                title: "Export & Train",
                desc: "Download perfectly formatted Word documents ready for submission. Spend your time training.",
                icon: Share2
              }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-[120px] font-black text-slate-50 dark:text-slate-900/50 absolute -top-16 -left-4 -z-10 group-hover:text-indigo-50 dark:group-hover:text-indigo-900/20 transition-colors">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-8">
                  <item.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-40 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:60px_60px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-32">
            <div className="max-w-2xl">
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
                Engineered for <br />
                <span className="text-indigo-500">Excellence.</span>
              </h2>
              <p className="text-xl text-slate-400 font-bold leading-relaxed">
                We've combined deep TVET pedagogical knowledge with cutting-edge AI to create a tool that doesn't just work—it excels.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 border border-slate-800 rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-[0.3em] animate-spin-slow">
                Smart • TVET • Systems •
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Curriculum Mapping", icon: FileText, color: "text-indigo-400" },
              { title: "Assessment Gen", icon: Zap, color: "text-emerald-400" },
              { title: "Session Planning", icon: Layout, color: "text-amber-400" },
              { title: "Academic Architect", icon: Cpu, color: "text-rose-400" },
              { title: "Smart Import", icon: Globe, color: "text-violet-400" },
              { title: "Cloud Sync", icon: Share2, color: "text-sky-400" }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-10 rounded-[2.5rem] hover:bg-slate-800 transition-all group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 font-bold leading-relaxed">
                  Professional tools designed to meet national standards with automated precision.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-slate-900 dark:bg-slate-900 p-16 lg:p-24 rounded-[3rem] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-black mb-8 text-white leading-tight">Ready to architect <br /> <span className="text-indigo-400">your future?</span></h2>
              <p className="text-indigo-100/60 mb-12 max-w-2xl mx-auto text-xl font-bold leading-relaxed">
                Join thousands of trainers who are already saving hours every week with Smart TVET Systems.
              </p>
              <Link
                to="/dashboard"
                className="bg-white text-slate-900 hover:bg-indigo-50 text-sm font-black px-12 py-6 inline-flex rounded-full transition-all uppercase tracking-widest"
              >
                Start Planning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
