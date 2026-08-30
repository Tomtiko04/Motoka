import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoMark from '../assets/v2/logo-mark.svg'
import { STATES } from '../data/states'

const COLUMNS = [
  {
    title: 'Renew',
    links: [
      { label: 'Vehicle License', to: '/renew/vehicle-license' },
      { label: 'Road Worthiness', to: '/renew/road-worthiness' },
      { label: "Driver's License", to: '/renew/drivers-license' },
      { label: 'Insurance', to: '/renew/insurance' },
    ],
  },
  {
    title: 'States',
    links: STATES.map((s) => ({ label: s.name, to: `/states/${s.slug}` })),
  },
  {
    title: 'Features',
    links: [
      { label: 'Ladipo Marketplace', to: '/ladipo' },
      { label: 'Save-Ahead Wallet', to: '/wallet' },
      { label: 'Ask Mo (AI Assistant)', to: '/mo' },
      { label: 'License Auto Reminder', to: '/#everything' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'FAQ', to: '/faq' },
      { label: 'About Motoka', to: '/about' },
      // No dedicated contact page/mechanism exists yet — stays unlinked
      // (inert text, not a "#" href) rather than pointing somewhere
      // misleading. Build a real contact page or mailto to make it live.
      { label: 'Contact Us' },
    ],
  },
]

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z" />
    </svg>
  )
}

function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2h-3.1v13.5a3 3 0 1 1-2.9-3c.3 0 .6 0 .9.1V9.5a6 6 0 1 0 5.1 5.9V8.9c1.2.9 2.6 1.4 4.1 1.4V7.2c-2.3 0-4.1-2.1-4.1-4.7V2Z" />
    </svg>
  )
}

const SOCIALS = [
  { label: 'Instagram', Icon: InstagramIcon, href: '#' },
  { label: 'X', Icon: XIcon, href: '#' },
  { label: 'TikTok', Icon: TikTokIcon, href: '#' },
]

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <footer className="bg-[#05243f]" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div
        className="flex flex-col lg:flex-row lg:justify-between"
        style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 64, paddingBottom: 48, gap: 48 }}
      >
        <div style={{ maxWidth: 320 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <img src={logoMark} alt="" style={{ height: 24, width: 'auto' }} />
            <span style={{ fontWeight: 600, fontSize: 18, color: 'white' }}>Motoka</span>
          </div>
          <p style={{ marginTop: 16, color: '#94a3b8', lineHeight: 1.6 }}>
            Simplifying vehicle licensing, maintenance, and auto services — all in one smart platform.
          </p>

          <div className="inline-flex items-center" style={{ marginTop: 24, gap: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 14px' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Follow us on:</span>
            <div className="flex items-center" style={{ gap: 8 }}>
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center hover:brightness-125 transition-all"
                  style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.12)', color: 'white' }}
                >
                  <Icon width={14} height={14} />
                </a>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 32, fontSize: 14, color: '#64748b' }}>© {new Date().getFullYear()} Motoka Inc</p>
        </div>

        <div className="flex flex-wrap" style={{ gap: 48 }}>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 20 }}>{col.title}</p>
              <ul className="flex flex-col" style={{ gap: 14 }}>
                {col.links.map((link) =>
                  link.to ? (
                    <li key={link.label}>
                      <Link to={link.to} className="hover:text-white transition-colors" style={{ fontSize: 15, color: '#94a3b8' }}>
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <span style={{ fontSize: 15, color: '#475569', cursor: 'default' }}>{link.label}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        className="fixed flex items-center justify-center hover:brightness-110 transition-all z-50"
        style={{
          right: 20,
          bottom: 92,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#2389e3',
          color: 'white',
          boxShadow: '0 8px 20px -4px rgba(35,137,227,0.5)',
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.9)',
          pointerEvents: showBackToTop ? 'auto' : 'none',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>
    </footer>
  )
}
