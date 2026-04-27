/**
 * Utility to get the Gemini API Key from environment variables.
 * Prioritizes VITE_ prefix for client-side frameworks like Vite/Vercel.
 */
export const getApiKey = (): string | null => {
  const env = import.meta.env;
  let apiKey = env.VITE_GEMINI_API_KEY || env.VITE_API_KEY;
  
  if (!apiKey && typeof process !== 'undefined' && process.env) {
    apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || (process.env as any).VITE_GEMINI_API_KEY;
  }
                 
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return null;
  }
  
  return apiKey;
};
