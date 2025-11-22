import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDescription = async (title: string, type: 'Show' | 'Episode'): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
        return "Gemini API Key is missing. Please configure it to use AI features.";
    }
    const model = 'gemini-2.5-flash';
    const prompt = `Write a short, engaging, and creative ${type.toLowerCase()} description (max 200 chars) for a sci-fi/drama titled "${title}".`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate description via AI.";
  }
};
