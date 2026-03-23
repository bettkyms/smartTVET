import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";

const App = () => {
  // --- STATE MANAGEMENT ---
  const [unitTitle, setUnitTitle] = useState('');
  const [level, setLevel] = useState('Level 3');
  const [trainerName, setTrainerName] = useState('');
  const [trainerNumber, setTrainerNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [numWeeks, setNumWeeks] = useState('12');
  const [numLessons, setNumLessons] = useState('3');
  const [classGroup, setClassGroup] = useState('');
  const [numTrainees, setNumTrainees] = useState('15');
  const [curriculum, setCurriculum] = useState(
    `Unit Code: 

Skill or Job Task:


Benchmark or Criterial to be used:
1. 
2. 
3. `
  );
  
  const [learningPlan, setLearningPlan] = useState('');
  const [sessionPlans, setSessionPlans] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSP, setIsGeneratingSP] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('learningPlan');
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [logoSrc, setLogoSrc] = useState('');
  
  // Import feature states
  const [showImport, setShowImport] = useState(false);
  const [importHtml, setImportHtml] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // --- API KEY CHECK ---
  useEffect(() => {
    const keyIsAvailable = typeof process !== 'undefined' &&
                           typeof process.env !== 'undefined' &&
                           !!process.env.API_KEY &&
                           process.env.API_KEY.trim() !== '';
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
    if (!logoSrc) return `<div style="text-align:center; padding: 10px; border: 1px dashed #ccc; margin-bottom: 10px; font-weight: bold; font-size: 10pt; color: #666;">[INSTITUTION LOGO]</div>`;
    return `<div style="text-align: center; margin-bottom: 10px;"><img src="${logoSrc}" alt="Logo" style="max-height: 80px; width: auto; display: inline-block;" /></div>`;
  };

  const wrapWithHeader = (content: string, title: string) => {
    const logo = getLogoHtml();
    const inst = institutionName || '[Institution Name]';
    if (content.includes('document-wrapper')) return content;
    
    return `
      <div class="document-wrapper">
        ${logo}
        <h2 style="text-align: center; margin: 0; font-size: 14pt;">${inst}</h2>
        <h1 style="text-align: center; margin: 5px 0; text-transform: uppercase; font-size: 16pt;">${title}</h1>
        ${content}
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
    
    // For HTML or TXT, we just read as text
    if (extension === 'html' || extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportHtml(event.target?.result as string);
      };
      reader.readAsText(file);
      return;
    }

    // For PDF or DOCX
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
          // Extract text from DOCX locally to avoid unsupported MIME type error
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
          // Try to extract some metadata for the state if possible
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

  // --- STEP 1: GENERATE LEARNING PLAN (BATCHED) ---
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

  // --- STEP 2: GENERATE SESSION PLANS ---
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

  const handleDownload = (html: string, titleSuffix: string) => {
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
    <>
      <style>{STYLES}</style>
      <div className="app-container">
        <aside className="sidebar">
          <header className="sidebar-header">
            <h1>TVET EduPlanner</h1>
            <div className="sidebar-toggle">
               <button className={!showImport ? 'active' : ''} onClick={() => setShowImport(false)}>Draft New</button>
               <button className={showImport ? 'active' : ''} onClick={() => setShowImport(true)}>Import Existing</button>
            </div>
          </header>

          {!showImport ? (
            <form onSubmit={handleGenerateLP} className="input-form">
              <div className="form-group">
                <label>Unit of Competency</label>
                <input type="text" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} required placeholder="e.g. Plumbing I" disabled={isLoading || isGeneratingSP} />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Level</label>
                  <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} required disabled={isLoading || isGeneratingSP} />
                </div>
                <div className="form-group">
                  <label>Trainer Number</label>
                  <input type="text" value={trainerNumber} onChange={(e) => setTrainerNumber(e.target.value)} placeholder="ID No." disabled={isLoading || isGeneratingSP} />
                </div>
              </div>

              <div className="form-group">
                <label>Name of Trainer</label>
                <input type="text" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} required placeholder="Full Name" disabled={isLoading || isGeneratingSP} />
              </div>

              <div className="form-group">
                <label>Institution Name</label>
                <input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} required placeholder="Institution Name" disabled={isLoading || isGeneratingSP} />
              </div>
              
              <div className="form-group">
                <label>Logo (Optional)</label>
                <div className="logo-uploader">
                  <input type="file" id="logoUpload" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <label htmlFor="logoUpload" className="logo-upload-label">
                    {logoSrc ? <img src={logoSrc} className="logo-preview" /> : <span>🖼️ Upload</span>}
                  </label>
                  {logoSrc && <button type="button" className="remove-logo-btn" onClick={() => setLogoSrc('')} disabled={isLoading || isGeneratingSP}>Remove</button>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Total Weeks</label>
                  <input type="number" value={numWeeks} onChange={(e) => setNumWeeks(e.target.value)} required min="1" disabled={isLoading || isGeneratingSP} />
                </div>
                <div className="form-group">
                  <label>Sessions/Week</label>
                  <input type="number" value={numLessons} onChange={(e) => setNumLessons(e.target.value)} required min="1" disabled={isLoading || isGeneratingSP} />
                </div>
              </div>

              <div className="form-group">
                <label>Class Group</label>
                <input type="text" value={classGroup} onChange={(e) => setClassGroup(e.target.value)} placeholder="e.g. F-PLUM/24J" disabled={isLoading || isGeneratingSP} />
              </div>

              <div className="form-group">
                <label>Curriculum Text</label>
                <textarea 
                  value={curriculum} 
                  onChange={(e) => setCurriculum(e.target.value)} 
                  rows={5} 
                  required 
                  placeholder="Paste Job Task and Benchmarks here..."
                  disabled={isLoading || isGeneratingSP}
                ></textarea>
              </div>

              <button type="submit" className="generate-btn" disabled={isLoading || isGeneratingSP || !isApiConfigured}>
                {isLoading ? 'Batching Matrix Rows...' : `1. Generate Plan for ${new Date().getFullYear()}`}
              </button>
              {!isApiConfigured && <p className="api-notice">⚠️ API Key Missing</p>}
            </form>
          ) : (
            <div className="import-section">
              <div className="form-group">
                <label>Paste Learning Plan HTML</label>
                <textarea 
                  value={importHtml} 
                  onChange={(e) => setImportHtml(e.target.value)} 
                  rows={10} 
                  placeholder="Paste HTML source code here..."
                  className="import-textarea"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Or Upload Document (PDF, DOCX, HTML)</label>
                <div className={`file-upload-zone ${isExtracting ? 'extracting' : ''}`}>
                  <input type="file" accept=".pdf,.docx,.html,.txt" onChange={handleFileUpload} className="file-input-simple" disabled={isExtracting} />
                  {isExtracting && <div className="extract-loader">Parsing document...</div>}
                </div>
              </div>
              <button onClick={handleImportPlan} className="generate-btn" disabled={isExtracting || !importHtml}>
                Confirm Import
              </button>
              <p className="hint-small">PDF extraction is native; DOCX is text-extracted locally.</p>
            </div>
          )}

          {learningPlan && !isGeneratingSP && (
             <div className="next-step-promo">
                <p>Plan is ready! Build detailed portraits next.</p>
                <button onClick={handleGenerateSPs} className="generate-btn secondary">
                   2. Build Session Plans (Portrait)
                </button>
             </div>
          )}
        </aside>

        <main className="main-content">
          {(isLoading || isGeneratingSP || isExtracting) && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <h3>{generationStep}</h3>
              <p>{isExtracting ? 'Reading tables from your document...' : 'Processing sessions as independent solid units.'}</p>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          {!isLoading && !isGeneratingSP && !learningPlan && !error && !isExtracting && (
             <div className="placeholder">
                <div className="placeholder-icon">📏</div>
                <h2>Document Studio</h2>
                <p>Either draft a new plan from curriculum text or import a PDF/DOCX Learning Plan.</p>
                <p className="hint">Uploaded documents are parsed by Gemini to extract the 9-column matrix.</p>
             </div>
          )}

          {(learningPlan || sessionPlans) && (
            <div className="results-container">
              <div className="tabs-bar">
                <div className="tabs">
                  <button className={`tab-btn ${activeTab === 'learningPlan' ? 'active' : ''}`} onClick={() => setActiveTab('learningPlan')}>
                    Learning Matrix
                  </button>
                  <button className={`tab-btn ${activeTab === 'sessionPlans' ? 'active' : ''}`} onClick={() => setActiveTab('sessionPlans')} disabled={!sessionPlans && !isGeneratingSP}>
                    Session Plans
                  </button>
                </div>
                <div className="actions">
                  <button onClick={() => handleDownload(activeTab === 'learningPlan' ? learningPlan : sessionPlans, activeTab === 'learningPlan' ? 'Learning_Plan' : 'Session_Plans')} className="download-btn-top">
                    Download .docx
                  </button>
                </div>
              </div>

              <div className="tab-content">
                <div className={`a4-preview ${activeTab === 'learningPlan' ? 'landscape' : 'portrait'}`}>
                   <div className="html-output" dangerouslySetInnerHTML={{ __html: activeTab === 'learningPlan' ? learningPlan : sessionPlans }} />
                   {!sessionPlans && activeTab === 'sessionPlans' && isGeneratingSP && (
                      <div className="generating-inline-overlay">
                         <div className="spinner"></div>
                         <p>Expanding portraits... (2-Hour Lessons)</p>
                      </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const STYLES = `
  :root {
    --primary-color: #0f172a;
    --accent-color: #2563eb;
    --secondary-color: #10b981;
    --bg-color: #f1f5f9;
    --surface-color: #ffffff;
    --border-color: #cbd5e1;
    --text-main: #1e293b;
    --text-muted: #64748b;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-color); color: var(--text-main); line-height: 1.4; }
  .app-container { display: flex; height: 100vh; overflow: hidden; padding: 0.5rem; gap: 0.5rem; }
  
  .sidebar { width: 350px; background: var(--surface-color); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; border: 1px solid var(--border-color); overflow-y: auto; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .sidebar-header { margin-bottom: 1rem; border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem; }
  .sidebar-header h1 { font-size: 1.1rem; color: var(--primary-color); font-weight: 800; margin-bottom: 0.5rem; }
  
  .sidebar-toggle { display: flex; background: #f1f5f9; border-radius: 6px; padding: 2px; gap: 2px; }
  .sidebar-toggle button { flex: 1; border: none; padding: 0.4rem; font-size: 0.65rem; font-weight: 700; border-radius: 4px; cursor: pointer; color: #64748b; transition: all 0.2s; background: transparent; }
  .sidebar-toggle button.active { background: white; color: var(--accent-color); box-shadow: 0 1px 2px rgba(0,0,0,0.1); }

  .form-group { margin-bottom: 0.65rem; }
  .form-group label { display: block; font-size: 0.65rem; font-weight: 700; margin-bottom: 0.2rem; color: var(--text-muted); text-transform: uppercase; }
  .form-group input, .form-group textarea { width: 100%; padding: 0.45rem; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.75rem; font-family: inherit; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  
  .import-textarea { font-family: monospace; font-size: 0.65rem !important; resize: vertical; }
  .file-input-simple { font-size: 0.65rem; padding: 0.2rem 0; border: none !important; width: 100%; }
  .file-upload-zone { position: relative; padding: 0.5rem; border: 1px dashed var(--border-color); border-radius: 4px; background: #fafafa; }
  .file-upload-zone.extracting { opacity: 0.6; }
  .extract-loader { font-size: 0.6rem; color: var(--accent-color); font-weight: bold; margin-top: 0.3rem; }
  .hint-small { font-size: 0.6rem; color: var(--text-muted); margin-top: 0.5rem; text-align: center; }

  .logo-uploader { display: flex; align-items: center; gap: 0.4rem; }
  .logo-upload-label { width: 40px; height: 40px; border: 1px dashed var(--border-color); border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fafafa; font-size: 0.5rem; overflow: hidden; }
  .logo-preview { width: 100%; height: 100%; object-fit: contain; }
  .remove-logo-btn { font-size: 0.6rem; color: #dc2626; border: none; background: none; cursor: pointer; text-decoration: underline; }

  .generate-btn { padding: 0.75rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; font-weight: 700; cursor: pointer; margin-top: 0.5rem; transition: background 0.2s; font-size: 0.8rem; width: 100%; }
  .generate-btn:hover { background: #1d4ed8; }
  .generate-btn.secondary { background: var(--secondary-color); margin-top: 1rem; }
  .generate-btn:disabled { background: #94a3b8; cursor: not-allowed; }

  .next-step-promo { margin-top: 1.5rem; padding: 1rem; background: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; text-align: center; }
  .next-step-promo p { font-size: 0.75rem; font-weight: 600; color: #065f46; margin-bottom: 0.5rem; }

  .main-content { flex: 1; background: #64748b; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  .placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #334155; text-align: center; padding: 2rem; background: #f1f5f9; border-radius: 4px; margin: 4px; }
  .placeholder-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.1; }
  .hint { font-size: 0.75rem; font-weight: 600; color: var(--accent-color); margin-top: 1rem; }

  .loading-spinner { position: absolute; inset: 0; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 50; }
  .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  .results-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .tabs-bar { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: #ffffff; border-bottom: 1px solid #cbd5e1; }
  .tabs { display: flex; gap: 0.5rem; }
  .tab-btn { padding: 0.5rem 0.75rem; border: none; background: #f1f5f9; font-weight: 700; color: #475569; cursor: pointer; border-radius: 4px; font-size: 0.75rem; }
  .tab-btn.active { color: white; background: var(--accent-color); }
  .download-btn-top { padding: 0.4rem 0.8rem; background: #0f172a; color: white; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-weight: 600; }

  .tab-content { flex: 1; overflow: auto; padding: 2rem; display: flex; flex-direction: column; align-items: center; background: #475569; }
  .a4-preview { background: white; padding: 0.5in; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); border: 1px solid #000; box-sizing: border-box; }
  .a4-preview.landscape { width: 11.69in; min-height: 8.27in; }
  .a4-preview.portrait { width: 8.27in; min-height: 11.69in; }

  .generating-inline-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5; }

  .html-output { color: black; font-family: 'Times New Roman', serif; }
  .html-output table { border-collapse: collapse; width: 100%; margin-bottom: 15pt; border: 1px solid black; table-layout: fixed; }
  .html-output th, .html-output td { border: 1px solid black; padding: 4px; text-align: left; font-size: 8pt; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; border-style: solid; }
  .html-output th { background: #f2f2f2; text-align: center; font-weight: bold; }
  .html-output img { max-height: 80px; width: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
  .html-output .page-break { page-break-after: always; border-top: 1px solid #ddd; margin: 40px 0; padding-top: 40px; }

  .error-message { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 6px; margin: 1rem; text-align: center; font-size: 0.8rem; font-weight: 600; border: 1px solid #f87171; }
  .api-notice { font-size: 0.65rem; color: #dc2626; margin-top: 0.3rem; font-weight: bold; text-align: center; }

  @media (max-width: 1200px) {
    .app-container { flex-direction: column; height: auto; }
    .sidebar { width: 100%; height: auto; }
    .main-content { height: 700px; }
    .a4-preview { transform: scale(0.6); transform-origin: top center; }
  }
`;

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);