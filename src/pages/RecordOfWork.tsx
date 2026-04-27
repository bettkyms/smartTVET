import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  ClipboardList, 
  Download, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ShieldCheck,
  Calendar,
  User,
  Building2,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { getApiKey } from '../utils/apiKey';
import BrandingSection from '../components/BrandingSection';
import { useAuth } from '../contexts/AuthContext';

const RecordOfWork: React.FC = () => {
  const { user, profile } = useAuth();
  const [unitTitle, setUnitTitle] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [numSessions, setNumSessions] = useState('10');
  const [workDescription, setWorkDescription] = useState('');
  const [generatedRow, setGeneratedRow] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [customLogo, setCustomLogo] = useState('');

  useEffect(() => {
    const apiKey = getApiKey();
    const keyIsAvailable = !!apiKey;
    setIsApiConfigured(keyIsAvailable);
    
    if (profile) {
      setTrainerName(profile.displayName || '');
      setInstitutionName(profile.institutionName || '');
      if (profile.institutionLogo) setCustomLogo(profile.institutionLogo);
    }
  }, [profile]);

  const handleGenerateRecord = async () => {
    if (!isApiConfigured || !unitTitle || !workDescription) {
      setError('Please provide Unit Title and Work Description.');
      return;
    }

    setIsLoading(true);
    setError('');

    const apiKey = getApiKey();
    if (!apiKey) {
      setError("Gemini API Key not found. If you are on Vercel, please provide VITE_GEMINI_API_KEY in project settings.");
      setIsLoading(false);
      return;
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a CDACC-compliant Record of Work table for ${numSessions} sessions. 
        Unit: ${unitTitle} (${unitCode}). 
        Work Description/Topic: ${workDescription}.
        
        The table should have these columns:
        1. Date
        2. Week/Session No.
        3. Work/Task Covered (Detailed learning activities)
        4. Trainees Present (Leave as a placeholder e.g. "___/___")
        5. Remarks/Self-Reflection
        6. Supervisor Signature (Placeholder)`,
        config: {
          systemInstruction: `You are a TVET CDACC Quality Assurance expert. Generate a professional Record of Work matrix in HTML.
          DO NOT use markdown blocks. Return ONLY HTML.
          Use a professional table with border="1" and width="100%".
          Create EXACTLY ${numSessions} rows.
          Flesh out the "Work Covered" column based on the provided topic, making each session progressive and logically sequenced.
          The Remarks should vary for each row (e.g. "Learning outcome achieved", "Trainees showed great interest", "Practical session successful", etc.)`
        }
      });

      const html = response.text || '';
      const logoUrl = customLogo || profile?.institutionLogo || "https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl";
      const inst = institutionName || "SMART TVET SYSTEMS";
      const now = new Date();
      const prepDate = now.toLocaleDateString('en-GB');

      setGeneratedRow(`
        <div class="row-wrapper">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
            <img 
              src="${logoUrl}" 
              alt="${inst} Logo" 
              style="max-height: 60px; width: auto; display: inline-block; margin-bottom: 10px;" 
              referrerPolicy="no-referrer"
            />
            <h1 style="font-size: 22px; font-weight: 800; text-transform: uppercase; margin: 5px 0; color: #0f172a;">Record of Work (Matrix)</h1>
            <p style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; margin: 0;">${inst} - Academic Departments</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 10px; font-weight: 700; background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; width: 25%;">Unit of Competency:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">${unitTitle}</td>
              <td style="padding: 10px; font-weight: 700; background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; width: 20%;">Unit Code:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">${unitCode || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 700; background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase;">Trainer Name:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${trainerName}</td>
              <td style="padding: 10px; font-weight: 700; background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase;">Date Prepared:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${prepDate}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            ${html}
          </div>

          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
             <div style="text-align: center; width: 45%;">
                <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
                <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Trainer's Signature & Date</p>
             </div>
             <div style="text-align: center; width: 45%;">
                <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
                <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Supervisor's Signature & Date</p>
             </div>
          </div>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Generated by Smart TVET Systems AI • Academic Management Series
          </div>
        </div>
      `);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error generating record of work.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedRow) return;
    const fileName = `${(unitTitle || 'Record_of_Work').replace(/ /g, '_')}_RoW.docx`;

    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: A4 portrait; margin: 0.5in; }
          body { font-family: 'Arial', sans-serif; font-size: 9pt; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; border: 1pt solid #000; }
          th, td { border: 1pt solid #000; padding: 5pt; vertical-align: top; }
          th { background-color: #f3f4f6; font-weight: bold; }
          h1, h2, h3 { color: #000; margin: 10pt 0 5pt 0; }
        </style>
      </head>
      <body>${generatedRow}</body>
      </html>`;
    
    const blob = new Blob([sourceHTML], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <aside className="w-85 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto shadow-sm z-10 custom-scrollbar">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100 dark:shadow-none">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Record of Work
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Academic Records Engine</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">General Information</label>
             </div>
             
             <div className="space-y-2">
                <input 
                  type="text" 
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  placeholder="Unit of Competency Title"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 outline-none text-sm font-bold transition-all dark:text-white"
                />
                <input 
                  type="text" 
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  placeholder="Unit Code (Optional)"
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 outline-none text-sm font-bold transition-all dark:text-white"
                />
             </div>
          </div>

          <BrandingSection 
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            customLogo={customLogo}
            setCustomLogo={setCustomLogo}
          />

          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Faculty Details</label>
             </div>
             <div className="space-y-2">
                <input 
                  type="text" 
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder="Trainer Name"
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold transition-all dark:text-white"
                />
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Record Parameters</label>
             </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500">Number of Sessions</span>
                <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{numSessions}</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="1"
                value={numSessions}
                onChange={(e) => setNumSessions(e.target.value)}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Work Description / Topics</label>
            <textarea 
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Describe the topics covered during these sessions..."
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 outline-none text-sm font-medium transition-all dark:text-white resize-none"
            />
          </div>

          <button 
            onClick={handleGenerateRecord}
            disabled={isLoading || !isApiConfigured}
            className="btn-primary w-full py-5 text-sm shadow-2xl shadow-indigo-500/20 disabled:opacity-50 group"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
            Generate Records
          </button>
        </div>

        <div className="mt-auto p-8 border-t border-slate-50 dark:border-slate-800">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">QA Standards</span>
            </div>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-500 font-medium leading-relaxed">
              Auto-generated records align with TVET CDACC internal verification and auditing requirements.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col overflow-hidden relative">
        <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-10 shrink-0 z-10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <h2 className="font-display font-black text-slate-900 dark:text-white tracking-tight">Record Preview</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownload}
              disabled={!generatedRow}
              className="btn-primary py-2.5 px-8 text-xs shadow-xl shadow-indigo-500/20 disabled:opacity-30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Word
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-12 bg-slate-100/60 dark:bg-slate-950/60 flex flex-col items-center custom-scrollbar">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="mb-8 p-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl flex items-start gap-4 text-rose-600 dark:text-rose-400 text-sm w-full max-w-3xl shadow-xl shadow-rose-100/50"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div className="flex-grow font-bold">{error}</div>
                <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="relative mb-10">
                  <div className="w-24 h-24 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin" />
                  <Sparkles className="w-10 h-10 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 font-display">Generating Matrix</h3>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-xs font-bold leading-relaxed">
                  Sequencing work activities and reflections based on your session topics...
                </p>
              </motion.div>
            ) : !generatedRow ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-xl"
              >
                <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-800 mb-12 relative group cursor-pointer">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] opacity-0 group-hover:opacity-10 transition-all blur-2xl scale-110"></div>
                  <ClipboardList className="w-16 h-16 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 transition-all group-hover:scale-110 rotate-3 group-hover:rotate-0" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight leading-tight">
                  Automate your <br />
                  <span className="text-indigo-600 italic">Record of Work.</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-12 font-bold px-4">
                  Fill in your unit details and session topics. We'll generate a professional, sequenced record of work matrix compliant with CDACC standards.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Internal Audit Ready</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">AI Sequence Logic</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.18)] border border-slate-200 dark:border-slate-800 w-[8.27in] min-h-[11.69in] p-[0.6in] rounded-xl mb-32 relative group"
              >
                <div className="absolute -top-1 px-10 left-0 right-0 flex gap-1">
                   {[...Array(12)].map((_, i) => (
                      <div key={i} className="flex-grow h-1 bg-indigo-600/10 rounded-full" />
                   ))}
                </div>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: generatedRow }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RecordOfWork;
