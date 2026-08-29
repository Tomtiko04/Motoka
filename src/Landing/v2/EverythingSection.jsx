import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, FolderLock, Signpost, Sparkles, Wrench } from 'lucide-react'
import Reveal from './Reveal'
import iconLicense from '../../assets/v2/icon-license.svg'
import iconNotif from '../../assets/v2/icon-notif.svg'
import phoneFrame from '../../assets/v2/hand-phone-test.webp'
import screenLicenseRenewal from '../../assets/v2/License renewal.webp'
import screenExpiryReminders from '../../assets/v2/Expiry reminders.webp'
import screenVehicleMaintenance from '../../assets/v2/Vehicle maintenance.webp'
import screenPartsMarketplace from '../../assets/v2/Verified Parts Marketplace.webp'
import screenDocumentWallet from '../../assets/v2/Documents wallet.webp'
import screenTrafficEducation from '../../assets/v2/Traffic Education.webp'
import screenAskMo from '../../assets/v2/ask mo.webp'

/**
 * "Everything your car needs, all in one place" — pinned phone with
 * per-feature image crossfade.
 *
 * The sticky phone's containing block is the grid wrapping both columns,
 * not the section — it pins for exactly as long as that grid (implicitly
 * sized by the feature list, the taller column) scrolls through the
 * viewport. Active feature is derived from IntersectionObserver watching a
 * thin band centered in the viewport, and drives three things from one
 * source of truth: phone image opacity, feature-text blur/opacity, and the
 * progress dots.
 *
 * Each feature has its own real, purpose-matched screen (named exactly after
 * the feature in the asset export), all pre-cropped to identical 1290x2796
 * dimensions so the crossfade never shifts zoom/crop level between features.
 *
 * The last 3 features (Verified Parts Marketplace, Document Wallet, Traffic
 * Education) predate the Figma export and have no matching SVG icon in that
 * asset set, so they use lucide-react icons instead — same stroke-only style
 * as icon-license/icon-notif, colored to match (#5DF8D0).
 */

const FEATURES = [
  {
    title: 'License Renewal',
    description: "Renew your driver's license and vehicle particulars online without a trip to the office.",
    iconSrc: iconLicense,
    image: screenLicenseRenewal,
  },
  {
    title: 'Expiry Reminders',
    description: 'Automatic alerts before your license, insurance, or roadworthiness certificate lapses.',
    iconSrc: iconNotif,
    image: screenExpiryReminders,
  },
  {
    title: 'Vehicle Maintenance',
    description: 'Track service history and book trusted mechanics for routine maintenance.',
    Icon: Wrench,
    image: screenVehicleMaintenance,
  },
  {
    title: 'Verified Parts Marketplace',
    description: 'Shop genuine spare parts from vetted vendors, with prices you can compare.',
    Icon: ShoppingCart,
    image: screenPartsMarketplace,
  },
  {
    title: 'Document Wallet',
    description: 'Keep digital copies of every vehicle document, accessible from your phone at a checkpoint.',
    Icon: FolderLock,
    image: screenDocumentWallet,
  },
  {
    title: 'Traffic Education',
    description: 'Bite-sized guides on road signs, traffic laws, and safe-driving practices.',
    Icon: Signpost,
    image: screenTrafficEducation,
  },
  {
    title: 'Ask Mo',
    description: 'Your in-app assistant for anything car-related, from part recommendations to paperwork questions.',
    Icon: Sparkles,
    image: screenAskMo,
  },
]

// distance 0 -> sharp/full opacity. distance 1 -> ~4.5px blur. distance 2+ -> caps at 9px.
function getBlurStyle(distance, reduceMotion) {
  if (reduceMotion) {
    return { opacity: distance === 0 ? 1 : 0.5 }
  }
  const blurPx = Math.min(distance * 4.5, 9)
  const opacity = Math.max(1 - distance * 0.45, 0.25)
  return {
    filter: distance === 0 ? 'none' : `blur(${blurPx}px)`,
    opacity,
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function PhoneMock({ activeIndex, reduceMotion, widthClamp = 'clamp(240px, 35.1vw, 562px)', fitViewport = false }) {
  // The frame is 1324x2012, so a width-only clamp makes it ~854px tall at the
  // 562px cap — taller than a laptop viewport, which cropped the top of the
  // phone behind the header. When fitViewport is set, height leads instead and
  // width follows the aspect ratio, so the whole handset stays on screen.
  // The /1.1 accounts for the landing's body zoom, which scales svh with it.
  const sizing = fitViewport
    ? {
        height: `min(calc(100svh / 1.1 - 24px), calc((${widthClamp}) * 2012 / 1324))`,
        width: 'auto',
      }
    : { width: widthClamp }

  return (
    <div className="relative" style={{ ...sizing, aspectRatio: '1324 / 2012' }}>
      {/* phoneFrame is already rendered in the brand blue (not a neutral
          photo needing a luminosity tint), 1324x2012, transparent bg —
          sized to its own aspect ratio, screen overlay positioned as a %
          of that same box so it lines up with the phone's screen rather
          than a drawn bezel. */}
      {/* Screen content renders BEHIND phoneFrame, not before/on top of it —
          phoneFrame's screen area is cut out to transparent in the source
          photo, so the opaque bezel pixels naturally mask any overflow from
          this box instead of the content visibly covering the bezel. */}
      <div
        className="absolute overflow-hidden rounded-[28px]"
        style={{ left: 'calc(13.97% - 4px)', top: '1%', width: 'calc(53.63% + 10px)', height: 'calc(76% + 10px)' }}
      >
        {FEATURES.map((feature, index) => (
          <img
            key={feature.title}
            src={feature.image}
            alt=""
            loading="eager"
            className="absolute inset-0 size-full object-cover object-top"
            style={{
              opacity: index === activeIndex ? 1 : 0,
              transition: reduceMotion ? 'none' : 'opacity 700ms ease-in-out',
            }}
          />
        ))}
      </div>
      <img
        src={phoneFrame}
        alt=""
        loading="eager"
        className="absolute inset-0 size-full object-contain"
      />
    </div>
  )
}

export default function EverythingSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const featureRefs = useRef([])
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number(entry.target.dataset.index))
          }
        })
      },
      {
        root: null,
        // Shrinks the trigger zone to a thin band centered vertically in the
        // viewport, so "active" means "currently in focus", not "on screen".
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    )

    featureRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="everything" className="relative bg-[#2389e3] overflow-x-clip pb-0 lg:pb-[125px]" style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 125 }}>
      {/* Header — normal flow, not part of the pinning grid */}
      <Reveal className="flex flex-col min-[1298px]:flex-row items-start justify-between gap-[24px] min-[1298px]:gap-[60px] mb-[80px]">
        <h2 className="font-medium text-[35.6px] lg:text-[50.9px] text-white leading-normal max-w-[560px] shrink-0">
          Everything your car needs, all in one place
        </h2>
        <p className="font-light text-[18px] leading-[28px] text-[#cae3f9] max-w-[420px]">
          From renewals to repairs, Motoka brings the services car owners juggle across offices and phone numbers
          into a single dashboard.
        </p>
      </Reveal>

      {/* Pinning parent: grid-template-columns 1.1fr/0.9fr, align-items:start
          is required — without it, both columns stretch to equal height and
          the sticky column has no slack to pin against. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[60px] items-start">
        {/* Left: feature list — its height is what creates the scroll distance.
            On mobile it shares grid cell 1/1 with the sticky phone (both get
            col-start-1 row-start-1) so the phone has the list's full height
            to pin against instead of just its own short row. */}
        <div className="flex flex-col min-w-0 col-start-1 row-start-1 lg:col-auto lg:row-auto">
          {FEATURES.map((feature, index) => {
            const distance = Math.abs(index - activeIndex)
            return (
              <div
                key={feature.title}
                data-index={index}
                ref={(el) => (featureRefs.current[index] = el)}
                className="min-h-[65vh] lg:min-h-[50vh] flex flex-col justify-center transition-[filter,opacity] duration-500 ease-out"
                style={getBlurStyle(distance, reduceMotion)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-[16px] lg:gap-[24px]">
                  <div className="size-[42px] lg:size-[53px] shrink-0">
                    {feature.Icon ? (
                      <feature.Icon className="size-full" color="#5DF8D0" strokeWidth={1} />
                    ) : (
                      <img src={feature.iconSrc} alt="" className="size-full" />
                    )}
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <h3 className="font-medium text-[32px] lg:text-[40px] text-white">{feature.title}</h3>
                    <p className="font-light text-[14.4px] lg:text-[18px] leading-[22.4px] lg:leading-[28px] text-[#cae3f9] lg:max-w-[435px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop only. The phone used to pin over the feature list on mobile
            too, with the text deliberately scrolling behind it — but at phone
            widths the two just collide and the copy is unreadable, so it is
            dropped below lg rather than overlapped. */}
        <div
          className="hidden lg:flex sticky justify-end items-end"
          style={{ bottom: '-64px', alignSelf: 'end', marginRight: 'calc(-1 * clamp(24px, 7.9vw, 114px))', marginBottom: '-125px' }}
        >
          <PhoneMock activeIndex={activeIndex} reduceMotion={reduceMotion} fitViewport />
        </div>
      </div>
    </section>
  )
}
