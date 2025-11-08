import { GoogleGenAI } from "@google/genai";
import { EmotionState, TonePack } from '../types';

// Using Vite's import.meta.env for environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates an AI response using the Gemini API based on user input and emotional context.
 */
export async function getGeminiResponse(
  text: string,
  emotion: EmotionState,
  tonePack: TonePack,
  isLearningMode: boolean
): Promise<string> {
    const model = 'gemini-2.5-flash';

    const persona = "You are the AI brain of NeuroBridge, an emotion-aware conversation assistant designed to help specially-abled children learn better. Your persona is warm, calm, and emotionally intelligent. Avoid robotic phrasing; sound human and observant.";
    
    const context = `
      - Current user emotional state: ${emotion.name}.
      - Your goal is to respond with empathy and support based on this emotion.
      - We are in ${isLearningMode ? 'Learning Mode' : 'Conversation Mode'}. Tailor your response accordingly.
      - Use the '${tonePack.name}' cultural tone.
    `;
    
    const responseStyleGuide = isLearningMode 
      ? tonePack.learningResponses[emotion.name] 
      : tonePack.responses[emotion.name];

    const systemInstruction = `${persona}\n\nCONTEXT:\n${context}\n\nRESPONSE STYLE GUIDE EXAMPLE (do not repeat this exact phrase, but match its tone and intent):\n"${responseStyleGuide}"`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `User message: "${text}"`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error fetching from Gemini API:', error);
        throw new Error('Failed to get a response from the AI. Please check your connection and API key.');
    }
}
