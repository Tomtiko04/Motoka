import { useState } from 'react'
import Reveal from './Reveal'

const QUICK_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Covers', href: '#covers' },
  { label: 'Everything', href: '#everything' },
  { label: 'FAQs', href: '#faqs' },
]

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <section id="waitlist" className="bg-[#05243f] text-white">
      <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 112, paddingBottom: 64, textAlign: 'center' }}>
        <Reveal>
          <h2 className="text-[35.6px] lg:text-[50.9px]" style={{ fontWeight: 500, color: '#2389e3', lineHeight: 'normal' }}>
            Stay in the loop with Motoka
          </h2>
          <p style={{ marginTop: 24, fontSize: 18, color: '#94a3b8', maxWidth: 576, marginLeft: 'auto', marginRight: 'auto' }}>
            Motoka is live. Leave your email and we&apos;ll send you product updates, new features, and tips for keeping your car documents in order.
          </p>
        </Reveal>

        {submitted ? (
          <p style={{ marginTop: 40, fontWeight: 600, color: '#21b993', fontSize: 18 }}>You&apos;re subscribed — thanks for staying in the loop.</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white flex flex-col sm:flex-row gap-[10px] items-stretch sm:items-start p-[10px] rounded-[20px] w-full max-w-[548px]"
            style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto', filter: 'drop-shadow(0px 54px 27px rgba(69,161,242,0.1))' }}
          >
            <div className="flex flex-1 flex-col h-[49px] items-start min-w-0">
              <div className="bg-[#eef6ff] border border-[rgba(35,137,227,0.18)] flex flex-1 items-center min-h-px overflow-clip pl-[16px] pr-[24px] py-[14px] rounded-[10px] w-full">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent focus:outline-none"
                  style={{ fontWeight: 300, fontSize: 18, color: '#05243f' }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#21b993] flex h-[49px] items-center justify-center overflow-clip px-[24px] rounded-[10px] cursor-pointer shrink-0 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:brightness-95"
            >
              <span style={{ fontWeight: 600, fontSize: 18, color: '#fff', whiteSpace: 'nowrap' }}>Stay Updated</span>
            </button>
          </form>
        )}
        {error && <p style={{ marginTop: 12, fontSize: 14, color: '#f87171' }}>{error}</p>}
      </div>

      <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingBottom: 96, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {QUICK_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="hover:text-white transition-colors"
            style={{ borderRadius: 9999, border: '1px solid rgba(255,255,255,0.15)', paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8, fontSize: 14, fontWeight: 500, color: '#cbd5e1' }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  )
}
