import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  FileText, 
  Download, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Layers,
  BookOpen,
  Presentation,
  Upload,
  LayoutDashboard,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import mammoth from "mammoth";

interface Subtopic {
  title: string;
  description: string;
}

interface Topic {
  title: string;
  subtopics: Subtopic[];
}

interface Module {
  title: string;
  topics: Topic[];
}

interface CurriculumStructure {
  courseTitle: string;
  modules: Module[];
}

const CurriculumExplorer: React.FC = () => {
  const { user, profile } = useAuth();
  const [curriculumInput, setCurriculumInput] = useState('');
  const [sessionPlanInput, setSessionPlanInput] = useState('');
  const [isDashboardGenerated, setIsDashboardGenerated] = useState(false);
  const [curriculumData, setCurriculumData] = useState<CurriculumStructure | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: 'topic' | 'subtopic', title: string, parentTitle?: string } | null>(null);
  const [activeContentMode, setActiveContentMode] = useState<'notes' | 'quiz' | 'tutor'>('notes');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customLogo, setCustomLogo] = useState('');
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [activeMode, setActiveMode] = useState<'curriculum' | 'sessionPlan'>('curriculum');

  useEffect(() => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const keyIsAvailable = !!apiKey && apiKey.trim() !== '' && apiKey !== 'undefined';
    setIsApiConfigured(keyIsAvailable);
    if (profile?.institutionLogo) setCustomLogo(profile.institutionLogo);
  }, [profile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'curriculum' | 'sessionPlan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (type === 'curriculum') setCurriculumInput(result.value);
      else setSessionPlanInput(result.value);
    } else if (extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'curriculum') setCurriculumInput(event.target?.result as string);
        else setSessionPlanInput(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a .docx or .txt file.');
    }
  };

  const generateDashboard = async () => {
    if (!isApiConfigured || !curriculumInput.trim()) {
      setError('Please provide curriculum content and ensure API is configured.');
      return;
    }

    setIsLoading(true);
    setError('');

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey as string });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following curriculum and extract a structured dashboard with modules, topics, and subtopics.
        
        CURRICULUM CONTENT:
        ${curriculumInput}
        
        Return the data as a JSON object following this structure:
        {
          "courseTitle": "Title of the Course",
          "modules": [
            {
              "title": "Module Title",
              "topics": [
                {
                  "title": "Topic Title",
                  "subtopics": [
                    { "title": "Subtopic Title", "description": "Brief description" }
                  ]
                }
              ]
            }
          ]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              courseTitle: { type: Type.STRING },
              modules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    topics: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          subtopics: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setCurriculumData(data);
      setIsDashboardGenerated(true);
    } catch (err: any) {
      console.error(err);
      setError("Error generating dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateNotes = async (title: string, type: 'topic' | 'subtopic', parentTitle?: string) => {
    setSelectedItem({ type, title, parentTitle });
    setActiveContentMode('notes');
    setIsGeneratingNotes(true);
    setGeneratedNotes('');
    setGeneratedQuiz('');
    setChatMessages([]);

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey as string });

    try {
      const prompt = type === 'subtopic' 
        ? `Generate comprehensive technical notes for the subtopic "${title}" which is part of the topic "${parentTitle}" in the course "${curriculumData?.courseTitle}". Include definitions, key concepts, examples, and a summary.`
        : `Generate comprehensive technical notes for the topic "${title}" in the course "${curriculumData?.courseTitle}". Provide a high-level overview and then detailed notes for its core components.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert TVET educator. Generate professional, clear, and detailed technical notes in HTML format. Use proper headings, bullet points, and tables where necessary."
        }
      });

      setGeneratedNotes(response.text || '');
    } catch (err: any) {
      console.error(err);
      setError("Error generating notes.");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const generateQuiz = async () => {
    if (!selectedItem) return;
    setActiveContentMode('quiz');
    if (generatedQuiz) return;
    
    setIsGeneratingQuiz(true);
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey as string });

    try {
      const prompt = `Generate a comprehensive quiz for the ${selectedItem.type} "${selectedItem.title}" in the course "${curriculumData?.courseTitle}". 
      Include 5 Multiple Choice Questions and 5 True/False questions. 
      Provide the answers at the end.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert TVET assessor. Generate a professional quiz in HTML format. Use clear formatting, radio-button style indicators (non-functional), and a hidden or separate answer key section."
        }
      });

      setGeneratedQuiz(response.text || '');
    } catch (err: any) {
      console.error(err);
      setError("Error generating quiz.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedItem) return;
    
    const userMsg = { role: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey as string });

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are an expert TVET Tutor. You are helping a student with the ${selectedItem.type} "${selectedItem.title}" in the course "${curriculumData?.courseTitle}". 
          Provide clear, helpful, and technically accurate answers. Use examples where possible.`
        }
      });

      const response = await chat.sendMessage({ message: chatInput });
      const modelMsg = { role: 'model' as const, text: response.text || '' };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setError("Error in AI Tutor.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateSessionPlanNotes = async (target: 'notes' | 'ppt') => {
    if (!sessionPlanInput.trim()) {
      setError('Please provide session plan content.');
      return;
    }

    setIsLoading(true);
    setError('');

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey as string });

    try {
      const prompt = target === 'notes'
        ? `Generate detailed training notes based on this session plan:\n\n${sessionPlanInput}`
        : `Generate a structured PowerPoint presentation outline (Slide by Slide) based on this session plan. For each slide, provide a Title and Bullet Points for content:\n\n${sessionPlanInput}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are a professional corporate trainer. Generate ${target === 'notes' ? 'comprehensive training notes' : 'a structured PPT outline'} in HTML format.`
        }
      });

      setGeneratedNotes(response.text || '');
      setSelectedItem({ type: 'topic', title: target === 'notes' ? 'Session Notes' : 'PPT Outline' });
    } catch (err: any) {
      console.error(err);
      setError("Error generating content from session plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadNotes = () => {
    if (!generatedNotes) return;
    const fileName = `${selectedItem?.title.replace(/ /g, '_')}_Notes.docx`;
    const logoUrl = customLogo || profile?.institutionLogo || "https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl";
    const institutionName = profile?.institutionName || "Smart TVET Systems";

    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: A4 portrait; margin: 1in; }
          body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
          h1, h2, h3 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 30px;">
          <img 
            src="${logoUrl}" 
            alt="${institutionName} Logo" 
            style="max-height: 60px; width: auto; display: inline-block; margin-bottom: 15px;" 
          />
          <h1 style="margin: 0; font-size: 24px;">${selectedItem?.title}</h1>
          <p style="color: #64748b; font-size: 14px;">${institutionName} - ${curriculumData?.courseTitle || 'Academic Excellence'}</p>
        </div>
        ${generatedNotes}
      </body>
      </html>`;
    
    const blob = new Blob([sourceHTML], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Controls */}
      <aside className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto z-20 shadow-xl">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-100 dark:shadow-none">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">
            Notes &<br />Guides
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <span className="h-1 w-8 bg-indigo-600 rounded-full"></span>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Curriculum Intelligence</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button 
              onClick={() => setActiveMode('curriculum')}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeMode === 'curriculum' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-lg" : "text-slate-500"
              )}
            >
              Curriculum
            </button>
            <button 
              onClick={() => setActiveMode('sessionPlan')}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeMode === 'sessionPlan' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-lg" : "text-slate-500"
              )}
            >
              Session
            </button>
          </div>

          {activeMode === 'curriculum' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paste Curriculum</label>
                <textarea 
                  value={curriculumInput}
                  onChange={(e) => setCurriculumInput(e.target.value)}
                  placeholder="Paste your course modules and topics here..."
                  className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".docx,.txt"
                  onChange={(e) => handleFileUpload(e, 'curriculum')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload .docx / .txt</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Logo URL</label>
                <input 
                  type="text" 
                  value={customLogo}
                  onChange={(e) => setCustomLogo(e.target.value)}
                  placeholder="Paste logo URL (Optional)"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={generateDashboard}
                disabled={isLoading || !curriculumInput.trim()}
                className="w-full btn-primary py-4 group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Dashboard
              </button>
            </div>
          )}

          {activeMode === 'sessionPlan' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paste Session Plan</label>
                <textarea 
                  value={sessionPlanInput}
                  onChange={(e) => setSessionPlanInput(e.target.value)}
                  placeholder="Paste your session plan details here..."
                  className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".docx,.txt"
                  onChange={(e) => handleFileUpload(e, 'sessionPlan')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload .docx / .txt</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => generateSessionPlanNotes('notes')}
                  disabled={isLoading || !sessionPlanInput.trim()}
                  className="btn-primary py-4 text-[10px] uppercase tracking-widest"
                >
                  <BookOpen className="w-4 h-4" />
                  Notes
                </button>
                <button 
                  onClick={() => generateSessionPlanNotes('ppt')}
                  disabled={isLoading || !sessionPlanInput.trim()}
                  className="bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  <Presentation className="w-4 h-4" />
                  PPT
                </button>
              </div>
            </div>
          )}
        </div>

        {isDashboardGenerated && (
          <div className="mt-auto p-8 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => {
                setIsDashboardGenerated(false);
                setCurriculumData(null);
                setSelectedItem(null);
                setGeneratedNotes('');
              }}
              className="w-full py-3 text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Reset Dashboard
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!isDashboardGenerated && !generatedNotes ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col items-center justify-center p-20 text-center"
            >
              <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-800 mb-12 relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] opacity-0 group-hover:opacity-5 transition-opacity blur-2xl"></div>
                <Layers className="w-14 h-14 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 transition-all duration-500 group-hover:scale-110" />
              </div>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight leading-tight">
                Notes & <span className="text-indigo-600">Guides</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-lg font-bold">
                Upload your curriculum to generate a dynamic dashboard. Click on topics to generate technical notes, quizzes, and study materials instantly.
              </p>
            </motion.div>
          ) : (
            <div className="flex-grow flex overflow-hidden">
              {/* Dashboard Grid */}
              <div className={cn(
                "flex-grow overflow-y-auto p-12 custom-scrollbar transition-all duration-500",
                selectedItem ? "w-1/2" : "w-full"
              )}>
                <div className="max-w-5xl mx-auto space-y-12">
                  <header className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight mb-2">
                      {curriculumData?.courseTitle || 'Interactive Dashboard'}
                    </h1>
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-12 bg-indigo-600 rounded-full"></span>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a topic or subtopic to explore</p>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 gap-8">
                    {curriculumData?.modules.map((module, mIdx) => (
                      <div key={mIdx} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Module {mIdx + 1}</div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">{module.title}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {module.topics.map((topic, tIdx) => (
                            <div 
                              key={tIdx}
                              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                              onClick={() => generateNotes(topic.title, 'topic')}
                            >
                              <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">{topic.title}</h3>
                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {topic.subtopics.map((sub, sIdx) => (
                                  <button 
                                    key={sIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateNotes(sub.title, 'subtopic', topic.title);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group/sub"
                                  >
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full group-hover/sub:scale-150 transition-transform" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover/sub:text-indigo-600">{sub.title}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes Panel */}
              <AnimatePresence>
                {selectedItem && (
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="w-1/2 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-30"
                  >
                    <header className="h-24 px-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{selectedItem.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedItem.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                          onClick={() => setActiveContentMode('notes')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            activeContentMode === 'notes' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
                          )}
                        >
                          Notes
                        </button>
                        <button 
                          onClick={generateQuiz}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            activeContentMode === 'quiz' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
                          )}
                        >
                          Quiz
                        </button>
                        <button 
                          onClick={() => setActiveContentMode('tutor')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            activeContentMode === 'tutor' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
                          )}
                        >
                          Tutor
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={downloadNotes}
                          disabled={!generatedNotes && !generatedQuiz}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-30"
                          title="Download as Word"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setSelectedItem(null)}
                          className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </header>

                    <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
                      {activeContentMode === 'notes' && (
                        isGeneratingNotes ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Generating Technical Notes</h4>
                            <p className="text-sm text-slate-500 font-bold">Our AI is crafting detailed educational content for you.</p>
                          </div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: generatedNotes }}
                          />
                        )
                      )}

                      {activeContentMode === 'quiz' && (
                        isGeneratingQuiz ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Generating Quiz</h4>
                            <p className="text-sm text-slate-500 font-bold">Creating assessments to test your knowledge.</p>
                          </div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: generatedQuiz }}
                          />
                        )
                      )}

                      {activeContentMode === 'tutor' && (
                        <div className="flex flex-col h-full">
                          <div className="flex-grow space-y-6 mb-6">
                            {chatMessages.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                                <Sparkles className="w-12 h-12 text-indigo-600 mb-4" />
                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">AI Technical Tutor</h4>
                                <p className="text-xs text-slate-500 font-bold">Ask me anything about "{selectedItem.title}". I'm here to help you understand the concepts.</p>
                              </div>
                            )}
                            {chatMessages.map((msg, idx) => (
                              <div key={idx} className={cn(
                                "flex flex-col max-w-[85%]",
                                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                              )}>
                                <div className={cn(
                                  "px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                                  msg.role === 'user' 
                                    ? "bg-indigo-600 text-white rounded-tr-none" 
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none"
                                )}>
                                  {msg.text}
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 px-2">
                                  {msg.role === 'user' ? 'You' : 'AI Tutor'}
                                </span>
                              </div>
                            ))}
                            {isChatLoading && (
                              <div className="flex items-center gap-3 text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Tutor is thinking...</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-auto flex gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <input 
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Ask a question..."
                              className="flex-grow bg-transparent px-4 py-2 text-sm outline-none font-medium"
                            />
                            <button 
                              onClick={handleSendMessage}
                              disabled={isChatLoading || !chatInput.trim()}
                              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>

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
      </main>
    </div>
  );
};

export default CurriculumExplorer;
