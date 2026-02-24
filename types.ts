
export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPro?: boolean;
}

export interface PromptHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface PromptOptions {
  midjourneyFormat: boolean;
  stableDiffusionFormat: boolean;
  negativePrompt: boolean;
  styleTags: boolean;
  colorPalette: boolean;
  lightingBreakdown: boolean;
}
const API_URL = "https://whb-prompts-app.vercel.app/api/generate";

export async function generateImagePrompt(base64Data: string, options: any) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Data,
      options,
    }),
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return await res.json();
}
