import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'

// Shared shell for the location/service landing pages (License Renewal, Road
// Worthiness, Ogun State, Ladipo). Same visual language as the rest of the
// site (brand blue hero, white content sections, navy FAQ-style accordion)
// but content-driven so each page is just data, not a new layout to build.
export default function ServicePageTemplate({
  seoTitle,
  seoDescription,
  seoPath,
  eyebrow,
  h1,
  subcopy,
  steps,
  benefits,
  faqs,
  ctaText = 'Renew Now',
  ctaTo = '/#top',
}) {
  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path={seoPath} />
      <section className="bg-[#daebfa]" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', maxWidth: 820 }}>
          <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#0e6fc6', textTransform: 'uppercase', marginBottom: 12 }}>
            {eyebrow}
          </p>
          <h1 style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 50.9px)', color: '#0e6fc6', lineHeight: 1.15 }}>{h1}</h1>
          <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.6, color: '#05243f' }}>{subcopy}</p>
          <Link
            to={ctaTo}
            className="inline-flex items-center justify-center hover:brightness-110 transition-all"
            style={{ marginTop: 32, background: '#21b993', color: 'white', fontWeight: 600, fontSize: 16, padding: '14px 32px', borderRadius: 10 }}
          >
            {ctaText}
          </Link>
        </div>
      </section>

      {steps && (
        <section style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 80, paddingBottom: 80 }}>
          <h2 style={{ fontWeight: 500, fontSize: 32, color: '#05243f', marginBottom: 40 }}>How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
            {steps.map((step, i) => (
              <div key={step.title} style={{ background: '#f8fafc', border: '1px solid rgba(5,36,63,0.13)', borderRadius: 20, padding: 28 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>{String(i + 1).padStart(2, '0')}</p>
                <h3 style={{ fontWeight: 700, fontSize: 20, color: '#05243f', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {benefits && (
        <section className="bg-[#f8fafc]" style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 80, paddingBottom: 80 }}>
          <h2 style={{ fontWeight: 500, fontSize: 32, color: '#05243f', marginBottom: 40 }}>Why Motoka</h2>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start" style={{ gap: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2389e3', marginTop: 8, flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: '#05243f', marginBottom: 4 }}>{b.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6 }}>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {faqs && (
        <section style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 80, paddingBottom: 96 }}>
          <h2 style={{ fontWeight: 500, fontSize: 32, color: '#05243f', marginBottom: 32 }}>Frequently asked questions</h2>
          <div style={{ borderTop: '1px solid #e2e8f0' }}>
            {faqs.map((item) => (
              <details key={item.q} style={{ padding: '24px 0', borderBottom: '1px solid #e2e8f0' }}>
                <summary style={{ fontWeight: 600, fontSize: 17, color: '#05243f', cursor: 'pointer' }}>{item.q}</summary>
                <p style={{ marginTop: 12, color: '#64748b', lineHeight: 1.7 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
