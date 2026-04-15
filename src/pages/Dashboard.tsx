import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import { 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  History, 
  Settings, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  Share2,
  DollarSign,
  Save,
  Trash2,
  Loader2,
  Phone,
  Smartphone,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  // --- STATE MANAGEMENT ---
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Payment State (Removed)
  const [pendingDownload, setPendingDownload] = useState<{ html: string, titleSuffix: string } | null>(null);

  const [unitTitle, setUnitTitle] = useState('');
  const [level, setLevel] = useState(profile?.level || 'Level 3');
  const [trainerName, setTrainerName] = useState(profile?.displayName || '');
  const [trainerNumber, setTrainerNumber] = useState(profile?.trainerNumber || '');
  const [institutionName, setInstitutionName] = useState(profile?.institutionName || '');

  // Update fields when profile loads
  useEffect(() => {
    if (profile) {
      if (!trainerName) setTrainerName(profile.displayName || '');
      if (!trainerNumber) setTrainerNumber(profile.trainerNumber || '');
      if (!institutionName) setInstitutionName(profile.institutionName || '');
      if (level === 'Level 3') setLevel(profile.level || 'Level 3');
    }
  }, [profile]);
  const [numWeeks, setNumWeeks] = useState('12');
  const [numLessons, setNumLessons] = useState('3');
  const [classGroup, setClassGroup] = useState('');
  const [numTrainees, setNumTrainees] = useState('15');
  const [curriculum, setCurriculum] = useState(
    `Unit Code: \n\nSkill or Job Task:\n\n\nBenchmark or Criterial to be used:\n1. \n2. \n3. `
  );
  
  const [learningPlan, setLearningPlan] = useState('');
  const [sessionPlans, setSessionPlans] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSP, setIsGeneratingSP] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'learningPlan' | 'sessionPlans'>('learningPlan');
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [logoSrc, setLogoSrc] = useState('');
  
  // Import feature states
  const [showImport, setShowImport] = useState(false);
  const [importHtml, setImportHtml] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'plans'), where('authorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(plansData.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'plans');
    });

    return () => unsubscribe();
  }, [user]);

  // --- ACTIONS ---
  const handleSavePlan = async () => {
    if (!user) {
      setError('Please sign in to save your drafts and access them later.');
      return;
    }
    if (!unitTitle || !learningPlan) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      const planData = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        unitTitle,
        learningPlan,
        sessionPlans,
        isPublic: false,
        price: 0,
        updatedAt: serverTimestamp()
      };

      if (currentPlanId) {
        await updateDoc(doc(db, 'plans', currentPlanId), planData);
      } else {
        const docRef = await addDoc(collection(db, 'plans'), {
          ...planData,
          createdAt: serverTimestamp()
        });
        setCurrentPlanId(docRef.id);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to save plan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await deleteDoc(doc(db, 'plans', id));
      if (currentPlanId === id) {
        handleNewPlan();
      }
    } catch (err: any) {
      setError('Failed to delete plan: ' + err.message);
    }
  };

  const loadPlan = (plan: any) => {
    setCurrentPlanId(plan.id);
    setUnitTitle(plan.unitTitle);
    setLearningPlan(plan.learningPlan);
    setSessionPlans(plan.sessionPlans || '');
    setShowImport(false);
  };

  const handleNewPlan = () => {
    setCurrentPlanId(null);
    setUnitTitle('');
    setLearningPlan('');
    setSessionPlans('');
    setShowImport(false);
  };

  // --- API KEY CHECK ---
  useEffect(() => {
    const apiKey = process.env.API_KEY;
    const keyIsAvailable = !!apiKey && apiKey.trim() !== '';
    setIsApiConfigured(keyIsAvailable);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setLogoSrc(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLogoHtml = () => {
    if (!logoSrc) return `<div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;"><img src="https://lh3.googleusercontent.com/d/1SjQv4bgCcCO11gebydnHsnK8f1fnE0zl" alt="Smart TVET Systems Logo" style="max-height: 60px; width: auto; display: inline-block; margin-bottom: 10px;" referrerPolicy="no-referrer" /><p style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Smart TVET Systems - Excellence in Training</p></div>`;
    return `<div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;"><img src="${logoSrc}" alt="Logo" style="max-height: 60px; width: auto; display: inline-block; margin-bottom: 10px;" /><p style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Smart TVET Systems - Excellence in Training</p></div>`;
  };

  const wrapWithHeader = (content: string, title: string) => {
    const logo = getLogoHtml();
    const inst = institutionName || '[Institution Name]';
    if (content.includes('document-wrapper')) return content;
    
    return `
      <div class="document-wrapper" style="font-family: 'Inter', sans-serif; color: #1e293b;">
        ${logo}
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">${inst}</h2>
          <h1 style="margin: 5px 0; text-transform: uppercase; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${title}</h1>
        </div>
        ${content}
        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
          Generated by Smart TVET Systems AI • Professional Planning Series
        </div>
      </div>
    `;
  };

  const cleanResponse = (text: string | undefined) => {
    if (!text) return '';
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
  };

  const handleImportPlan = () => {
    if (!importHtml.trim()) {
      setError("Please paste valid HTML or upload a file to import.");
      return;
    }
    setLearningPlan(wrapWithHeader(importHtml, 'IMPORTED LEARNING PLAN'));
    setSessionPlans('');
    setActiveTab('learningPlan');
    setShowImport(false);
    setImportHtml('');
    setError('');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'html' || extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportHtml(event.target?.result as string);
      };
      reader.readAsText(file);
      return;
    }

    if (extension === 'pdf' || extension === 'docx') {
      if (!isApiConfigured) {
        setError("API Key required to process files.");
        return;
      }
      
      setIsExtracting(true);
      setGenerationStep('Reading document content...');
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let modelParts: any[] = [];

        const extractionInstruction = `You are a TVET CDACC document extractor. 
        Analyze the provided content which contains a TVET Learning Plan.
        
        TASK:
        Extract the Learning Plan table and return it in a specific HTML format.
        
        REQUIREMENTS:
        1. Return ONLY the HTML code. No explanation.
        2. The output must contain a Metadata Table (2 columns) and a Matrix Table (9 columns).
        3. The Matrix Table MUST have these headers: WEEK, SESSION NO, SESSION TITLE, LEARNING OUTCOMES, TRAINER ACTIVITIES, TRAINEE ACTIVITIES, Resources & Refs, Learning Checks/ Assessments, Reflections & Date.
        4. Use border="1" and solid lines.
        5. Ensure all session content is captured accurately.
        
        If the document is not a TVET Learning Plan, return an error message: "ERROR: Not a recognized TVET Learning Plan".`;

        if (extension === 'pdf') {
          const base64Data = await fileToBase64(file);
          modelParts = [
            { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
            { text: extractionInstruction }
          ];
        } else if (extension === 'docx') {
          setGenerationStep('Extracting text from Word document...');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          const extractedText = result.value;
          
          modelParts = [
            { text: `Document content (extracted from Word):\n\n${extractedText}` },
            { text: extractionInstruction }
          ];
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: modelParts }]
        });

        const extractedHtml = cleanResponse(response.text);
        if (extractedHtml.includes('ERROR:')) {
          setError(extractedHtml);
        } else {
          setImportHtml(extractedHtml);
          if (extractedHtml.includes('Unit of Competency')) {
             const match = extractedHtml.match(/Unit of Competency:<\/b>\s*([^<]+)/i);
             if (match) setUnitTitle(match[1].trim());
          }
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to process file: " + (err.message || "Unknown error"));
      } finally {
        setIsExtracting(false);
        setGenerationStep('');
      }
    } else {
      setError("Unsupported file format. Please use PDF, DOCX, HTML, or TXT.");
    }
  };

  const handleGenerateLP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiConfigured) {
      setError("Configuration Error: The API_KEY is not available in the environment.");
      return;
    }

    setIsLoading(true);
    setError('');
    setLearningPlan('');
    setSessionPlans('');
    setActiveTab('learningPlan');

    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB');
    const currentYear = now.getFullYear();
    const totalSessions = parseInt(numWeeks) * parseInt(numLessons);
    const totalHours = totalSessions * 2; 
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      setGenerationStep('Extracting Metadata & Benchmarks...');
      const metaInstruction = `You are a TVET CDACC expert. Generate a Metadata table and a Learning Plan table header in HTML.
      DO NOT use markdown blocks. Return ONLY HTML.
      
      Structure:
      1. A Metadata Table with border="1" and width="100%". It MUST have exactly two columns.
         - Row 1: <td><b>Unit of Competency:</b> ${unitTitle}</td><td><b>Unit Code:</b> [EXTRACT FROM CURRICULUM]</td>
         - Row 2: <td><b>Name of Trainer:</b> ${trainerName}</td><td><b>Trainer Number:</b> ${trainerNumber}</td>
         - Row 3: <td><b>Institution:</b> ${institutionName}</td><td><b>Level:</b> ${level}</td>
         - Row 4: <td><b>Date of Preparation:</b> ${currentDate}</td><td><b>Class/Group:</b> ${classGroup}</td>
         - Row 5: <td><b>Number of Trainees:</b> ${numTrainees}</td><td><b>Total Unit Hours:</b> ${totalHours} (Each Lesson: 2 Hours)</td>
         - Row 6: <td><b>Total Number of Sessions:</b> ${totalSessions}</td><td><b>Status:</b> Original</td>
         - Row 7 (COLSPAN 2): <td><b>Skill or Job Task:</b> [EXTRACT FULL TEXT FROM CURRICULUM]</td>
         - Row 8 (COLSPAN 2): <td><b>Benchmark or Criteria to be used:</b> [LIST ALL POINTS FROM CURRICULUM]</td>
      
      2. The opening <table> tag and <thead> with EXACTLY 9 headers: 
         WEEK, SESSION NO, SESSION TITLE, LEARNING OUTCOMES, TRAINER ACTIVITIES, TRAINEE ACTIVITIES, Resources & Refs, Learning Checks/ Assessments, Reflections & Date.
      
      IMPORTANT: DO NOT CLOSE the <table> tag yet.`;

      const metaResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Curriculum: ${curriculum}. Create the metadata header and 9-column matrix start.`,
        config: { systemInstruction: metaInstruction }
      });

      let finalHtml = cleanResponse(metaResponse.text || '') + '<tbody>';

      const rowBatchSize = 6;
      const numRowBatches = Math.ceil(totalSessions / rowBatchSize);

      for (let i = 0; i < numRowBatches; i++) {
        const start = i * rowBatchSize + 1;
        const end = Math.min((i + 1) * rowBatchSize, totalSessions);
        const currentWeek = Math.ceil(start / parseInt(numLessons));
        
        setGenerationStep(`Populating Sessions ${start} to ${end} (Week ${currentWeek})...`);

        const rowInstruction = `You are a TVET CDACC expert. Generate EXACTLY ${end - start + 1} <tr> rows for the matrix.
        DO NOT include <table> or <thead>. Return ONLY <tr> elements.
        
        CRITICAL: EVERY ROW MUST HAVE EXACTLY 9 <td> CELLS:
        1. WEEK
        2. SESSION NO
        3. SESSION TITLE
        4. LEARNING OUTCOMES (Must start: "By the end of the session, trainees should be able to...")
        5. TRAINER ACTIVITIES (Numbered)
        6. TRAINEE ACTIVITIES (Numbered)
        7. Resources & Refs
        8. Learning Checks (Knowledge, Skills, Attitudes headings)
        9. Reflections & Date: "Completed on ___/___/${currentYear}"
 
        Every session is 2 HOURS. CURRICULUM: ${curriculum}`;

        const rowResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Generate matrix rows for sessions ${start} to ${end}.`,
          config: { systemInstruction: rowInstruction }
        });

        finalHtml += cleanResponse(rowResponse.text || '');
      }

      finalHtml += '</tbody></table>';
      setLearningPlan(wrapWithHeader(finalHtml, 'LEARNING PLAN TEMPLATE'));

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during matrix generation.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  const handleGenerateSPs = async () => {
    if (!isApiConfigured || !learningPlan) return;

    setIsGeneratingSP(true);
    setError('');
    setActiveTab('sessionPlans');

    const totalSessions = parseInt(numWeeks) * parseInt(numLessons);
    const currentYear = new Date().getFullYear();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const batchSize = 2; 
      const numBatches = Math.ceil(totalSessions / batchSize);
      let fullSpContent = '';
      
      for (let i = 0; i < numBatches; i++) {
        const start = i * batchSize + 1;
        const end = Math.min((i + 1) * batchSize, totalSessions);
        setGenerationStep(`Expanding Plans ${start}-${end}...`);

        const spSystemInstruction = `You are a TVET CDACC expert. Generate highly detailed, INDEPENDENT Session Plans in HTML for A4 PORTRAIT.
        DO NOT use markdown blocks. Return ONLY HTML.
        
        STRICT RULES FOR EVERY SESSION:
        1. EVERY SESSION must start with its own independent Metadata Table.
        2. EVERY SESSION must have its own independent Delivery Table.
        3. TABLES MUST HAVE SOLID BLACK BORDERS (border="1"). NO DOTTED LINES.
        4. Use exactly 4 columns for ALL rows in the main delivery table: (Time, Phase, Trainer Activity, Trainee Activity).
        5. DO NOT connect sessions. Each session must be a fully self-contained unit.
        
        Template for EACH session (Repeat for every session requested):
        - Metadata Table (width="100%", border="1", solid lines):
           Row 1: <td>Unit Title: ${unitTitle || '[Unit Title]'}</td><td>Unit Code: [CODE]</td>
           Row 2: <td>Session No: [NUMBER]</td><td>Duration: 2 Hours</td>
           Row 3: <td>Trainer: ${trainerName || '[Trainer Name]'}</td><td>Date: ___/___/${currentYear}</td>
           Row 4: <td>Venue: [VENUE]</td><td>Class/Group: ${classGroup || '[Class]'}</td>
        
        - Delivery Table (width="100%", border="1", solid lines, 4 cols: Time, Phase, Trainer Activity, Trainee Activity):
           * 5 Min | Bridge-in | [Text] | [Text]
           * - | Outcomes | [Must start: "By the end..."] | [Text]
           * 10 Min | Pre-assessment | [Text] | [Text]
           * 80 Min | Participatory Learning | [Numbered items] | [Numbered items]
           * 15 Min | Post-assessment | [Text] | [Text]
           * 10 Min | Closure | [Text] | [Text]
        
        Insert <div class="page-break"></div> strictly BETWEEN sessions.`;

        const spResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Generate full Portrait Session Plans for Sessions ${start} to ${end} based on the Learning Plan matrix provided. Content source: ${learningPlan.substring(0, 15000)}. Each session plan must be independent and use solid borders.`,
          config: { systemInstruction: spSystemInstruction }
        });

        fullSpContent += cleanResponse(spResponse.text || '');
      }
      setSessionPlans(wrapWithHeader(fullSpContent, 'SESSION PLAN'));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error expanding plans. Ensure the imported plan has recognizable session data.");
    } finally {
      setIsGeneratingSP(false);
      setGenerationStep('');
    }
  };

  const executeDownload = (html: string, titleSuffix: string) => {
    if (!html) return;
    const fileName = `${(unitTitle || 'TVET').replace(/ /g, '_')}_${titleSuffix}.docx`;
    const orientation = titleSuffix === 'Learning_Plan' ? 'landscape' : 'portrait';

    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: A4 ${orientation}; margin: 0.5in; mso-page-orientation: ${orientation}; }
          body { font-family: 'Arial', sans-serif; font-size: 8.5pt; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; border: 1pt solid black; table-layout: fixed; }
          th, td { border: 1pt solid black; padding: 4pt; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; border-style: solid; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 8pt; }
          h1, h2, h3 { text-align: center; margin: 4pt 0; text-transform: uppercase; }
          h1 { font-size: 14pt; }
          h2 { font-size: 12pt; }
          .page-break { page-break-after: always; mso-special-character: page-break; border-top: 1pt solid #eee; margin-top: 20pt; padding-top: 20pt; }
          img { max-height: 80px; width: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
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

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc] dark:bg-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
          <h2 className="font-display font-black text-slate-900 dark:text-white flex items-center gap-4 text-2xl tracking-tight leading-none">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 animate-float">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            Planner<br />Studio
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleNewPlan}
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
              title="New Plan"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowImport(!showImport)}
              className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white px-5 py-2.5 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest"
            >
              {showImport ? 'Draft New' : 'Import'}
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-10 space-y-12 custom-scrollbar">
          {/* History Section */}
          {!showImport && plans.length > 0 && (
            <div className="space-y-5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <History className="w-3.5 h-3.5" />
                Recent Activity
              </label>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={cn(
                      "sidebar-item group",
                      currentPlanId === plan.id ? "sidebar-item-active" : "sidebar-item-inactive"
                    )}
                    onClick={() => loadPlan(plan)}
                  >
                    <div className="flex items-center gap-4 truncate">
                      <div className={cn(
                        "w-3 h-3 rounded-full shrink-0 border-2",
                        currentPlanId === plan.id ? "bg-white border-indigo-400 animate-pulse" : "bg-slate-200 border-transparent"
                      )} />
                      <span className="truncate font-bold">{plan.unitTitle}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all",
                        currentPlanId === plan.id ? "text-white/60 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showImport ? (
            <form onSubmit={handleGenerateLP} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Unit of Competency</label>
                <input 
                  type="text" 
                  value={unitTitle} 
                  onChange={(e) => setUnitTitle(e.target.value)} 
                  required 
                  placeholder="e.g. Plumbing I" 
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Level</label>
                  <input 
                    type="text" 
                    value={level} 
                    onChange={(e) => setLevel(e.target.value)} 
                    className="input-field"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Trainer ID</label>
                  <input 
                    type="text" 
                    value={trainerNumber} 
                    onChange={(e) => setTrainerNumber(e.target.value)} 
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Trainer Name</label>
                <input 
                  type="text" 
                  value={trainerName} 
                  onChange={(e) => setTrainerName(e.target.value)} 
                  required 
                  className="input-field"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Institution</label>
                <input 
                  type="text" 
                  value={institutionName} 
                  onChange={(e) => setInstitutionName(e.target.value)} 
                  required 
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Weeks</label>
                  <input 
                    type="number" 
                    value={numWeeks} 
                    onChange={(e) => setNumWeeks(e.target.value)} 
                    className="input-field"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Sess/Week</label>
                  <input 
                    type="number" 
                    value={numLessons} 
                    onChange={(e) => setNumLessons(e.target.value)} 
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Curriculum Context</label>
                <textarea 
                  value={curriculum} 
                  onChange={(e) => setCurriculum(e.target.value)} 
                  rows={4}
                  className="input-field resize-none leading-relaxed"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || !isApiConfigured}
                className="btn-primary w-full group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-royal opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate Plan
                </span>
              </button>
            </form>
          ) : (
            <div className="space-y-10">
              <div className="space-y-5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Import from File</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer relative group bg-slate-50/30 dark:bg-slate-900/30">
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.html,.txt" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-10 h-10 text-indigo-500" />
                  </div>
                  <p className="text-xl text-slate-900 dark:text-white font-black mb-2">Upload Document</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">PDF, DOCX, HTML, TXT</p>
                </div>
              </div>

              {importHtml && (
                <div className="space-y-5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Extracted Content</label>
                  <div className="p-6 bg-slate-900 rounded-[2rem] max-h-64 overflow-y-auto text-[10px] font-mono text-slate-400 leading-relaxed border border-slate-800 shadow-2xl">
                    {importHtml.substring(0, 1000)}...
                  </div>
                  <button 
                    onClick={handleImportPlan}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 dark:shadow-emerald-900/20 flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm Import
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
            <h4 className="text-[10px] font-black mb-4 flex items-center gap-2 relative z-10 text-indigo-400 uppercase tracking-[0.2em]">
              <Sparkles className="w-4 h-4" />
              Smart TVET Systems
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed relative z-10 font-bold">
              Professional AI tools for TVET trainers. Streamline your planning and focus on training excellence.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Toolbar */}
        <header className="h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-12 flex items-center justify-between z-10 transition-colors duration-300">
          <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] transition-colors duration-300">
            <button 
              onClick={() => setActiveTab('learningPlan')}
              className={cn(
                "px-10 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                activeTab === 'learningPlan' 
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100/50 dark:shadow-indigo-900/20" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              Learning Matrix
            </button>
            <button 
              onClick={() => setActiveTab('sessionPlans')}
              disabled={!sessionPlans && !isGeneratingSP}
              className={cn(
                "px-10 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                activeTab === 'sessionPlans' 
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100/50 dark:shadow-indigo-900/20" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
              )}
            >
              Session Plans
            </button>
          </div>

          <div className="flex items-center gap-5">
            {learningPlan && (
              <button 
                onClick={handleSavePlan}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-widest",
                  saveSuccess 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" 
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveSuccess ? 'Saved' : 'Save Draft'}
              </button>
            )}
            {learningPlan && !sessionPlans && !isGeneratingSP && (
              <button 
                onClick={handleGenerateSPs}
                className="flex items-center gap-3 px-8 py-3.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-100 dark:border-indigo-800 uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" />
                Build Sessions
              </button>
            )}
            <button 
              onClick={() => executeDownload(activeTab === 'learningPlan' ? learningPlan : sessionPlans, activeTab === 'learningPlan' ? 'Learning_Plan' : 'Session_Plans')}
              disabled={!learningPlan}
              className="btn-primary py-3.5 px-10 text-[10px] disabled:opacity-30 disabled:grayscale"
            >
              <Download className="w-4 h-4" />
              Export Word
            </button>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 mx-2" />
            <button className="p-4 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-grow overflow-auto p-16 flex flex-col items-center custom-scrollbar z-10">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-10 p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-[2rem] flex items-start gap-5 text-rose-600 dark:text-rose-400 text-sm w-full max-w-4xl shadow-2xl shadow-rose-100/50 dark:shadow-rose-900/10"
              >
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-grow pt-2 font-bold leading-relaxed">{error}</div>
                <button onClick={() => setError('')} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLoading || isGeneratingSP || isExtracting ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="relative mb-12">
                  <div className="w-28 h-28 border-[6px] border-indigo-50 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin" />
                  <Sparkles className="w-12 h-12 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 font-display tracking-tight transition-colors duration-300">
                  {isExtracting ? 'Extracting Data' : 'Generating Plan'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-bold mb-8 transition-colors duration-300">{generationStep || 'Our AI is crafting your professional TVET documentation...'}</p>
                <div className="flex gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>
            ) : !(activeTab === 'learningPlan' ? learningPlan : sessionPlans) ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-xl"
              >
                <div className="w-40 h-40 bg-white dark:bg-slate-900 rounded-[3.5rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-800 mb-12 relative group transition-colors duration-300">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[3.5rem] opacity-0 group-hover:opacity-5 transition-opacity blur-3xl"></div>
                  <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20 scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight leading-tight transition-colors duration-300">
                  Start Your <span className="text-indigo-600 dark:text-indigo-400">Masterpiece</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed mb-12 font-bold transition-colors duration-300">
                  Fill in the details in the sidebar or import an existing document to generate professional TVET Learning and Session Plans.
                </p>
                <div className="flex flex-wrap justify-center gap-10">
                   <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                       <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">CDACC Aligned</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                       <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Professional Export</span>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "bg-white dark:bg-slate-900 shadow-[0_64px_128px_-12px_rgba(15,23,42,0.15)] border border-slate-200 dark:border-slate-800 p-[0.75in] rounded-sm mb-24 relative overflow-hidden transition-colors duration-300",
                  activeTab === 'learningPlan' ? "w-[11.69in] min-h-[8.27in]" : "w-[8.27in] min-h-[11.69in]"
                )}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-royal to-indigo-600" />
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: activeTab === 'learningPlan' ? learningPlan : sessionPlans }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global CSS for HTML Output */}
      <style>{`
        .html-output { color: #1e293b; font-family: 'Inter', sans-serif; }
        .html-output table { border-collapse: collapse; width: 100%; margin-bottom: 20px; border: 1.5px solid #0f172a; table-layout: fixed; }
        .html-output th, .html-output td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 11px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
        .html-output th { background: #f8fafc; text-align: center; font-weight: 800; color: #0f172a; text-transform: uppercase; border: 1.5px solid #0f172a; }
        .html-output img { max-height: 60px; width: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; }
        .html-output .page-break { page-break-after: always; border-top: 1px solid #e2e8f0; margin: 50px 0; padding-top: 50px; }
        .html-output h1, .html-output h2, .html-output h3 { font-family: 'Outfit', sans-serif; font-weight: 900; }
      `}</style>
    </div>
  );
};

export default Dashboard;
