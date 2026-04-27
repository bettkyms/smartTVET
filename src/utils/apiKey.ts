/**
 * Utility to get the Gemini API Key from environment variables.
 * Prioritizes VITE_ prefix for client-side frameworks like Vite/Vercel.
 */
export const getApiKey = (): string | null => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                 import.meta.env.VITE_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.API_KEY;
                 
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    return null;
  }
  
  return apiKey;
};
