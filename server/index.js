import 'dotenv/config'
import express from 'express'

const app = express()
app.use(express.json())

const PORT = process.env.SERVER_PORT || 8787

// 'ollama' runs fully local (needs Ollama running here — fine for dev, not
// for real visitors). 'gemini' and 'groq' are free hosted APIs — gemini is
// primary, groq is the automatic fallback if gemini's call fails for any
// reason (key issue, quota, model rename, network), so the chat degrades
// gracefully instead of going straight to the frontend's canned answers.
const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama'

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
// A small text-only model, not a vision-language one — this chat never sees
// images, and qwen2.5vl:7b's vision encoder was pure dead weight making every
// reply noticeably slower for no benefit.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
// gemini-2.5-flash was retired ("no longer available to new users") — this
// is the current replacement as of the key's own error message.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

const GROQ_API_KEY = process.env.GROQ_API_KEY
// llama-3.3-70b-versatile isn't on this key's available model list — this is
// one of the models that actually is (see GET /openai/v1/models). It's a
// reasoning model, so reasoning_effort is set low in the request itself to
// stop it burning the whole token budget on internal reasoning before ever
// emitting a reply (confirmed: default effort returned empty content).
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b'

const SYSTEM_PROMPT = `You are Mo, the assistant for Motoka — a live platform helping car owners in Nigeria manage their driver's license, vehicle license, insurance, and roadworthiness renewals, plus vehicle maintenance and a verified spare parts marketplace.

Ground rules:
- Motoka is live. Don't say it's pre-launch, coming soon, or waitlist-only — that's outdated.
- You don't have access to a real user's account, documents, or payment status in this chat, so don't claim to check or process a specific renewal, payment, or document yourself — instead explain how they'd do it in the app (e.g. via the Renew Licence button or their dashboard).
- If asked something unrelated to cars, documents, or Motoka, politely say that's outside what you can help with and redirect to Motoka topics.
- If the user says they want to renew, register, or otherwise start a specific document (license, plate, insurance, roadworthiness, etc.), do NOT explain app navigation steps. Instead ask for their plate number and phone number, and tell them Motoka will call them shortly to complete it. Once they've given both, confirm briefly that someone will call soon — don't ask for anything else or describe further steps.

Reply format — follow this structure every time, in Markdown:
1. Open with one direct sentence that answers the question. No preamble like "Great question!".
2. If the answer has more than one part or step, add a short bullet list (2-4 bullets, each under 12 words, using "- "). Skip the list entirely if one sentence fully answers it.
3. Only if genuinely relevant, close with a single short line pointing to the Renew Licence button or signing up — not on every message, only when the user asks about getting started, live features, or timing.
- Use **bold** on at most one key term per message, never on full sentences.
- No headers, tables, code blocks, or emoji.
- Keep the whole reply under 70 words.`

async function askOllama(message, history) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: message },
  ]

  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // num_predict caps generation length (replies are capped at ~70 words by
    // the prompt anyway, so there's no reason to let it keep generating past
    // that — this bounds worst-case latency instead of trusting the model to
    // stop on its own).
    body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false, options: { num_predict: 160 } }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Ollama error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data?.message?.content ?? ''
}

async function askGemini(message, history) {
  if (!GEMINI_API_KEY) {
    const err = new Error('Gemini API key not configured.')
    err.status = 503
    throw err
  }

  const contents = [
    ...history.map((m) => ({
      role: m.from === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ]

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        // thinkingLevel LOW curbs gemini-3.6-flash's default "thinking" pass
        // (it otherwise silently burns ~200 tokens of real latency reasoning
        // about even a plain "hi" before answering) — LOW is the lowest
        // level this model accepts; thinkingBudget (an older field name) and
        // thinkingLevel "OFF" both 400 on this model.
        generationConfig: { maxOutputTokens: 300, thinkingConfig: { thinkingLevel: 'LOW' } },
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
}

async function askGroq(message, history) {
  if (!GROQ_API_KEY) {
    const err = new Error('Groq API key not configured.')
    err.status = 503
    throw err
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: message },
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: 300, reasoning_effort: 'low' }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Groq error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

const PROVIDERS = { ollama: askOllama, gemini: askGemini, groq: askGroq }

async function ask(message, history) {
  const primary = PROVIDERS[AI_PROVIDER] || askOllama

  try {
    return await primary(message, history)
  } catch (err) {
    // Gemini is hosted but still a single point of failure (bad key, quota,
    // a renamed model like the one that broke this originally) — Groq is a
    // second free hosted provider to fall back to before giving up and
    // letting the frontend's local canned answers take over.
    if (AI_PROVIDER === 'gemini' && GROQ_API_KEY) {
      console.error('Gemini failed, falling back to Groq:', err.message)
      return await askGroq(message, history)
    }
    throw err
  }
}

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body || {}
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message.' })
  }
  const safeHistory = Array.isArray(history) ? history : []

  try {
    const text = await ask(message, safeHistory)

    if (!text) {
      return res.status(502).json({ error: 'AI returned an empty response.' })
    }
    res.json({ text })
  } catch (err) {
    console.error(`Chat proxy failed (provider: ${AI_PROVIDER}):`, err.message)
    res.status(err.status || 500).json({ error: 'AI service unreachable.' })
  }
})

app.listen(PORT, () => {
  console.log(`Chat proxy listening on http://localhost:${PORT} (provider: ${AI_PROVIDER}, groq fallback: ${Boolean(GROQ_API_KEY)})`)
})
