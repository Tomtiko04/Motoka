import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { X, MessageCircle, Send } from 'lucide-react'
import config from '../../config/config'

const CONTACT_KEY = 'motoka_chat_contact'

function loadContact() {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_KEY) || 'null')
  } catch {
    return null
  }
}

function saveContact(contact) {
  try {
    localStorage.setItem(CONTACT_KEY, JSON.stringify(contact))
  } catch {
    // localStorage unavailable (private mode, etc) — contact just won't persist
  }
}

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 space-y-1 list-disc marker:text-brand-blue">{children}</ul>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand-blue underline">
      {children}
    </a>
  ),
}

const introFor = (name) =>
  `Hi${name ? ` ${name}` : ''} 👋 I'm Mo. Ask me anything about renewing your vehicle papers — what it costs, what you need, or what to do when something has already expired.`

const FALLBACK =
  "I can't reach the assistant right now — check the FAQ section below, or enter your plate number on the home page to start a renewal."

const RULES = [
  {
    keywords: ['cost', 'price', 'fee', 'much', 'pay'],
    answer:
      "You'll see the full breakdown — the official government fee plus Motoka's service fee — before you pay anything. No hidden charges.",
  },
  {
    keywords: ['fake', 'genuine', 'scam', 'real', 'verify', 'agent'],
    answer:
      "Every renewal is checked against the issuing agency's own records before it's marked complete in your wallet, so it isn't just a printout from a roadside agent.",
  },
  {
    keywords: ['expired', 'expire', 'lapsed', 'late'],
    answer:
      "Yes, Motoka can still help with expired documents — usually it just means a higher renewal fee or a short extra step, not starting over.",
  },
  {
    keywords: ['insurance'],
    answer: 'Insurance renewal is one of the documents Motoka tracks and reminds you about, alongside your license and roadworthiness certificate.',
  },
  {
    keywords: ['maintenance', 'mechanic', 'repair', 'service'],
    answer: 'You can track service history and book vetted mechanics for routine maintenance through Motoka.',
  },
  {
    keywords: ['part', 'parts', 'ladipo', 'spare'],
    answer: 'The verified parts marketplace lets you shop genuine spare parts from vetted vendors with comparable prices.',
  },
  {
    keywords: ['renew', 'renewal', 'license', 'licence'],
    answer:
      "Enter your plate or license number, confirm your details, and pay for the renewal in the app — our team handles the rest.",
  },
  {
    keywords: ['account', 'sign up', 'signup', 'register', 'join'],
    answer: "Join the waitlist below with your email. When we launch, you'll get an invite to create your account.",
  },
  {
    keywords: ['reminder', 'alert', 'notify'],
    answer: "Motoka sends alerts ahead of every expiry date so you can renew before penalties or lapses in compliance.",
  },
]

function getLocalAnswer(message) {
  const lower = message.toLowerCase()
  const match = RULES.find((rule) => rule.keywords.some((k) => lower.includes(k)))
  return match ? match.answer : FALLBACK
}

// The prototype posted { message, history } to its own bundled express
// server. Motoka's assistant is POST /public/mo/chat, which takes an OpenAI
// -shaped messages array and answers unauthenticated — the signed-in
// /mo/chat would 401 for every visitor on this page.
//
// The keyword fallback below is deliberately kept: if the endpoint is rate
// limited, the key is unset, or the network drops, a visitor still gets a
// useful answer instead of an error bubble.
const MAX_TURNS = 12

async function getAnswer(message, history) {
  try {
    const turns = history
      .filter((m) => m.text && !m.intro)
      .map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }))

    const messages = [...turns, { role: 'user', content: message }].slice(-MAX_TURNS)

    const res = await fetch(`${config.getApiBaseUrl()}/public/mo/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    const data = await res.json()
    if (!res.ok || !data?.reply) throw new Error(data?.message || 'AI unavailable')
    return data.reply
  } catch {
    return getLocalAnswer(message)
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [contact, setContact] = useState(() => loadContact())
  const [nameInput, setNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  // Flagged rather than matched on its text — the greeting is not conversation
  // history and must not be replayed to the endpoint as an assistant turn.
  const [messages, setMessages] = useState(() => [
    { from: 'mo', text: introFor(contact?.name), intro: true },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const threadRef = useRef(null)

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  function handleContactSubmit(e) {
    e.preventDefault()
    const name = nameInput.trim()
    const phone = phoneInput.trim()
    if (!name || !phone) return

    const newContact = { name, phone }
    saveContact(newContact)
    setContact(newContact)
    setMessages([{ from: 'mo', text: introFor(name), intro: true }])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const history = messages
    setMessages((prev) => [...prev, { from: 'user', text }])
    setInput('')
    setTyping(true)

    const answer = await getAnswer(text, history)
    setMessages((prev) => [...prev, { from: 'mo', text: answer }])
    setTyping(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Always mounted (not conditionally rendered) so open/close can
          transition via opacity+scale instead of popping in/out abruptly —
          same pattern as the header's mobile drawer. Positioned absolutely
          (not normal-flow + margin) so the invisible, closed panel never
          reserves layout space or pushes the toggle button. */}
      <div
        className="absolute bottom-[calc(100%+12px)] right-0 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] rounded-3xl bg-slate-950 border border-white/10 shadow-2xl shadow-slate-950/50 flex flex-col overflow-hidden origin-bottom-right"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
        aria-hidden={!open}
      >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-bold">
                M
              </span>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Ask Mo</p>
                <p className="text-xs text-slate-400 mt-1">Renewals assistant</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full transition-colors hover:bg-white/10"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {contact ? (
            <>
              <div ref={threadRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.from === 'user' ? 'bg-brand-blue text-white' : 'bg-white/5 text-slate-200'
                      }`}
                    >
                      {m.from === 'mo' ? (
                        <ReactMarkdown components={markdownComponents}>{m.text}</ReactMarkdown>
                      ) : (
                        m.text
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 bg-white/5 flex items-center gap-1" aria-label="Mo is typing">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 flex gap-2">
                <label htmlFor="chat-input" className="sr-only">
                  Message
                </label>
                <input
                  id="chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about renewals, cost, documents…"
                  className="flex-1 min-w-0 rounded-full px-4 py-2.5 bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="shrink-0 w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center hover:brightness-110 transition-all"
                >
                  <Send size={16} strokeWidth={2} />
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex-1 flex flex-col px-5 py-5">
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Before we start chatting, what's your name and phone number? We'll only ask once.
              </p>

              <label htmlFor="chat-name" className="text-xs font-medium text-slate-400 mb-1.5">
                Name
              </label>
              <input
                id="chat-name"
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="rounded-xl px-4 py-2.5 mb-4 bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />

              <label htmlFor="chat-phone" className="text-xs font-medium text-slate-400 mb-1.5">
                Phone number
              </label>
              <input
                id="chat-phone"
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="080…"
                className="rounded-xl px-4 py-2.5 mb-5 bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />

              <button
                type="submit"
                className="mt-auto rounded-full py-2.5 bg-brand-blue text-white text-sm font-semibold hover:brightness-110 transition-all"
              >
                Start chatting
              </button>
            </form>
          )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Ask Mo chat' : 'Open Ask Mo chat'}
        className="h-14 pl-5 pr-6 rounded-full bg-brand-blue text-white shadow-xl shadow-blue-950/30 flex items-center gap-2 hover:brightness-110 transition-all"
      >
        {open ? <X size={20} strokeWidth={2} /> : <MessageCircle size={20} strokeWidth={2} />}
        <span className="text-sm font-semibold whitespace-nowrap">Chat us</span>
      </button>
    </div>
  )
}
