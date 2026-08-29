import appMockup from '../../assets/brand/app-mockup.png'
import storeBadges from '../../assets/brand/store-badges.svg'

export default function ProductPreview() {
  return (
    <section className="bg-white">
      <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 96, paddingBottom: 96, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56, alignItems: 'center' }}>
        <div style={{ order: 2, textAlign: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#2389e3', textTransform: 'uppercase', marginBottom: 12 }}>In your pocket</p>
          <h2 className="text-[clamp(22.4px,2.8vw,35px)] lg:text-[clamp(32px,4vw,50px)]" style={{ fontWeight: 800, color: '#05243f', lineHeight: 1.15 }}>
            See your renewal status the moment it changes
          </h2>
          <p style={{ marginTop: 20, color: '#64748b', fontSize: 18 }}>
            Check your license status, renew in a couple of taps, and ask Mo — our in-app assistant — anything about
            car registration.
          </p>
          <p style={{ marginTop: 40, fontWeight: 500, fontSize: 14, color: '#94a3b8' }}>Coming soon on</p>
          <img
            src={storeBadges}
            alt="Coming soon on the App Store and Google Play"
            style={{ marginTop: 12, width: '100%', maxWidth: 280, height: 'auto', margin: '12px auto 0' }}
          />
        </div>

        <div style={{ order: 1 }}>
          <div style={{ borderRadius: 40, background: 'rgba(35,137,227,0.05)', padding: 'clamp(24px, 4vw, 40px)' }}>
            <img
              src={appMockup}
              alt="The Motoka app showing license status and quick actions"
              style={{ width: '100%', maxWidth: 384, margin: '0 auto', display: 'block' }}
            />
          </div>
          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>Early product preview — screens are still being finalized.</p>
        </div>
      </div>
    </section>
  )
}
