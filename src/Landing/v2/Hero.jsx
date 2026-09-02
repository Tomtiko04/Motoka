import { useState } from 'react'
import RenewModal from '../components/RenewModal'
import { formatPlateForDisplay, isPlausiblePlate, PLATE_ERROR } from '../../utils/plateNumber'
import { motion } from 'framer-motion'
import certifiedBadge from '../../assets/v2/certified-badge.svg'
import doc1 from '../../assets/v2/doc-1.webp'
import doc2 from '../../assets/v2/doc-2.webp'
import doc3 from '../../assets/v2/doc-3.webp'
import doc4 from '../../assets/v2/doc-4.webp'
import plateCard from '../../assets/v2/plate-card.webp'
import doc5 from '../../assets/v2/doc-5.webp'
import doc6 from '../../assets/v2/doc-6.webp'
import doc7 from '../../assets/v2/doc-7.webp'
import collageSlimHero from '../../assets/v2/hero-slim-viewport.webp'

// Layout + gradient values are the original Figma design positions.
const COLLAGE_ITEMS = [
  {
    id: 'license',
    label: 'Vehicle License',
    src: doc1,
    top: 14,
    left: 599.76,
    width: 183.735,
    height: 294.967,
    radius: 4.583,
    gradient: 'linear-gradient(129.93deg,rgba(5,36,63,0) 28.59%,rgb(5,36,63) 99.66%)',
    // Sits at the frame's top edge (top: 14) — no room for the tooltip to
    // float above without getting clipped by the frame's overflow-hidden.
    tooltipPosition: 'below',
  },
  {
    id: 'ownership',
    label: 'Proof of Ownership',
    src: doc2,
    top: 251.42,
    left: 370.59,
    width: 239.126,
    height: 226.967,
    radius: 4.583,
    gradient: 'linear-gradient(99.92deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)',
  },
  {
    id: 'police-report',
    label: 'Police Report',
    src: doc3,
    top: 194.59,
    left: 567.68,
    width: 189.815,
    height: 284.609,
    radius: 4.583,
    gradient: 'linear-gradient(96.32deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)',
  },
  {
    id: 'roadworthiness',
    label: 'Roadworthiness Certificate',
    src: doc4,
    top: 120.13,
    left: 724.47,
    width: 147.709,
    height: 358.464,
    radius: 4.583,
    gradient: 'linear-gradient(93.91deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)',
  },
  {
    id: 'plate',
    label: 'Number Plate',
    src: plateCard,
    top: 512.67,
    left: 14,
    width: 348.339,
    height: 152.673,
    radius: 14.039,
    gradient:
      'linear-gradient(126.34deg,rgba(69,161,242,0.23) 33.68%,rgba(40,93,140,0.23) 73.7%),linear-gradient(110.74deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)',
    isPlate: true,
  },
  {
    id: 'inspection',
    label: 'Inspection Referral',
    src: doc5,
    top: 458.59,
    left: 277.09,
    width: 284.609,
    height: 190.715,
    radius: 4.583,
    gradient: 'linear-gradient(103.91deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)',
  },
  {
    id: 'insurance',
    label: 'Insurance Certificate',
    src: doc6,
    top: 426,
    left: 507.18,
    width: 205.351,
    height: 262.768,
    radius: 4.583,
    gradient: 'linear-gradient(97.39deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)',
  },
  {
    id: 'affidavit',
    label: 'Ownership Affidavit',
    src: doc7,
    top: 478,
    left: 675.38,
    width: 196.795,
    height: 273.801,
    radius: 4.583,
    gradient: 'linear-gradient(96.8deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)',
  },
]

// Collage frame is 830x640 — items pop outward, away from the frame's center.
const COLLAGE_CENTER = { x: 415, y: 320 }
const HOVER_DISTANCE = 18

function getHoverOffset(item) {
  const cx = item.left + item.width / 2
  const cy = item.top + item.height / 2
  const dx = cx - COLLAGE_CENTER.x
  const dy = cy - COLLAGE_CENTER.y
  const dist = Math.hypot(dx, dy) || 1
  return { x: (dx / dist) * HOVER_DISTANCE, y: (dy / dist) * HOVER_DISTANCE }
}

function CollageDoc({ item, index }) {
  const offset = getHoverOffset(item)
  const rotation = ((item.left + item.top) % 7) - 3.5

  return (
    <motion.div
      className="absolute"
      style={{ top: item.top, left: item.left, width: item.width, height: item.height }}
      initial={{ opacity: 0, y: 60, scale: 0.85, rotate: rotation * 2 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 18,
        delay: 0.15 + index * 0.08,
      }}
    >
      <motion.div
        className="relative size-full cursor-default"
        style={{ borderRadius: item.radius }}
        /* IDLE THUMP: every ~59s the docs do a subtle table-shake after the initial 3s delay.
           Uses variants (not the animate/whileHover/transition props directly) so "rest" and
           "hover" can each carry their own embedded transition — otherwise the slow idle-loop
           timing would also apply to hover's x/y/scale/rotate, making the pop-out feel laggy. */
        variants={{
          rest: {
            x: 0,
            y: [0, -3, 1, -1, 0],
            rotate: [rotation, rotation - 0.6, rotation + 0.3, rotation - 0.1, rotation],
            scale: [1, 1.008, 0.997, 1.002, 1],
            zIndex: 1,
            boxShadow: '0 4px 20px -4px rgba(5, 36, 63, 0.1)',
            transition: { duration: 0.8, repeat: Infinity, repeatDelay: 59.2, delay: 3 + index * 0.04, ease: [0.22, 1, 0.36, 1] },
          },
          hover: {
            x: offset.x * 2.2,
            y: offset.y * 2.2,
            scale: 1.08,
            rotate: 0,
            zIndex: 30,
            boxShadow: '0 25px 50px -12px rgba(5, 36, 63, 0.35), 0 0 40px rgba(69, 161, 242, 0.15)',
            transition: { type: 'spring', stiffness: 350, damping: 24 },
          },
        }}
        animate="rest"
        whileHover="hover"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: item.radius }} aria-hidden>
          {item.isPlate ? (
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: item.radius }}>
              <img
                alt=""
                src={item.src}
                className="absolute max-w-none"
                style={{ height: '140.06%', left: '-3.54%', top: '-19.46%', width: '107.83%' }}
              />
            </div>
          ) : (
            <img
              alt=""
              src={item.src}
              className="absolute object-cover size-full"
              style={{ maxWidth: 'none', borderRadius: item.radius }}
            />
          )}
          <motion.div
            className="absolute inset-0"
            style={{
              borderRadius: item.radius,
              backgroundImage: item.isPlate
                ? item.gradient
                : `linear-gradient(90deg,rgba(69,161,242,0.23) 0%,rgba(69,161,242,0.23) 100%),${item.gradient}`,
            }}
            whileHover={{ opacity: 0.6 }}
            transition={{ duration: 0.25 }}
          />
        </div>

        <motion.div
          className={
            item.tooltipPosition === 'below'
              ? 'absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[calc(100%+12px)] whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold'
              : 'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold'
          }
          style={{
            color: '#fff',
            zIndex: 40,
            background: 'linear-gradient(135deg, rgba(5,36,63,0.92) 0%, rgba(14,111,198,0.92) 100%)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px -4px rgba(5,36,63,0.3)',
          }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          whileHover={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        >
          {item.label}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  const [plate, setPlate] = useState('')
  const [message, setMessage] = useState('')
  const [renewOpen, setRenewOpen] = useState(false)

  // The prototype was pre-launch, so this used to bounce people to a waitlist.
  // Guest renewal is live, so it opens the same RenewModal the previous
  // landing used, seeded with the plate they already typed.
  function handleSubmit(e) {
    e.preventDefault()
    if (!plate.trim()) {
      setMessage('Enter a plate number first.')
      return
    }
    if (!isPlausiblePlate(plate)) {
      setMessage(PLATE_ERROR)
      return
    }
    setMessage('')
    setRenewOpen(true)
  }

  return (
    <section
      id="top"
      className="relative w-full overflow-hidden bg-[#daebfa]"
      style={{ minHeight: 'clamp(580px, 82vh, 880px)' }}
    >
      {/* Centered max-width shell */}
      <div className="relative mx-auto w-full max-w-[1920px] flex flex-col lg:flex-row lg:items-stretch">
        {/* Left: text + form */}
        <div
          className="relative z-20 flex flex-col gap-[clamp(28px,4vw,48px)] w-full lg:max-w-[min(46vw,920px)] xl:max-w-[clamp(560px,48vw,920px)] shrink-0"
          style={{
            paddingLeft: 'var(--landing-gutter, 40px)',
            paddingRight: 'clamp(24px, 2vw, 24px)',
            paddingTop: 'clamp(48px, 6vw, 112px)',
            paddingBottom: '80px',
          }}
        >
          <div className="flex flex-col gap-[19px] items-start w-full" style={{ marginTop: '-16px' }}>
            <h1
              className="w-full whitespace-normal 2xl:whitespace-nowrap"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(40px, 4.4vw, 83.2px)',
                lineHeight: 1.2,
                color: '#0e6fc6',
                maxWidth: 'min(100%, 920px)',
              }}
            >
              Your car&apos;s paperwork,
              <br />
              finally under control
            </h1>
            <p
              style={{
                fontWeight: 300,
                fontSize: 'clamp(16px, 1.66vw, 24px)',
                lineHeight: '1.55',
                color: '#05243F',
                maxWidth: 637,
                width: '100%',
              }}
            >
              Motoka keeps track of your license, insurance, and roadworthiness renewals in one place, so nothing
              quietly expires on you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white flex flex-col sm:flex-row gap-[10px] items-stretch sm:items-start p-[10px] rounded-[20px] w-full max-w-[548px]"
            style={{ filter: 'drop-shadow(0px 54px 27px rgba(69,161,242,0.1))' }}
          >
            <div className="flex flex-1 flex-col h-[49px] items-start min-w-0">
              <div className="bg-[#eef6ff] border border-[rgba(35,137,227,0.18)] flex flex-1 items-center min-h-px overflow-clip pl-[16px] pr-[24px] py-[14px] rounded-[10px] w-full">
                <label htmlFor="plate" className="sr-only">
                  Plate number
                </label>
                <input
                  id="plate"
                  type="text"
                  value={plate}
                  // Hyphens are added as they type; the value stored and sent
                  // stays normalised, so the display never changes the data.
                  onChange={(e) => setPlate(formatPlateForDisplay(e.target.value))}
                  placeholder="ABC-123-DE"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={12}
                  className="w-full bg-transparent focus:outline-none"
                  style={{ fontWeight: 300, fontSize: 18, color: '#05243f' }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#21b993] flex h-[49px] items-center justify-center overflow-clip px-[24px] rounded-[10px] cursor-pointer shrink-0 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:brightness-95"
            >
              <span style={{ fontWeight: 600, fontSize: 18, color: '#fff', whiteSpace: 'nowrap' }}>Renew Licence</span>
            </button>
          </form>
          {message && <p className="-mt-8" style={{ fontSize: 14, color: '#05243f99' }}>{message}</p>}
          <RenewModal
            isOpen={renewOpen}
            onClose={() => setRenewOpen(false)}
            initialPlateNumber={plate}
          />
        </div>

        {/* Mobile/tablet (below the lg collage breakpoint): a single flattened
            composite image instead of the interactive per-item collage — no
            hover on touch anyway, so the simpler static image is a better fit
            than trying to keep 8 absolutely-positioned items readable this
            narrow. */}
        <div className="lg:hidden w-full mt-2">
          <img alt="" src={collageSlimHero} className="w-full h-auto object-contain" />
        </div>
      </div>

      {/* Document collage — anchored to section bottom, scaled to fit.
          The clamp() is assigned to a custom property first, then read by
          scale(var(...)) — some engines silently drop `scale(clamp(...))`
          as an invalid transform value (parsed at declaration time), while
          a var() indirection resolves the math at used-value time and
          works everywhere. Without this the collage was disappearing
          entirely above the lg breakpoint. */}
      <div
        className="hidden lg:block absolute z-10 origin-bottom"
        style={{
          right: 0,
          bottom: 0,
          width: 830,
          height: 640,
          '--collage-scale': 'clamp(0.52, calc((100vw - 720px) / 1000), 1)',
          transform: 'scale(var(--collage-scale))',
        }}
      >
        {COLLAGE_ITEMS.map((item, i) => (
          <CollageDoc key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* MVAA badge — now strictly constrained to hero bottom, not floating with gap */}
      <div
        className="hidden lg:flex absolute z-20 bg-[rgba(255,255,255,0.59)] flex-col items-start p-[10px] rounded-[8px]"
        style={{
          width: 177.03,
          left: 'var(--landing-gutter, 40px)',
          bottom: 'clamp(24px, 4vh, 48px)',
        }}
      >
        <div className="flex items-center justify-between w-full">
          <img src={certifiedBadge} alt="" style={{ width: 27.03, height: 27.03 }} />
          <div className="flex flex-col justify-end" style={{ height: 27 }}>
            <p style={{ fontWeight: 400, fontSize: 16, color: '#697c8c', lineHeight: 'normal' }}>MVAA Certified</p>
          </div>
        </div>
      </div>
    </section>
  )
}
