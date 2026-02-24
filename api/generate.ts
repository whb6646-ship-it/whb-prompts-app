import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // ✅ Allow requests from browser & mobile
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

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

    const text = result.text ?? "No response";

    return res.status(200).json({ prompt: text });

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Server crashed" });
  }
}