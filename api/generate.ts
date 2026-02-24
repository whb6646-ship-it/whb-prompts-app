import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const { image, options } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Generate a detailed universal AI art prompt based on this image." },
            {
              inlineData: {
                mimeType: "image/png",
                data: image,
              },
            },
          ],
        },
      ],
    });

    const text = result.text;

    return res.status(200).json({ prompt: text });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}