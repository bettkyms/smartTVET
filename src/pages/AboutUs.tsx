import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Award, 
  ShieldCheck, 
  Sparkles,
  Info,
  MessageCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-900 text-white overflow-hidden">
        {/* Background Banner */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/d/1xK9tI7Xgsuhx7KGfShn6zXBI4dvWe9eo" 
            alt="Banner" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/90 to-slate-900"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold mb-8 tracking-wider uppercase backdrop-blur-sm">
              <Info className="w-4 h-4 mr-2" />
              Our Story & Mission
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[0.9] tracking-tight font-display">
              Revolutionizing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">TVET Training</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
              We're on a mission to empower trainers with AI tools that simplify documentation, so they can focus on delivering high-quality vocational education.
            </p>
          </motion.div>
        </div>
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
      </section>

      {/* Mission & Vision - Modern Cards */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 dark:shadow-none group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium">
                To provide TVET trainers with cutting-edge AI tools that simplify the complex process of curriculum planning, assessment tool generation, and session delivery, allowing them to focus on what matters most: teaching.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl group"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-white mb-6 font-display tracking-tight">Our Vision</h2>
              <p className="text-slate-400 leading-relaxed text-lg font-medium">
                To become the leading digital ecosystem for TVET professionals, fostering a community where high-quality educational resources are accessible, affordable, and powered by intelligent automation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values - Bento Style */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight">Our Core Values</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium">The principles that guide everything we build and every trainer we support.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                desc: "Leveraging the latest AI technology to solve real-world educational challenges and streamline workflows.",
                icon: Sparkles,
                color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              },
              {
                title: "Integrity",
                desc: "Ensuring all materials generated meet the highest professional and ethical standards of TVET education.",
                icon: ShieldCheck,
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              },
              {
                title: "Community",
                desc: "Building a platform that empowers trainers to support each other, share knowledge, and grow together.",
                icon: Users,
                color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              }
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all"
              >
                <div className={`${value.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm`}>
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-display">{value.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Modern CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 lg:p-24 rounded-[3.5rem] shadow-2xl"
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-8 text-slate-900 dark:text-white leading-tight font-display tracking-tight">Get in Touch</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
              Have questions or need support? We're here to help you succeed in your TVET career.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="https://wa.me/254790172531" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary py-5 px-10 text-lg"
              >
                <MessageCircle className="w-6 h-6" />
                Chat on WhatsApp
              </a>
              <a 
                href="tel:+254790172531" 
                className="btn-secondary py-5 px-10 text-lg"
              >
                <Phone className="w-6 h-6" />
                Call Us Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
