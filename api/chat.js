// Vercel serverless endpoint: POST /api/chat
// Set GEMINI_API_KEY in Vercel Project Settings > Environment Variables.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Please enter a message." });
  if (message.length > 2000) return res.status(413).json({ error: "Message is too long. Keep it under 2000 characters." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI is not configured yet. Add GEMINI_API_KEY in Vercel Environment Variables." });
  }

  const systemPrompt = `You are Ninaivugal Ideas, a warm, creative surprise-planning assistant. Give fresh, specific and varied answers; do not reuse a fixed template. Use the user's exact occasion, relationship, interests, budget, location constraints, and time available when given. Suggest 3-5 practical ideas with a mix of sentimental, experience-based, and gift options. Keep budget realistic and never invent product prices or claim a booking/purchase was made. If key details are missing, give a useful first answer and ask at most one short follow-up question. Reply in the language style the user uses (English or Tamil/Tanglish). Be kind, concise, and avoid suggesting unsafe or invasive surprises.`;
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 700 }
      })
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Gemini API error:", data?.error?.message || r.status);
      return res.status(502).json({ error: "AI service is temporarily unavailable. Please try again shortly." });
    }
    const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!reply) return res.status(502).json({ error: "AI returned an empty response. Please try again." });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI endpoint error:", error);
    return res.status(500).json({ error: "Could not connect to the AI service. Please try again." });
  }
}
