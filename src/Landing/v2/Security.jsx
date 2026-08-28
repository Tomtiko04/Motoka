import { FolderLock, Settings2, Handshake, BookOpen, Lock, ShieldCheck } from 'lucide-react'

const INCLUDED = [
  { label: 'Digital Wallet', Icon: FolderLock },
  { label: 'Renewal Engine', Icon: Settings2 },
  { label: 'Vendor Network', Icon: Handshake },
  { label: 'Traffic Guide', Icon: BookOpen },
]

export default function Security() {
  return (
    <section id="security" className="bg-[#05243f] text-white">
      <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 112, paddingBottom: 112, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 64, alignItems: 'center' }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#2389e3', textTransform: 'uppercase', marginBottom: 12 }}>Built to be trusted</p>
          <h2 className="text-[clamp(22.4px,2.8vw,35px)] lg:text-[clamp(32px,4vw,50px)]" style={{ fontWeight: 800, lineHeight: 1.15 }}>
            Your documents, secured and always on hand
          </h2>
          <p style={{ marginTop: 20, fontSize: 18, color: '#94a3b8' }}>
            Motoka encrypts every license, insurance certificate, and roadworthiness paper you store, so it's ready
            the moment a checkpoint officer — or you — needs it.
          </p>
          <a
            href="#waitlist"
            className="inline-block transition-all hover:brightness-110"
            style={{ marginTop: 32, borderRadius: 9999, paddingLeft: 28, paddingRight: 28, paddingTop: 14, paddingBottom: 14, fontWeight: 600, background: '#2389e3' }}
          >
            Join Waitlist
          </a>

          <p style={{ marginTop: 56, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', marginBottom: 16 }}>What&apos;s included</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {INCLUDED.map((item) => (
              <div
                key={item.label}
                className="flex items-center"
                style={{ gap: 8, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', paddingLeft: 12, paddingRight: 20, paddingTop: 10, paddingBottom: 10 }}
              >
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(35,137,227,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2389e3' }}>
                  <item.Icon style={{ width: 16, height: 16 }} strokeWidth={2} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ width: 288, height: 288, borderRadius: 48, background: '#2389e3', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 25px 50px -12px rgba(3,8,23,0.5)' }}>
            <Lock style={{ width: 80, height: 80, color: 'white' }} strokeWidth={1.5} />
          </div>
          <div className="absolute" style={{ bottom: -24, right: -8, width: 128, height: 128, borderRadius: 32, background: '#ebb850', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transform: 'rotate(6deg)' }}>
            <ShieldCheck style={{ width: 44, height: 44, color: '#05243f' }} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </section>
  )
}
