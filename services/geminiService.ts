import { PromptOptions } from "../types";

const API_URL = "https://whb-prompts-app.vercel.app/api/generate";

export async function generateImagePrompt(base64Data: string, options: any) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Data,
      options: options,
    }),
  });

  return await res.json();
}