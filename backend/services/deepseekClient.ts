
// backend/services/deepseekClient.ts
import { ENV } from '../config/env.ts';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Generates a response from the AI Provider (DeepSeek).
 * Returns null if API key is missing or request fails, allowing the caller to use a fallback.
 */
export const generateAIResponse = async (
  userMessage: string,
  systemContext: string
): Promise<string | null> => {
  // 1. Check for API Key
  if (!ENV.AI_API_KEY) {
    console.warn('[AI Service] No API Key provided (AI_API_KEY). Switching to fallback engine.');
    return null;
  }

  try {
    const messages: AIMessage[] = [
      { role: 'system', content: `You are an expert optical assistant for OptiStyle. Context: ${systemContext}` },
      { role: 'user', content: userMessage }
    ];

    // 2. Make REST Call (Native fetch for Node 18+)
    const response = await fetch(ENV.AI_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: ENV.AI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as AIResponse;
    
    // 3. Extract Content
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    
    return null;

  } catch (error) {
    console.error('[AI Service] Request Failed:', error);
    return null; // Return null to trigger fallback
  }
};
