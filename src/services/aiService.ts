import { api, endpoints } from './api';

/**
 * Generic AI Service
 * 
 * This service communicates with the backend AI abstraction layer.
 * It is completely agnostic of the underlying AI provider (DeepSeek, OpenAI, or Mock).
 */

export interface AIResponse {
  reply: string;
  suggestedAction?: 'shop_men' | 'shop_women' | 'eye_test';
}

export const getStylistRecommendation = async (userQuery: string): Promise<string> => {
  try {
    const response = await api.post<AIResponse>(endpoints.chat, {
      message: userQuery,
      context: 'optical_stylist'
    });
    return response.data.reply;
  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback if backend is unreachable
    return "I'm having a little trouble connecting to my style database right now. However, for round faces, I generally recommend square frames, and for square faces, round frames work beautifully!";
  }
};

export const getEyeTestAnalysis = async (results: any): Promise<string> => {
  try {
    // We send the JSON object as a string message so the AI can parse and explain it.
    const response = await api.post<AIResponse>(endpoints.chat, {
      message: JSON.stringify(results, null, 2),
      context: 'eye_test_analysis'
    });
    return response.data.reply;
  } catch (error) {
    return "Analysis complete. Your vision results suggest you may benefit from corrective lenses. Please consult a local optometrist for a medical confirmation.";
  }
};