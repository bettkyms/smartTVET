import { GoogleGenAI } from "@google/genai";
import { getApiKey } from "./apiKey";

/**
 * Standard utility to call Gemini with automatic retry for 503 and high-demand errors.
 */
export const callGeminiWithRetry = async (
  options: {
    model: string;
    contents: any;
    systemInstruction?: string;
    generationConfig?: any;
  },
  retries = 3
): Promise<any> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const result = await ai.models.generateContent({
      model: options.model,
      contents: options.contents,
      config: {
        systemInstruction: options.systemInstruction,
        ...(options.generationConfig || {}),
      }
    });
    return result;
  } catch (err: any) {
    const errorMessage = err.message || "";
    const isRetryable = 
      retries > 0 && 
      (errorMessage.includes('503') || 
       errorMessage.includes('Service Unavailable') || 
       errorMessage.includes('high demand') ||
       errorMessage.includes('Too Many Requests') ||
       errorMessage.includes('429'));

    if (isRetryable) {
      const delay = 3000 * (4 - retries); // Exponential-ish backoff: 3s, 6s, 9s
      console.warn(`Gemini API Busy/Rate limited. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(r => setTimeout(r, delay));
      return callGeminiWithRetry(options, retries - 1);
    }
    throw err;
  }
};
