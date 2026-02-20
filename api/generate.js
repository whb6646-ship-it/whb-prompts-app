export default async function handler(req, res) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key missing" });
  }

  return res.status(200).json({
    message: "WHB Prompts API ready",
    app: "WHB Prompts App"
  });
}