import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    throw new Error("Gemini API Key not found in environment. Please check your settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLearningPlan = async (params: {
  unitTitle: string;
  trainerName: string;
  trainerNumber: string;
  institutionName: string;
  level: string;
  classGroup: string;
  numTrainees: string;
  numWeeks: string;
  numLessons: string;
  curriculum: string;
  onStep: (step: string) => void;
}) => {
  const ai = getAI();
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-GB');
  const totalSessions = parseInt(params.numWeeks) * parseInt(params.numLessons);
  const totalHours = totalSessions * 2;

  params.onStep('Extracting Metadata & Benchmarks...');
  const metaResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Curriculum: ${params.curriculum}. Create the metadata header and 9-column matrix start.`,
    config: { 
      systemInstruction: `You are a TVET CDACC expert. Generate a Metadata table and a Learning Plan table header in HTML.
  DO NOT use markdown blocks. Return ONLY HTML.
  
  Structure:
  1. A Metadata Table with border="1" and width="100%". It MUST have exactly two columns.
     - Row 1: <td><b>Unit of Competency:</b> ${params.unitTitle}</td><td><b>Unit Code:</b> [EXTRACT FROM CURRICULUM]</td>
     - Row 2: <td><b>Name of Trainer:</b> ${params.trainerName}</td><td><b>Trainer Number:</b> ${params.trainerNumber}</td>
     - Row 3: <td><b>Institution:</b> ${params.institutionName}</td><td><b>Level:</b> ${params.level}</td>
     - Row 4: <td><b>Date of Preparation:</b> ${currentDate}</td><td><b>Class/Group:</b> ${params.classGroup}</td>
     - Row 5: <td><b>Number of Trainees:</b> ${params.numTrainees}</td><td><b>Total Unit Hours:</b> ${totalHours} (Each Lesson: 2 Hours)</td>
     - Row 6: <td><b>Total Number of Sessions:</b> ${totalSessions}</td><td><b>Status:</b> Original</td>
     - Row 7 (COLSPAN 2): <td><b>Skill or Job Task:</b> [EXTRACT FULL TEXT FROM CURRICULUM]</td>
     - Row 8 (COLSPAN 2): <td><b>Benchmark or Criteria to be used:</b> [LIST ALL POINTS FROM CURRICULUM]</td>
  
  2. The opening <table> tag and <thead> with EXACTLY 9 headers: 
     WEEK, SESSION NO, SESSION TITLE, LEARNING OUTCOMES, TRAINER ACTIVITIES, TRAINEE ACTIVITIES, Resources & Refs, Learning Checks/ Assessments, Reflections & Date.
  
  IMPORTANT: DO NOT CLOSE the <table> tag yet.`
    }
  });

  const cleanResponse = (text: string | undefined) => text?.replace(/```html/g, '').replace(/```/g, '').trim() || '';
  let finalHtml = cleanResponse(metaResponse.text) + '<tbody>';

  const rowBatchSize = 6;
  const numRowBatches = Math.ceil(totalSessions / rowBatchSize);

  for (let i = 0; i < numRowBatches; i++) {
    const start = i * rowBatchSize + 1;
    const end = Math.min((i + 1) * rowBatchSize, totalSessions);
    const currentWeek = Math.ceil(start / parseInt(params.numLessons));
    
    params.onStep(`Populating Sessions ${start} to ${end} (Week ${currentWeek})...`);

    const rowResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate matrix rows for sessions ${start} to ${end}.`,
      config: {
        systemInstruction: `You are a TVET CDACC expert. Generate EXACTLY ${end - start + 1} <tr> rows for the matrix.
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
    9. Reflections & Date: "Completed on ___/___/${now.getFullYear()}"

    Every session is 2 HOURS. CURRICULUM: ${params.curriculum}`
      }
    });

    finalHtml += cleanResponse(rowResponse.text);
  }

  finalHtml += '</tbody></table>';
  return finalHtml;
};
