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
  ClipboardCheck,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { getApiKey } from '../utils/apiKey';
import BrandingSection from '../components/BrandingSection';
import { useAuth } from '../contexts/AuthContext';

const AssessorsTool: React.FC = () => {
  const { user, profile } = useAuth();
  const [unitTitle, setUnitTitle] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [toolType, setToolType] = useState<'written' | 'practical' | 'rubric' | 'oral' | 'project' | 'portfolio' | 'self-assessment' | 'iv-form' | 'moderation' | 'feedback' | 'rpl'>('written');
  const [generatedTool, setGeneratedTool] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApiConfigured, setIsApiConfigured] = useState(false);

  useEffect(() => {
    const apiKey = getApiKey();
    const keyIsAvailable = !!apiKey;
    setIsApiConfigured(keyIsAvailable);
    if (profile?.institutionLogo) setCustomLogo(profile.institutionLogo);
    if (profile?.institutionName) setInstitutionName(profile.institutionName);
  }, [profile]);

  const handleGenerateTool = async () => {
    if (!isApiConfigured || !unitTitle) {
      setError('Please provide a Unit Title and ensure API is configured.');
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
        contents: `Generate a ${toolType} assessment tool for the unit: ${unitTitle} (${unitCode}). Ensure it follows CDACC standards.`,
        config: {
          systemInstruction: `You are a TVET CDACC Assessment Expert. Generate a professional ${toolType} assessment tool in HTML format.
      DO NOT use markdown blocks. Return ONLY HTML.
      Use professional tables with solid borders (border="1").
      
      If toolType is 'written': Generate a 20-question multiple choice and short answer test.
      If toolType is 'practical': Generate a detailed observation checklist with performance criteria.
      If toolType is 'rubric': Generate a comprehensive scoring rubric with levels (Excellent, Good, Fair, Poor).
      If toolType is 'oral': Generate a set of 10-15 oral interview questions with expected answers and a scoring guide.
      If toolType is 'project': Generate a detailed project assignment with instructions, requirements, and a marking scheme.
      If toolType is 'portfolio': Generate a Portfolio of Evidence (PoE) checklist listing required artifacts and evidence for the unit.
      If toolType is 'self-assessment': Generate a candidate self-assessment checklist where they rate their own competence against each performance criteria.
      If toolType is 'iv-form': Generate an Internal Verification (IV) form for pre-assessment verification of the tool's quality and alignment.
      If toolType is 'moderation': Generate a post-assessment moderation report template to ensure consistency in marking.
      If toolType is 'feedback': Generate a structured assessment feedback form for the candidate, highlighting strengths and areas for improvement.
      If toolType is 'rpl': Generate an RPL (Recognition of Prior Learning) assessment plan and evidence requirement matrix.`
        }
      });

      const html = response.text || '';
      const logoUrl = customLogo || profile?.institutionLogo || "https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl";
      const instName = institutionName || profile?.institutionName || "SMART TVET SYSTEMS";

      setGeneratedTool(`
        <div class="prose max-w-none">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
            <img 
              src="${logoUrl}" 
              alt="${instName} Logo" 
              style="max-height: 60px; width: auto; display: inline-block; margin-bottom: 15px;" 
              referrerPolicy="no-referrer"
            />
            <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin: 0;">Assessment Tool: ${toolType.toUpperCase()}</h1>
            <p style="font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 600;">${instName.toUpperCase()} - QUALITY ASSURANCE</p>
          </div>
          
          <div style="background-color: rgba(248, 250, 252, 0.5); padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; border: none;">
              <tr style="border: none;">
                <td style="padding: 8px 0; font-weight: 700; color: #64748b; width: 120px; font-size: 12px; text-transform: uppercase; border: none;">Unit Title:</td>
                <td style="padding: 8px 0; font-weight: 800; font-size: 16px; border: none;">${unitTitle}</td>
              </tr>
              <tr style="border: none;">
                <td style="padding: 8px 0; font-weight: 700; color: #64748b; width: 120px; font-size: 12px; text-transform: uppercase; border: none;">Unit Code:</td>
                <td style="padding: 8px 0; font-weight: 800; font-size: 16px; border: none;">${unitCode || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 20px;">
            ${html}
          </div>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Generated by Smart TVET Systems AI • Professional Assessment Series
          </div>
        </div>
      `);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error generating tool.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeDownload = (html: string, titleSuffix: string) => {
    if (!html) return;
    const fileName = `${(unitTitle || 'Assessment').replace(/ /g, '_')}_${titleSuffix}.docx`;

    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: A4 portrait; margin: 0.5in; }
          body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; border: 1pt solid #000; }
          th, td { border: 1pt solid #000; padding: 8pt; vertical-align: top; }
          h1, h2, h3 { color: #000; }
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
    if (!generatedTool) return;
    executeDownload(generatedTool, `Assessment_${toolType}`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto shadow-sm z-10">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100 dark:shadow-none">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Assessors Tool
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">CDACC Standard Tools</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Title</label>
            <input 
              type="text" 
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
              placeholder="e.g. Apply Plumbing Principles"
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 outline-none text-sm font-medium transition-all dark:text-white"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Code</label>
            <input 
              type="text" 
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              placeholder="e.g. CON/OS/PL/CR/01/6"
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 outline-none text-sm font-medium transition-all dark:text-white"
            />
          </div>

          <BrandingSection 
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            customLogo={customLogo}
            setCustomLogo={setCustomLogo}
          />

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tool Type</label>
            <div className="grid grid-cols-1 gap-3">
              {(['written', 'practical', 'rubric', 'oral', 'project', 'portfolio', 'self-assessment', 'iv-form', 'moderation', 'feedback', 'rpl'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setToolType(type)}
                  className={cn(
                    "px-5 py-3 rounded-2xl text-sm font-bold transition-all text-left capitalize flex items-center justify-between group",
                    toolType === type 
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none" 
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                  )}
                >
                  <span className="truncate mr-2">
                    {type === 'written' ? 'Written Test' : 
                     type === 'practical' ? 'Practical Test' : 
                     type === 'rubric' ? 'Scoring Rubric' : 
                     type === 'oral' ? 'Oral Interview' : 
                     type === 'project' ? 'Project Assignment' : 
                     type === 'portfolio' ? 'Portfolio Checklist' :
                     type === 'self-assessment' ? 'Self-Assessment' :
                     type === 'iv-form' ? 'IV Form (Pre-Assess)' :
                     type === 'moderation' ? 'Moderation Report' :
                     type === 'feedback' ? 'Candidate Feedback' : 'RPL Assessment'}
                  </span>
                  <ChevronRight className={cn("w-4 h-4 shrink-0 transition-transform", toolType === type ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleGenerateTool}
              disabled={isLoading || !isApiConfigured}
              className="btn-primary w-full py-4 text-sm shadow-xl shadow-indigo-100 dark:shadow-none disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Tool
            </button>
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-slate-50 dark:border-slate-800">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">CDACC Compliant</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium leading-relaxed">
              All generated tools follow the official TVET CDACC assessment guidelines.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col overflow-hidden relative">
        <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h2 className="font-black text-slate-900 dark:text-white font-display tracking-tight">Document Preview</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownload}
              disabled={!generatedTool}
              className="btn-primary py-2 px-6 text-xs shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-30"
            >
              <Download className="w-4 h-4" />
              Export Word
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-12 bg-slate-100/80 dark:bg-slate-950/80 flex flex-col items-center custom-scrollbar">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-[1.5rem] flex items-start gap-4 text-rose-600 dark:text-rose-400 text-sm w-full max-w-3xl shadow-xl shadow-rose-100/50 dark:shadow-none"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div className="flex-grow font-medium">{error}</div>
                <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors">
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
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 font-display">Crafting Your Tool</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs font-medium leading-relaxed">Our AI is analyzing CDACC standards to generate a professional assessment tool for you.</p>
              </motion.div>
            ) : !generatedTool ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-md"
              >
                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-800 mb-10 relative group">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] opacity-0 group-hover:opacity-10 transition-opacity blur-xl"></div>
                  <ClipboardCheck className="w-12 h-12 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 font-display tracking-tight">Ready to Generate?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-10 font-medium">
                  Enter your unit details in the sidebar and select the type of assessment tool you need. We'll handle the rest.
                </p>
                 <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Written</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Practical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Rubrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Oral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Project</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Portfolio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">IV Forms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Moderation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Feedback</span>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-200 dark:border-slate-800 w-[8.27in] min-h-[11.69in] p-[0.75in] rounded-sm mb-20 relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedTool }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AssessorsTool;
