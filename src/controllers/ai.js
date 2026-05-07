import axios from "axios";

export const suggestReplies = async (req, res) => {
  const { message, context = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "message is required" });

  const history = context.length
    ? context.slice(-4).map((m, i) => `${i % 2 === 0 ? "Them" : "You"}: ${m}`).join("\n") + "\n\n"
    : "";

 const prompt = `${history}
You are a smart reply assistant inside a Snapchat-like chat app used by Indian users.

The user received this message:
"${message}"

Generate exactly 3 short casual reply suggestions.

Rules:

* Maximum 8 words per reply
* Replies should feel natural, friendly, respectful, and human
* Use the SAME language and tone as the original message
* If the message is in Hindi or Hinglish, reply in natural Hinglish
* Replies should sound like real Indian chat conversations between friends
* Avoid robotic, cringe, overly flirty, or rude replies
* Keep the tone warm and conversational like normal WhatsApp/Snapchat chats
* Use casual Indian expressions naturally when suitable

Examples:

Message: "aur batao kaise ho?"
Replies:
["mast hu yaar, tum batao", "sab badhiya, aap sunao", "ekdum badhiya chal raha"]

Message: "kya kar rahe ho?"
Replies:
["bas thoda kaam chal raha", "kuch khaas nahi yaar", "abhi free hi hu"]

Message: "what's up?"
Replies:
["all good, you say?", "nothing much, what about you?", "just chilling right now"]

Return ONLY a valid JSON array.
No explanation.
No markdown.
`;


  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",   // fast + free
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const raw = response.data.choices[0].message.content;

    let suggestions = [];
    try {
      const match = raw.match(/\[[\s\S]*?\]/);
      suggestions = match ? JSON.parse(match[0]).slice(0, 3) : [];
    } catch {
      suggestions = raw
        .split("\n")
        .map((l) => l.replace(/^[\d.\-"'\s*]+/, "").trim())
        .filter((l) => l.length > 1 && l.length < 60)
        .slice(0, 3);
    }

    res.json({ suggestions });
  } catch (err) {
    console.error("[AI] Groq error:", err.message);
    res.status(500).json({ error: "AI service error" });
  }
};