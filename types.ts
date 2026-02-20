
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
