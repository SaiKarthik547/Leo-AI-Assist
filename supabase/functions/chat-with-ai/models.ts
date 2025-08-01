// Free models available through OpenRouter
export const FREE_MODELS = {
  // Meta's Llama 3.1 8B - Good performance, free tier
  LLAMA_3_1_8B: 'meta-llama/llama-3.1-8b-instruct:free',
  
  // Microsoft's Phi-3 Mini - Fast and efficient
  PHI_3_MINI: 'microsoft/phi-3-mini-4k-instruct:free',
  
  // Google's Gemma 2B - Lightweight and fast
  GEMMA_2B: 'google/gemma-2b-it:free',
  
  // Mistral's 7B model - Good balance of performance and speed
  MISTRAL_7B: 'mistralai/mistral-7b-instruct:free',
  
  // Default model to use
  DEFAULT: 'meta-llama/llama-3.1-8b-instruct:free'
} as const;

export type FreeModelType = keyof typeof FREE_MODELS;

// Helper function to get model name
export function getModelName(modelType: FreeModelType = 'DEFAULT'): string {
  return FREE_MODELS[modelType];
} 