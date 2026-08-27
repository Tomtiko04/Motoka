import { Plus } from 'lucide-react'
import Reveal from './Reveal'

const FAQS = [
  {
    q: 'How do I create an account on Motoka?',
    a: 'Join the waitlist below with your email. When we launch, you\'ll get an invite to sign up with your name, email, phone number, and a password.',
  },
  {
    q: 'How will I renew my license through Motoka?',
    a: 'You\'ll enter your plate or license number, confirm your details, and pay for the renewal in the app. Our team handles the rest of the process on your behalf.',
  },
  {
    q: 'How do I know a document is genuine, not a fake sold by an agent?',
    a: 'Every renewal processed through Motoka is checked against the issuing agency\'s own records before it\'s marked complete in your wallet, so what you see in the app matches what\'s on file with the regulator — not just a printout from a roadside agent.',
  },
  {
    q: 'What does it cost, and are there hidden fees?',
    a: 'You\'ll see the full breakdown — the official government fee plus Motoka\'s service fee — before you pay anything. No surprise charges added after the fact.',
  },
  {
    q: 'My license or roadworthiness certificate has already expired — can Motoka still help?',
    a: 'Yes. Expired documents usually just mean a higher renewal fee or a short additional step, not starting over. Enter your details and Motoka will show you exactly what\'s needed to get compliant again.',
  },
  {
    q: 'Can I store digital copies of my documents?',
    a: 'Yes — every license, insurance certificate, and roadworthiness paper you upload is stored in an encrypted digital wallet you can access anytime, including at a roadside checkpoint.',
  },
  {
    q: 'Will I get reminders before a document expires?',
    a: 'Yes, Motoka sends alerts ahead of every expiry date so you can renew before penalties or lapses in compliance.',
  },
]

export default function FAQ() {
  return (
    <section id="faqs" style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 112, paddingBottom: 112 }}>
      <div className="flex flex-col lg:flex-row lg:items-start" style={{ gap: 48 }}>
        <Reveal className="lg:shrink-0 lg:sticky" style={{ maxWidth: 420, top: 140 }}>
          <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>Questions</p>
          <h2 className="text-[35.6px] lg:text-[50.9px]" style={{ fontWeight: 500, color: '#2389e3', lineHeight: 'normal' }}>Frequently asked questions</h2>
        </Reveal>

        <div className="flex-1" style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group transition-colors hover:bg-[#f8fafc]"
              style={{ paddingTop: 28, paddingBottom: 28, paddingLeft: 16, paddingRight: 16, marginLeft: -16, marginRight: -16, borderRadius: 12, borderBottom: '1px solid #e2e8f0' }}
            >
              <summary className="flex items-center justify-between cursor-pointer list-none" style={{ gap: 24 }}>
                <span className="transition-colors text-[#64748b] group-hover:text-[#05243f] group-open:text-[#05243f] group-open:font-medium" style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.7 }}>{item.q}</span>
                <span
                  className="shrink-0 group-open:rotate-45 transition-all border-[#cbd5e1] text-[#64748b] group-hover:border-[#2389e3] group-hover:text-[#2389e3] group-hover:bg-[#eaf4ff] group-hover:scale-110 group-open:border-[#2389e3] group-open:text-[#2389e3] group-open:bg-[#eaf4ff]"
                  style={{ width: 32, height: 32, borderRadius: '50%', borderWidth: 1, borderStyle: 'solid', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={14} strokeWidth={2} />
                </span>
              </summary>
              <p style={{ marginTop: 16, fontWeight: 300, color: '#64748b', lineHeight: 1.7 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
