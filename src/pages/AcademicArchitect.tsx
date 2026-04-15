import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  FileText, 
  Download, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Loader2,
  Phone,
  Smartphone,
  X,
  Layers,
  Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

const AcademicArchitect: React.FC = () => {
  const { user, profile } = useAuth();
  const [courseTitle, setCourseTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [customLogo, setCustomLogo] = useState('');
  const [archType, setArchType] = useState<'curriculum' | 'outline' | 'mapping' | 'scheme' | 'resources'>('curriculum');
  const [generatedArch, setGeneratedArch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApiConfigured, setIsApiConfigured] = useState(false);

  useEffect(() => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const keyIsAvailable = !!apiKey && apiKey.trim() !== '' && apiKey !== 'undefined';
    setIsApiConfigured(keyIsAvailable);
    if (profile?.institutionLogo) setCustomLogo(profile.institutionLogo);
  }, [profile]);

  const handleGenerateArch = async () => {
    if (!isApiConfigured || !courseTitle) {
      setError('Please provide a Course Title and ensure API is configured.');
      return;
    }

    setIsLoading(true);
    setError('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const systemInstruction = `You are an Academic Architect and Curriculum Designer. Generate a professional ${archType === 'curriculum' ? 'Full Curriculum Structure' : archType === 'outline' ? 'Course Outline' : archType === 'mapping' ? 'Competency Map' : archType === 'scheme' ? 'Scheme of Work' : 'Resource List'} in HTML format.
      DO NOT use markdown blocks. Return ONLY HTML.
      Use professional formatting with clear tables (border="1") and hierarchical structures.
      
      If archType is 'curriculum': Generate a comprehensive structure including modules, credit hours, and prerequisites.
      If archType is 'outline': Generate a week-by-week course outline with learning objectives and assessment points.
      If archType is 'mapping': Generate a competency mapping matrix linking skills to industry standards.
      If archType is 'scheme': Generate a detailed Scheme of Work (12 weeks) showing topics, sub-topics, teaching methods, and resources.
      If archType is 'resources': Generate a comprehensive list of required training resources (tools, equipment, materials, and references) for the course.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Architect a ${archType} for the course: ${courseTitle} in the ${department} department. Ensure it follows international academic standards.`,
        config: { systemInstruction }
      });

      const html = response.text || '';
      const logoUrl = customLogo || profile?.institutionLogo || "https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl";
      const institutionName = profile?.institutionName || "SMART TVET SYSTEMS";

      setGeneratedArch(`
        <div class="prose max-w-none">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
            <img 
              src="${logoUrl}" 
              alt="${institutionName} Logo" 
              style="max-height: 60px; width: auto; display: inline-block; margin-bottom: 15px;" 
              referrerPolicy="no-referrer"
            />
            <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin: 0;">ACADEMIC ARCHITECT: ${archType.toUpperCase()}</h1>
            <p style="font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 600;">${institutionName.toUpperCase()} - ACADEMIC EXCELLENCE</p>
          </div>
          
          <div style="background-color: rgba(248, 250, 252, 0.5); padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; border: none;">
              <tr style="border: none;">
                <td style="padding: 8px 0; font-weight: 700; color: #64748b; width: 120px; font-size: 12px; text-transform: uppercase; border: none;">Course Title:</td>
                <td style="padding: 8px 0; font-weight: 800; font-size: 16px; border: none;">${courseTitle}</td>
              </tr>
              <tr style="border: none;">
                <td style="padding: 8px 0; font-weight: 700; color: #64748b; width: 120px; font-size: 12px; text-transform: uppercase; border: none;">Department:</td>
                <td style="padding: 8px 0; font-weight: 800; font-size: 16px; border: none;">${department || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 20px;">
            ${html}
          </div>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Generated by Smart TVET Systems AI • Academic Architect Series
          </div>
        </div>
      `);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error generating architecture.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeDownload = (html: string, titleSuffix: string) => {
    if (!html) return;
    const fileName = `${(courseTitle || 'Architecture').replace(/ /g, '_')}_${titleSuffix}.docx`;

    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: A4 portrait; margin: 0.5in; }
          body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #333; }
          h1, h2, h3 { text-align: center; text-transform: uppercase; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; border: 1pt solid #000; }
          th, td { border: 1pt solid #000; padding: 8pt; vertical-align: top; }
        </style>
      </head>
      <body>${html}</body>
      </html>`;
    
    const blob = new Blob([sourceHTML], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const handleDownload = () => {
    if (!generatedArch) return;
    executeDownload(generatedArch, archType);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc] dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-85 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200 dark:shadow-none animate-float">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">
            Academic<br />Architect
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <span className="h-1 w-8 bg-indigo-600 rounded-full"></span>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Curriculum Design</p>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Course Title</label>
            <input 
              type="text" 
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. Diploma in Civil Engineering"
              className="input-field"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Department</label>
            <input 
              type="text" 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Building & Civil Engineering"
              className="input-field"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Institution Logo URL</label>
            <input 
              type="text" 
              value={customLogo}
              onChange={(e) => setCustomLogo(e.target.value)}
              placeholder="Paste logo URL (Optional)"
              className="input-field"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Architecture Type</label>
            <div className="grid grid-cols-1 gap-3">
              {(['curriculum', 'outline', 'mapping', 'scheme', 'resources'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setArchType(type)}
                  className={cn(
                    "sidebar-item group",
                    archType === type ? "sidebar-item-active" : "sidebar-item-inactive"
                  )}
                >
                  <span className="font-bold">
                    {type === 'curriculum' ? 'Full Curriculum' : 
                     type === 'outline' ? 'Course Outline' : 
                     type === 'mapping' ? 'Competency Map' :
                     type === 'scheme' ? 'Scheme of Work' : 'Resource List'}
                  </span>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", archType === type ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleGenerateArch}
              disabled={isLoading || !isApiConfigured}
              className="btn-primary w-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-royal opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Architect Now
              </span>
            </button>
          </div>
        </div>

        <div className="mt-auto p-10">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="flex items-center gap-2 text-indigo-400 mb-3 relative z-10">
              <Map className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Standards</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed relative z-10">
              Design frameworks that align with international vocational training standards.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <header className="h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-12 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-display tracking-tight">Document Preview</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownload}
              disabled={!generatedArch}
              className="btn-primary py-3 px-8 text-xs disabled:opacity-30 disabled:grayscale"
            >
              <Download className="w-4 h-4" />
              Export Word
            </button>
          </div>
        </header>

        <div className="flex-grow overflow-auto p-16 flex flex-col items-center custom-scrollbar z-10">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-10 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-[2rem] flex items-start gap-5 text-rose-600 dark:text-rose-400 text-sm w-full max-w-3xl shadow-2xl shadow-rose-100/50 dark:shadow-none"
              >
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-grow pt-2 font-bold leading-relaxed">{error}</div>
                <button onClick={() => setError('')} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="relative mb-10">
                  <div className="w-24 h-24 border-[6px] border-indigo-50 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin" />
                  <Sparkles className="w-10 h-10 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 font-display tracking-tight">Architecting Framework</h3>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm font-bold leading-relaxed">Our AI is designing a comprehensive academic structure tailored to your course.</p>
              </motion.div>
            ) : !generatedArch ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-lg"
              >
                <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-800 mb-12 relative group">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] opacity-0 group-hover:opacity-5 transition-opacity blur-2xl"></div>
                  <Layers className="w-14 h-14 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-none scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight leading-tight">
                  Ready to <span className="text-indigo-600 dark:text-indigo-400">Architect?</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-12 font-bold">
                  Enter your course details in the sidebar to generate professional academic frameworks instantly.
                </p>
                <div className="flex flex-wrap justify-center gap-8">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outlines</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mapping</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheme of Work</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resources</span>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white dark:bg-slate-900 shadow-[0_48px_96px_-12px_rgba(15,23,42,0.12)] border border-slate-200 dark:border-slate-800 w-[8.27in] min-h-[11.69in] p-[0.75in] rounded-sm mb-24 relative overflow-hidden transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-royal to-indigo-600" />
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedArch }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AcademicArchitect;
