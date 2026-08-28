import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import logoMark from '../../assets/v2/logo-mark.svg'

// The prototype shipped these as inert labels. Pointed at the routes the
// previous landing header used, so the redesign is not a dead end.
const NAV_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Service', to: '/#covers' },
  { label: 'Blog', to: '/blogs' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <div className="bg-white sticky top-0 z-[70]">
      <div
        className="flex h-[63px] items-center justify-between w-full"
        style={{ paddingLeft: 'clamp(20px, 7.9vw, 114px)', paddingRight: 'clamp(20px, 7.9vw, 114px)' }}
      >
        <div className="flex gap-[47px] items-center">
          <Link
            to="/#top"
            aria-label="Motoka home"
            className="inline-grid place-items-start"
            style={{ gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', lineHeight: 0 }}
          >
            <img src={logoMark} alt="" style={{ width: 27.6, height: 30.9, gridColumn: 1, gridRow: 1 }} />
            <span
              style={{
                gridColumn: 1,
                gridRow: 1,
                marginLeft: 44.07,
                marginTop: 1.508,
                fontWeight: 600,
                fontSize: 20.894,
                lineHeight: '32.163px',
                color: '#05243f',
                whiteSpace: 'nowrap',
              }}
            >
              Motoka
            </span>
          </Link>

          <div className="hidden lg:flex gap-[16px] items-center justify-center p-[10px]">
            <Link to="/#top" className="border border-[rgba(35,137,227,0.25)] flex items-center justify-center px-[16px] py-[8px] rounded-[50px] cursor-pointer transition-colors hover:bg-[#f4faff]">
              <span className="font-semibold text-[#0e6fc5] text-[14px] leading-normal whitespace-nowrap">
                Home
              </span>
            </Link>
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="flex items-center justify-center px-[16px] py-[8px] cursor-pointer">
                <span className="font-normal text-[#697c8c] text-[14px] leading-normal whitespace-nowrap transition-colors hover:text-[#05243f]">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex gap-[24px] items-center justify-end">
          <button type="button" onClick={() => navigate('/auth/login')} className="font-semibold text-[#2389e3] text-[14px] leading-normal whitespace-nowrap cursor-pointer transition-opacity hover:opacity-75">
            Login
          </button>
          <button type="button" onClick={() => navigate('/auth/signup')} className="bg-[#f4faff] border border-[#2389e3] flex h-[38px] items-center justify-center overflow-clip px-[24px] py-[14px] rounded-[90px] w-[92px] cursor-pointer transition-colors hover:bg-[#e4f1ff]">
            <span className="font-semibold text-[#2389e3] text-[14px] leading-normal whitespace-nowrap">
              Register
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="lg:hidden flex items-center justify-center rounded-full transition-colors hover:bg-[#f4faff]"
          style={{ width: 40, height: 40, color: '#05243f' }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className="lg:hidden fixed inset-0 z-[60]"
        style={{
          background: 'rgba(5,36,63,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="lg:hidden fixed top-0 right-0 h-full bg-white flex flex-col z-[61]"
        style={{
          width: 'min(80vw, 320px)',
          boxShadow: '-8px 0 32px -8px rgba(5,36,63,0.25)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms ease',
        }}
      >
        <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: '#05243f' }}>Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center rounded-full transition-colors hover:bg-[#f4faff]"
            style={{ width: 36, height: 36, color: '#05243f' }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col" style={{ padding: '12px 20px', gap: 4 }}>
          <Link to="/#top" onClick={() => setOpen(false)} className="font-semibold text-[#0e6fc5] text-[15px] rounded-lg transition-colors hover:bg-[#f4faff]" style={{ padding: '10px 12px', margin: '0 -12px' }}>
            Home
          </Link>
          {NAV_LINKS.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="font-normal text-[#697c8c] text-[15px] rounded-lg transition-colors hover:bg-[#f4faff] hover:text-[#05243f]" style={{ padding: '10px 12px', margin: '0 -12px' }}>
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', gap: 12 }}>
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/auth/signup') }}
              className="bg-[#f4faff] border border-[#2389e3] flex items-center justify-center w-full transition-colors hover:bg-[#e4f1ff]"
              style={{ height: 44, borderRadius: 90 }}
            >
              <span className="font-semibold text-[#2389e3] text-[14px] whitespace-nowrap">Register</span>
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/auth/login') }}
              className="flex items-center justify-center w-full rounded-full transition-colors hover:bg-[#f4faff]"
              style={{ height: 44 }}
            >
              <span className="font-semibold text-[#2389e3] text-[14px] whitespace-nowrap">Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
