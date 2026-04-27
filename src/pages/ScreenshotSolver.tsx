import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Sparkles, 
  Loader2, 
  X, 
  AlertCircle,
  Download,
  ArrowLeft,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandingSection from '../components/BrandingSection';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { cn } from '../utils/cn';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 my-6 overflow-x-auto" ref={ref}>
      {chart}
    </div>
  );
};

const ScreenshotSolver: React.FC = () => {
  const { user, profile } = useAuth();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const keyIsAvailable = !!apiKey && apiKey.trim() !== '' && apiKey !== 'undefined';
    setIsApiConfigured(keyIsAvailable);
    if (profile?.institutionLogo) setCustomLogo(profile.institutionLogo);
    if (profile?.institutionName) setInstitutionName(profile.institutionName);
  }, [profile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const solveProblem = async () => {
    if (!screenshot) return;
    if (!isApiConfigured) {
      setError('API Key is not configured. Please check your environment variables.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis('');
    setError('');

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
      setError("Gemini API Key not found. Please check your environment variables.");
      setIsAnalyzing(false);
      return;
    }
    const ai = new GoogleGenAI({ apiKey: apiKey as string });

    try {
      const base64Data = screenshot.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Analyze this image of an educational problem, question, or diagram. Provide a clear, step-by-step explanation and the final solution." },
            { inlineData: { data: base64Data, mimeType: "image/png" } }
          ]
        },
        config: {
          systemInstruction: `You are an expert TVET technical tutor. Your goal is to solve educational problems from screenshots with extreme clarity and step-by-step logic.

CRITICAL RULES:
1. DO NOT use the '$' symbol for mathematical notation. Use plain text, standard symbols (like ^, *, /, sqrt), or HTML entities.
2. For any diagrams, flowcharts, or visual structures needed to explain the problem, use Mermaid.js code blocks (e.g., \`\`\`mermaid ... \`\`\`).
3. Ensure mathematical answers are clean, well-spaced, and easy to read.
4. Format your response in Markdown. Use bold text for emphasis and clear numbered steps.
5. If the problem is technical (e.g., electrical, mechanical), use professional terminology suitable for TVET students.`
        }
      });

      setAnalysis(response.text || '');
    } catch (err: any) {
      console.error(err);
      setError("Error analyzing the screenshot. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadSolution = () => {
    if (!analysis) return;
    const fileName = `Solution_${new Date().getTime()}.docx`;
    const logoUrl = customLogo || profile?.institutionLogo || "https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl";
    const instName = institutionName || profile?.institutionName || "SMART TVET SYSTEMS";

    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: A4 portrait; margin: 1in; }
          body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
          h1, h2, h3 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 20px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
          .logo { max-height: 60px; width: auto; display: inline-block; margin-bottom: 15px; }
          .inst-name { font-size: 18px; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a; }
          .doc-title { font-size: 14px; font-weight: 600; color: #64748b; margin: 5px 0 0 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 700; color: #1e293b; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" alt="Logo" class="logo" />
          <h1 class="inst-name">${instName}</h1>
          <p class="doc-title">SMART TVET AI SOLUTION SERVICE</p>
        </div>
        <div class="content">
          ${analysis.replace(/\n/g, '<br/>')}
        </div>
      </body>
      </html>`;

    const blob = new Blob([sourceHTML], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-grow flex flex-col">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 dark:shadow-none">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                Screenshot <span className="text-indigo-600">Solver</span>
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl">
              Upload a photo of any technical problem, diagram, or question. Our AI will analyze it and provide a detailed, step-by-step solution instantly.
            </p>
          </div>
          
          {analysis && (
            <button 
              onClick={downloadSolution}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Solution
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-grow">
          {/* Left Side: Upload & Preview */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Input Image</h2>
                {screenshot && (
                  <button 
                    onClick={() => { setScreenshot(null); setAnalysis(''); }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <BrandingSection 
                institutionName={institutionName}
                setInstitutionName={setInstitutionName}
                customLogo={customLogo}
                setCustomLogo={setCustomLogo}
                className="mb-8"
              />
              <div className="flex-grow flex flex-col">
                {!screenshot ? (
                  <div className="flex-grow relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full min-h-[400px] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-6 bg-slate-50/50 dark:bg-slate-800/30 group-hover:border-indigo-500 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-all duration-500">
                      <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Drop your screenshot here</p>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">or click to browse files</p>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700" />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supports PNG, JPG, WEBP</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow space-y-8 flex flex-col">
                    <div className="flex-grow bg-slate-50 dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 relative group shadow-inner">
                      <img 
                        src={screenshot} 
                        alt="Problem to solve" 
                        className="w-full h-full object-contain p-4"
                      />
                      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all pointer-events-none" />
                    </div>
                    
                    <button 
                      onClick={solveProblem}
                      disabled={isAnalyzing || !screenshot}
                      className="w-full btn-primary py-6 text-base shadow-2xl shadow-indigo-200 dark:shadow-none group"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Analyzing Problem...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                          Generate Step-by-Step Solution
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Solution */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">AI Solution</h2>
                {analysis && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                {isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full animate-pulse" />
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin absolute inset-0 m-auto" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">Solving Your Problem...</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs">
                      Our technical AI is breaking down the diagram and calculating the steps. This usually takes a few seconds.
                    </p>
                  </div>
                ) : analysis ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const lang = match ? match[1] : '';
                          
                          if (lang === 'mermaid') {
                            return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                          }
                          
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {analysis}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                      <ImageIcon className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">No Solution Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs">
                      Upload an image and click "Solve" to see the step-by-step breakdown here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-rose-600 text-white rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScreenshotSolver;
