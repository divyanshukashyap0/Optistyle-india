// This file is deprecated. 
// Please use services/aiService.ts which interacts with the backend abstraction layer.
// This allows for provider-agnostic AI integration (OpenAI, DeepSeek, etc.).

export const getStylistRecommendation = async (userQuery: string): Promise<string> => {
  console.warn("Using deprecated geminiService. Please migrate to aiService.");
  return "Please update your imports to use services/aiService.ts";
};