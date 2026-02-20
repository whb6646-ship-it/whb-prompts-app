
import { GoogleGenAI } from "@google/genai";
import { PromptOptions } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * GENERATE IMAGE PROMPT
 * Uses Gemini to analyze the image reference and generate a professional prompt for MJ/SD.
 */
export const generateImagePrompt = async (base64Data: string, options: PromptOptions): Promise<string> => {
  // Extract data and mimeType from base64 string
  const [header, data] = base64Data.split(',');
  const mimeType = header.split(':')[1].split(';')[0];

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: data,
    },
  };

  const textPart = {
    text: `Analyze this image and generate a highly detailed image generation prompt.
    Describe the subject, environment, lighting, and style.
    
    Configuration:
    - Target Model: ${options.midjourneyFormat ? 'Midjourney v6.1' : options.stableDiffusionFormat ? 'Stable Diffusion XL' : 'General'}
    - Include Style Tags: ${options.styleTags}
    - Include Color Palette: ${options.colorPalette}
    - Include Lighting Breakdown: ${options.lightingBreakdown}
    - Include Negative Prompt: ${options.negativePrompt}
    
    Return ONLY the final prompt string. If a negative prompt is requested, append it at the end clearly labeled as "[NEGATIVE PROMPT]".`
  };

  // Correct: Always use ai.models.generateContent with model and contents
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, textPart] },
  });

  // Correct: Access .text as a property, not a method
  let prompt = response.text || "Could not generate prompt.";

  // Post-processing for model formatting consistency
  if (options.midjourneyFormat && !prompt.includes('--v')) {
    prompt += " --v 6.1 --stylize 300 --ar 16:9";
  }

  return prompt;
};

/**
 * AI ASSISTANT: PROMPT REFINER
 * Uses Gemini to manually tweak and polish the generated output based on user feedback.
 */
export const refinePromptWithAI = async (originalPrompt: string, instruction: string): Promise<string> => {
  // Correct: Call generateContent with model and prompt string
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a professional Prompt Engineer. Your task is to modify the following image generation prompt based on the user's specific instruction. Keep the professional formatting.

Original Prompt:
"${originalPrompt}"

User's Instruction:
"${instruction}"

Output ONLY the revised prompt. Do not include any explanations or conversational text.`,
    config: {
      temperature: 0.7,
    }
  });

  // Correct: Access .text as a property
  return response.text || originalPrompt;
};
