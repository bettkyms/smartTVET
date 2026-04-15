import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  Upload,
  ClipboardList,
  Hammer,
  BookOpen,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel } from 'docx';

interface AssessmentSlot {
  id: number;
  title: string;
  loRange: string;
  content: any | null;
  isLoading: boolean;
  error: string;
}

const AssessmentGeneratorMOD3: React.FC = () => {
  const { user, profile } = useAuth();
  const [courseTitle, setCourseTitle] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [knqfLevel, setKnqfLevel] = useState<number>(5);
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  
  const [activeSlot, setActiveSlot] = useState(1);
  const [slots, setSlots] = useState<AssessmentSlot[]>([
    { id: 1, title: 'Introductory', loRange: 'First 1/3 of LOs', content: null, isLoading: false, error: '' },
    { id: 2, title: 'Intermediate', loRange: 'First 2/3 of LOs', content: null, isLoading: false, error: '' },
    { id: 3, title: 'Summative', loRange: 'All LOs', content: null, isLoading: false, error: '' },
  ]);

  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    const keyIsAvailable = !!apiKey && apiKey.trim() !== '' && apiKey !== 'undefined';
    setIsApiConfigured(keyIsAvailable);
    
    if (profile?.institutionName) setSchoolName(profile.institutionName);
    if (profile?.institutionLogo) setSchoolLogo(profile.institutionLogo);
  }, [profile]);

  const updateSlot = (id: number, updates: Partial<AssessmentSlot>) => {
    setSlots(prev => prev.map(slot => slot.id === id ? { ...slot, ...updates } : slot));
  };

  const generateAssessment = async (slotId: number) => {
    if (!isApiConfigured || !courseTitle || !learningOutcomes) {
      updateSlot(slotId, { error: 'Please provide Course Title and Learning Outcomes.' });
      return;
    }

    updateSlot(slotId, { isLoading: true, error: '', content: null });

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
      updateSlot(slotId, { error: "Gemini API Key not found. Please check your environment variables.", isLoading: false });
      return;
    }
    const ai = new GoogleGenAI({ apiKey: apiKey as string });
    const slot = slots.find(s => s.id === slotId);
    const isPractical = knqfLevel < 5;

    try {
      const systemInstruction = `You are a TVET CDACC Curriculum Specialist. Generate a professional assessment tool in JSON format.
      
      KNQF Level: ${knqfLevel}
      Assessment Mode: ${isPractical ? 'Practical Paper' : 'Written Exam'}
      Slot: ${slot?.title} (${slot?.loRange})
      
      STRICT JSON SCHEMA:
      {
        "header": {
          "title": "string",
          "unitCode": "string",
          "level": "number",
          "time": "string",
          "totalMarks": "number"
        },
        "instructions": ["string"],
        ${isPractical ? `
        "practicalTasks": [
          {
            "taskTitle": "string",
            "instructions": "string",
            "performanceCriteria": ["string"],
            "oralQuestions": [{"question": "string", "expectedAnswer": "string"}]
          }
        ],
        "resourceList": {
          "tools": ["string"],
          "equipment": ["string"],
          "materials": ["string"]
        }
        ` : `
        "sectionA": {
          "title": "Short Answer Questions (50 Marks)",
          "questions": [{"question": "string", "marks": "number", "answer": "string"}]
        },
        "sectionB": {
          "title": "Long Answer Questions (Choose 5)",
          "questions": [{"question": "string", "marks": "number", "answer": "string"}]
        }
        `}
      }
      
      RULES:
      1. If Level < 5: Generate a practical paper with hands-on tasks, tools, equipment, and mandatory oral questions.
      2. If Level >= 5: Generate a written paper. Section A must have 50 marks of short answers. Section B must have 7 long-answer questions.
      3. Coverage: Only cover the ${slot?.loRange} specified.
      4. Ensure technical accuracy for the TVET sector.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a ${isPractical ? 'Practical' : 'Written'} assessment for: ${courseTitle} (${unitCode}). 
        Learning Outcomes to cover: ${learningOutcomes}.
        KNQF Level: ${knqfLevel}.`,
        config: { 
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      const content = JSON.parse(response.text || '{}');
      updateSlot(slotId, { content, isLoading: false });
    } catch (err: any) {
      console.error(err);
      updateSlot(slotId, { error: err.message || "Error generating assessment.", isLoading: false });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setLearningOutcomes(result.value);
      } catch (err) {
        console.error("Error extracting text:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadWord = async (slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot?.content) return;

    const { header, instructions, practicalTasks, resourceList, sectionA, sectionB } = slot.content;
    const isPractical = knqfLevel < 5;

    const children: any[] = [
      new Paragraph({
        text: schoolName || "SMART TVET SYSTEMS",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: header.title,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Unit Code: ${header.unitCode} | Level: ${header.level} | Time: ${header.time}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        text: "INSTRUCTIONS TO CANDIDATES",
        heading: HeadingLevel.HEADING_3,
      }),
      ...instructions.map((inst: string) => new Paragraph({ text: `• ${inst}`, bullet: { level: 0 } })),
      new Paragraph({ text: "" }),
    ];

    if (isPractical && practicalTasks) {
      practicalTasks.forEach((task: any, idx: number) => {
        children.push(new Paragraph({ text: `TASK ${idx + 1}: ${task.taskTitle}`, heading: HeadingLevel.HEADING_3 }));
        children.push(new Paragraph({ text: task.instructions }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Performance Criteria:", font: "Arial", bold: true })] }));
        task.performanceCriteria.forEach((pc: string) => children.push(new Paragraph({ text: `[ ] ${pc}` })));
        children.push(new Paragraph({ text: "" }));
      });

      if (resourceList) {
        children.push(new Paragraph({ text: "RESOURCE LIST", heading: HeadingLevel.HEADING_3 }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Tools:", bold: true })] }));
        resourceList.tools.forEach((t: string) => children.push(new Paragraph({ text: t, bullet: { level: 0 } })));
        children.push(new Paragraph({ children: [new TextRun({ text: "Equipment:", bold: true })] }));
        resourceList.equipment.forEach((e: string) => children.push(new Paragraph({ text: e, bullet: { level: 0 } })));
        children.push(new Paragraph({ children: [new TextRun({ text: "Materials:", bold: true })] }));
        resourceList.materials.forEach((m: string) => children.push(new Paragraph({ text: m, bullet: { level: 0 } })));
      }
    } else {
      if (sectionA) {
        children.push(new Paragraph({ text: sectionA.title, heading: HeadingLevel.HEADING_3 }));
        sectionA.questions.forEach((q: any, idx: number) => {
          children.push(new Paragraph({ text: `${idx + 1}. ${q.question} (${q.marks} Marks)` }));
          children.push(new Paragraph({ text: "" }));
        });
      }
      if (sectionB) {
        children.push(new Paragraph({ text: sectionB.title, heading: HeadingLevel.HEADING_3 }));
        sectionB.questions.forEach((q: any, idx: number) => {
          children.push(new Paragraph({ text: `${idx + 1}. ${q.question} (${q.marks} Marks)` }));
          children.push(new Paragraph({ text: "" }));
        });
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${header.title.replace(/ /g, '_')}_Slot${slotId}.docx`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc] dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200 dark:shadow-none animate-float">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">
            MOD 3<br />Generator
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <span className="h-1 w-8 bg-indigo-600 rounded-full"></span>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">TVET Assessment Tool</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Course Title</label>
            <input 
              type="text" 
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. Diploma in Civil Engineering"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Unit Code</label>
              <input 
                type="text" 
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                placeholder="e.g. CON/OS/PL/CR/01/6"
                className="input-field"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">KNQF Level</label>
              <select 
                value={knqfLevel}
                onChange={(e) => setKnqfLevel(Number(e.target.value))}
                className="input-field"
              >
                {[3, 4, 5, 6].map(l => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Learning Outcomes</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload PDF/DOCX
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
            </div>
            <textarea 
              value={learningOutcomes}
              onChange={(e) => setLearningOutcomes(e.target.value)}
              placeholder="Paste curriculum learning outcomes here..."
              className="input-field min-h-[120px] resize-none py-4"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">School Branding</label>
            <div className="space-y-3">
              <input 
                type="text" 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Institution Name"
                className="input-field"
              />
              <div className="relative">
                <input 
                  type="text" 
                  value={schoolLogo}
                  onChange={(e) => setSchoolLogo(e.target.value)}
                  placeholder="Logo URL (Optional)"
                  className="input-field pl-10"
                />
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="flex items-center gap-2 text-indigo-400 mb-3 relative z-10">
              <ClipboardList className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Dual Mode</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed relative z-10">
              Level 3-4: Practical Papers<br />
              Level 5-6: Written Exams
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
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-display tracking-tight">Triple Slot Workflow</h2>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                    activeSlot === slot.id 
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Slot {slot.id}: {slot.title}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => generateAssessment(activeSlot)}
              disabled={slots[activeSlot-1].isLoading || !isApiConfigured}
              className="btn-primary py-3 px-8 text-xs group"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Generate Slot {activeSlot}
            </button>
          </div>
        </header>

        <div className="flex-grow overflow-auto p-16 flex flex-col items-center custom-scrollbar z-10">
          <AnimatePresence mode="wait">
            {slots[activeSlot-1].error && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-10 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-[2rem] flex items-start gap-5 text-rose-600 dark:text-rose-400 text-sm w-full max-w-3xl shadow-2xl shadow-rose-100/50 dark:shadow-none"
              >
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-grow pt-2 font-bold leading-relaxed">{slots[activeSlot-1].error}</div>
                <button onClick={() => updateSlot(activeSlot, { error: '' })} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {slots[activeSlot-1].isLoading ? (
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
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 font-display tracking-tight uppercase italic">Generating {slots[activeSlot-1].title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm font-bold leading-relaxed">
                  Analyzing {slots[activeSlot-1].loRange} to create a standardized TVET assessment.
                </p>
              </motion.div>
            ) : !slots[activeSlot-1].content ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-lg"
              >
                <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-800 mb-12 relative group">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] opacity-0 group-hover:opacity-5 transition-opacity blur-2xl"></div>
                  {knqfLevel < 5 ? <Hammer className="w-14 h-14 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 transition-all duration-500 group-hover:scale-110" /> : <BookOpen className="w-14 h-14 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 transition-all duration-500 group-hover:scale-110" />}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-none scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight leading-tight uppercase italic">
                  Slot {activeSlot}: <span className="text-indigo-600 dark:text-indigo-400">{slots[activeSlot-1].title}</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-12 font-bold">
                  Generate a professional {knqfLevel < 5 ? 'Practical Paper' : 'Written Exam'} covering the {slots[activeSlot-1].loRange}.
                </p>
                
                <div className="flex flex-wrap justify-center gap-8">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CDACC Aligned</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marking Schemes</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource Lists</span>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-4xl space-y-12 mb-24"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase italic">{slots[activeSlot-1].title} Assessment</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Generated for: {courseTitle}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => downloadWord(activeSlot)}
                      className="btn-primary py-3 px-8 text-xs shadow-2xl shadow-indigo-200 dark:shadow-none"
                    >
                      <Download className="w-4 h-4" />
                      Export Word
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 shadow-[0_48px_96px_-12px_rgba(15,23,42,0.12)] border border-slate-200 dark:border-slate-800 w-full p-16 rounded-sm relative overflow-hidden transition-colors duration-300">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-royal to-indigo-600" />
                  
                  <div className="text-center mb-12 border-b-2 border-slate-100 dark:border-slate-800 pb-10">
                    {schoolLogo && (
                      <img src={schoolLogo} alt="Logo" className="max-h-16 mx-auto mb-6 grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                    )}
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{schoolName || "SMART TVET SYSTEMS"}</h1>
                    <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">{slots[activeSlot-1].content.header.title}</h2>
                    <div className="flex justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span>Unit: {slots[activeSlot-1].content.header.unitCode}</span>
                      <span>Level: {slots[activeSlot-1].content.header.level}</span>
                      <span>Time: {slots[activeSlot-1].content.header.time}</span>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-6 border-l-4 border-indigo-600 pl-4">Instructions to Candidates</h3>
                      <ul className="space-y-3">
                        {slots[activeSlot-1].content.instructions.map((inst: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed flex gap-4">
                            <span className="text-indigo-600 dark:text-indigo-400">•</span>
                            {inst}
                          </li>
                        ))}
                      </ul>
                    </section>

                    {knqfLevel < 5 ? (
                      <>
                        <section className="space-y-10">
                          {slots[activeSlot-1].content.practicalTasks.map((task: any, i: number) => (
                            <div key={i} className="space-y-6">
                              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] border-l-4 border-indigo-600 pl-4">Task {i+1}: {task.taskTitle}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 italic">{task.instructions}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Criteria</h4>
                                  <div className="space-y-3">
                                    {task.performanceCriteria.map((pc: string, j: number) => (
                                      <div key={j} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 font-bold">
                                        <div className="w-4 h-4 border-2 border-slate-200 dark:border-slate-700 rounded mt-0.5 shrink-0" />
                                        {pc}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oral Assessment</h4>
                                  <div className="space-y-4">
                                    {task.oralQuestions.map((oq: any, j: number) => (
                                      <div key={j} className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                                        <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 mb-2">Q: {oq.question}</p>
                                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-500 italic">Exp: {oq.expectedAnswer}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </section>

                        <section className="pt-12 border-t border-slate-100 dark:border-slate-800">
                          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-8 border-l-4 border-indigo-600 pl-4">Resource List (Cutting List)</h3>
                          <div className="grid grid-cols-3 gap-8">
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hammer className="w-3 h-3" /> Tools
                              </h4>
                              <ul className="space-y-2">
                                {slots[activeSlot-1].content.resourceList.tools.map((t: string, i: number) => (
                                  <li key={i} className="text-[10px] font-bold text-slate-600 dark:text-slate-400">• {t}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Settings className="w-3 h-3" /> Equipment
                              </h4>
                              <ul className="space-y-2">
                                {slots[activeSlot-1].content.resourceList.equipment.map((e: string, i: number) => (
                                  <li key={i} className="text-[10px] font-bold text-slate-600 dark:text-slate-400">• {e}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Materials
                              </h4>
                              <ul className="space-y-2">
                                {slots[activeSlot-1].content.resourceList.materials.map((m: string, i: number) => (
                                  <li key={i} className="text-[10px] font-bold text-slate-600 dark:text-slate-400">• {m}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </section>
                      </>
                    ) : (
                      <>
                        <section className="space-y-8">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] border-l-4 border-indigo-600 pl-4">{slots[activeSlot-1].content.sectionA.title}</h3>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Compulsory</span>
                          </div>
                          <div className="space-y-8">
                            {slots[activeSlot-1].content.sectionA.questions.map((q: any, i: number) => (
                              <div key={i} className="flex gap-6">
                                <span className="text-xs font-black text-slate-400 w-6">{i+1}.</span>
                                <div className="flex-grow space-y-4">
                                  <p className="text-sm text-slate-900 dark:text-white font-bold leading-relaxed">{q.question}</p>
                                  <div className="flex justify-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({q.marks} Marks)</span>
                                  </div>
                                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 italic">Marking Guide: {q.answer}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="space-y-8 pt-12">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] border-l-4 border-indigo-600 pl-4">{slots[activeSlot-1].content.sectionB.title}</h3>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Choose 5</span>
                          </div>
                          <div className="space-y-8">
                            {slots[activeSlot-1].content.sectionB.questions.map((q: any, i: number) => (
                              <div key={i} className="flex gap-6">
                                <span className="text-xs font-black text-slate-400 w-6">{i+1}.</span>
                                <div className="flex-grow space-y-4">
                                  <p className="text-sm text-slate-900 dark:text-white font-bold leading-relaxed">{q.question}</p>
                                  <div className="flex justify-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({q.marks} Marks)</span>
                                  </div>
                                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 italic">Marking Guide: {q.answer}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </>
                    )}
                  </div>

                  <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Generated by Smart TVET Systems AI • MOD 3 Series</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AssessmentGeneratorMOD3;
