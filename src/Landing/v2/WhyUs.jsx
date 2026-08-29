import secureIcon from '../../assets/v2/Secure.webp'
import timeIcon from '../../assets/v2/Time.webp'
import trustIcon from '../../assets/v2/Trust.webp'
import Reveal from './Reveal'
import TiltCard from './TiltCard'

const PILLARS = [
  {
    number: '01',
    title: 'Compliance & security',
    body: 'Your licenses, insurance, and roadworthiness papers live in one encrypted digital wallet.',
    detail:
      'Every document is checked against the issuing agency\'s own records, not just the photo you uploaded — so what\'s in your wallet is exactly what a checkpoint officer sees when they look you up.',
    color: '#f0fffa',
    icon: secureIcon,
  },
  {
    number: '02',
    title: 'Time & money savings',
    body: 'Renew before deadlines instead of paying late fees, and skip the queues entirely.',
    detail:
      'Reminders go out weeks ahead of an expiry date, not the day before, so you\'re never stuck choosing between a queue and a fine.',
    color: '#ebf5ff',
    icon: timeIcon,
  },
  {
    number: '03',
    title: 'Trust & reliability',
    body: 'Every mechanic and parts vendor in the network is vetted before they\'re listed.',
    detail:
      'The network stays small on purpose — vendors can be removed if drivers report bad service, rather than padding the list with unverified names.',
    color: '#fef0ff',
    icon: trustIcon,
  },
]

export default function WhyUs() {
  return (
    <section style={{ background: '#f8fafc', paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 112, paddingBottom: 100 }}>
      <Reveal style={{ maxWidth: 800 }}>
        <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>Why Motoka</p>
        <h2 className="text-[35.6px] lg:text-[50.9px]" style={{ fontWeight: 500, color: '#2389e3', lineHeight: 'normal' }}>
          Built so you stop worrying about paperwork
        </h2>
        <p style={{ marginTop: 16, color: '#64748b', lineHeight: 1.6 }}>
          Your documents stay encrypted and verified, deadlines get flagged before they become fines, and every
          mechanic or vendor you book through Motoka has already been checked out — so nothing here is left to
          chance.
        </p>
      </Reveal>

      <div
        className="grid grid-cols-1 lg:grid-cols-3"
        style={{ gap: 16, paddingTop: 48, paddingBottom: 100 }}
      >
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.number} delay={i * 100} className="h-full">
            {/* Entrance (opacity/translateY, on the Reveal wrapper) and the
                cursor-tracked 3D tilt (transform/shadow, on this inner card)
                both animate `transform` — kept on separate elements so the
                inline reveal style can't clobber TiltCard's own transform. */}
            <TiltCard
              className="h-full lg:h-[470px] lg:justify-between gap-10"
              style={{
                padding: 32,
                paddingBottom: 48,
                borderRadius: 32,
                background: pillar.color,
                border: '1px solid rgba(5,36,63,0.13)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Icon renders are already glossy 3D chrome objects, so we
                  display them as-is rather than tinting/boxing them. */}
              <img
                src={pillar.icon}
                alt=""
                style={{ width: 94, height: 94, objectFit: 'contain', filter: 'drop-shadow(0 12px 16px rgba(14,111,198,0.35))' }}
              />

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>{pillar.number}</p>
                <h3 style={{ fontWeight: 500, fontSize: 'clamp(24px, 2vw, 32px)', color: '#05243f', lineHeight: 1.2, maxWidth: 260 }}>{pillar.title}</h3>
                <p style={{ marginTop: 12, fontWeight: 300, color: '#05243f', lineHeight: 1.6 }}>{pillar.body}</p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
