import { useRef, useEffect, forwardRef, useState } from 'react'
import { useScroll, motion } from 'framer-motion'
import TiltCard from './TiltCard'
import doc1 from '../../assets/v2/doc-1.jpg'
import plateCard from '../../assets/v2/plate-card.png'
import roadWorthy1 from '../../assets/v2/road-worthy-1.png'
import roadWorthy2 from '../../assets/v2/road-worthy-2.png'
import doc6 from '../../assets/v2/doc-6.jpg'
import doc2 from '../../assets/v2/doc-2.jpg'
import doc7 from '../../assets/v2/doc-7.jpg'
import doc3 from '../../assets/v2/doc-3.jpg'

const CARDS = [
  { id: 1, bg: '#fef0ff', color: '#79617b', title: ['Renew', 'Vehicle License'], desc: 'Fast renewals and official updates without visiting the licensing office.', img: doc1, style: { height: 470, width: 356 } },
  { id: 2, bg: '#ebf5ff', color: '#616c7b', title: ['Get ', 'Plate Number'], desc: 'Standard, custom, or replacement number plates processed seamlessly.', img: plateCard, style: { height: 470, width: 410 } },
  { id: 3, bg: '#f0fffa', color: '#617b73', title: ['Road ', 'Worthiness'], desc: 'Official roadworthiness certification and inspection booking.', img: roadWorthy1, img2: roadWorthy2, style: { height: 470, width: 350 } },
  { id: 4, bg: '#eee', color: '#595959', title: ['Third Party Insurance'], desc: 'Official roadworthiness certification and inspection booking.', img: doc6, style: { height: 470, width: 340 } },
  { id: 5, bg: '#fff0f0', color: '#7b6161', title: ['Proof of ', 'Ownership'], desc: 'Central motor registry and official ownership documentation.', img: doc2, style: { height: 470, width: 316 } },
  { id: 6, bg: '#fffcf0', color: '#7b7061', title: ['Other ', 'Documents'], desc: 'Tint permits, hackney permits, and local government papers.', img: doc7, img2: doc3, style: { height: 470, width: 362 } },
]

export default function Services() {
  const sectionRef = useRef(null)

  // No sticky/pin here on purpose: with the section height equal to its own
  // content (title + 470px cards, no extra vh), there's no slack for
  // position:sticky to pin against. Instead this progress tracks the
  // section's own pass through the viewport (0 as it enters, 1 as it
  // leaves) and drives translateX directly — see CardsTrack below.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  return (
    <section ref={sectionRef} id="covers" className="relative bg-white overflow-x-hidden" style={{ paddingBottom: 100 }}>
      {/* Title */}
      <motion.div
        className="flex flex-col min-[1298px]:flex-row items-start justify-between w-full gap-[24px] min-[1298px]:gap-[60px]"
        style={{
          paddingTop: 64,
          paddingBottom: 48,
          paddingLeft: 'clamp(24px, 7.9vw, 114px)',
          paddingRight: 'clamp(24px, 7.9vw, 114px)',
        }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="min-[1298px]:whitespace-nowrap shrink-0 text-[35.6px] lg:text-[50.9px]" style={{ fontWeight: 500, color: '#2389e3', lineHeight: 'normal' }}>
          What Motoka covers
        </h2>
        <p style={{ fontWeight: 300, fontSize: 18, lineHeight: '37px', color: '#697c8c', maxWidth: 621 }}>
          Skip the queues, touts, and surprise expirations. We handle all your statutory vehicle papers
          seamlessly in one dashboard
        </p>
      </motion.div>

      {/* Cards — container taller than the cards so they sit at its bottom;
          the extra room is what the scroll-linked track translates through.
          640 left ~400px of dead space under the heading on a laptop, so it
          is trimmed to roughly a third of that, which still clears the copy. */}
      <div style={{ height: 500, position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
          <CardsTrack scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </section>
  )
}

const CardsTrack = forwardRef(function CardsTrack({ scrollYProgress }, ref) {
  const trackRef = useRef(null)
  const overflowPx = useRef(0)
  const dragOffset = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    function calc() {
      if (!trackRef.current) return
      overflowPx.current = -(trackRef.current.scrollWidth - window.innerWidth + 48)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  useEffect(() => {
    const node = trackRef.current
    if (!node) return
    const unsubscribe = scrollYProgress.on('change', (v) => {
      if (isDragging.current) return
      node.style.transform = `translateX(${Math.min(v, 1) * overflowPx.current + dragOffset.current}px)`
    })
    return unsubscribe
  }, [scrollYProgress])

  let startX = 0
  let startTranslate = 0

  function onPointerDown(e) {
    isDragging.current = true
    startX = e.clientX
    const node = trackRef.current
    const match = node.style.transform.match(/translateX\((.+)px\)/)
    startTranslate = match ? parseFloat(match[1]) : 0
    node.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!isDragging.current) return
    const dx = e.clientX - startX
    const node = trackRef.current
    const minTranslate = overflowPx.current
    const newTranslate = Math.max(minTranslate, Math.min(0, startTranslate + dx))
    dragOffset.current = newTranslate - startTranslate + (startTranslate - Math.min(0, Math.min(1, 0) * overflowPx.current))
    node.style.transform = `translateX(${newTranslate}px)`
  }

  function onPointerUp() {
    isDragging.current = false
  }

  return (
    <div
      ref={(node) => {
        trackRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className="flex gap-[16px] items-end will-change-transform"
      style={{ paddingLeft: 'clamp(24px, 3vw, 48px)', cursor: 'grab', touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {CARDS.map((card) => renderCard(card))}
    </div>
  )
})

function renderCard(card) {
  return (
    <TiltCard
      key={card.id}
      maxTilt={4}
      className="border border-[rgba(5,36,63,0.13)] flex flex-col gap-[93px] items-start overflow-clip pl-[32px] py-[32px] rounded-[20px] shrink-0"
      style={{ ...card.style, background: card.bg }}
    >
      <div className="flex flex-col gap-[10px] items-start w-full">
        {card.title.length === 1 ? (
          <p style={{ fontWeight: 500, fontSize: 18, color: '#05243f', height: 55, lineHeight: 'normal', width: 188 }}>
            {card.title[0]}
          </p>
        ) : (
          <div style={{ fontWeight: 500, fontSize: 18, color: '#05243f', lineHeight: 0, height: 55, width: 188, whiteSpace: 'pre-wrap' }}>
            <p style={{ lineHeight: 'normal', marginBottom: 0 }}>{card.title[0]}</p>
            <p style={{ lineHeight: 'normal' }}>{card.title[1]}</p>
          </div>
        )}
        <p style={{ fontWeight: 300, fontSize: 14, lineHeight: '23px', color: card.color, height: 55 }}>
          {card.desc}
        </p>
      </div>
      {card.id === 1 ? (
        <div className="absolute flex items-center justify-center" style={{ left: 63, top: 255, width: 357, height: 222 }}>
          <div style={{ flexShrink: 0, transform: 'rotate(90deg)', height: 357, width: 222 }}>
            <div className="relative rounded-[5px] overflow-hidden" style={{ height: 357, width: 222 }}>
              <img alt="" src={card.img} className="absolute object-cover rounded-[5px] size-full" style={{ maxWidth: 'none' }} />
            </div>
          </div>
        </div>
      ) : card.id === 2 ? (
        <div className="absolute rounded-bl-[13.22px] rounded-tl-[24.17px] overflow-hidden" style={{ height: 202, left: 60, top: 316, width: 462 }}>
          <img alt="" src={card.img} className="absolute object-bottom rounded-bl-[13.22px] rounded-tl-[24.17px] size-full pointer-events-none" style={{ maxWidth: 'none' }} />
        </div>
      ) : card.id === 3 ? (
        <>
          <div className="absolute rounded-[5px] overflow-hidden" style={{ height: 414, left: 182, top: 207, width: 171 }}>
            <div className="absolute inset-0 pointer-events-none rounded-[5px]" aria-hidden>
              <img alt="" src={card.img} className="absolute object-cover rounded-[5px] size-full" style={{ maxWidth: 'none' }} />
              <div className="absolute inset-0 rounded-[5px]" style={{ backgroundImage: 'linear-gradient(200.53deg,rgba(5,36,63,0) 29.84%,rgba(13,87,56,0.5) 66.04%)' }} />
            </div>
          </div>
          <div className="absolute rounded-[5px] overflow-hidden" style={{ height: 134, left: 93, top: 359, width: 200 }}>
            <img alt="" src={card.img2} className="absolute object-cover rounded-[5px] size-full pointer-events-none" style={{ maxWidth: 'none' }} />
          </div>
        </>
      ) : card.id === 6 ? (
        <>
          <img alt="" src={card.img} className="absolute object-cover rounded-[5px] pointer-events-none" style={{ maxWidth: 'none', height: 298.687, left: 52, top: 260, width: 214.682 }} />
          <img alt="" src={card.img2} className="absolute object-cover rounded-[5px] pointer-events-none" style={{ maxWidth: 'none', height: 310.478, left: 178, top: 206, width: 207.067 }} />
        </>
      ) : (
        <div className="absolute rounded-[5px] overflow-hidden" style={{ height: 286.651, left: 122, top: 207, width: 224.016 }}>
          <div className="absolute inset-0 pointer-events-none rounded-[5px]" aria-hidden>
            <img alt="" src={card.img} className="absolute object-cover rounded-[5px] size-full" style={{ maxWidth: 'none' }} />
            <div className="absolute inset-0 rounded-[5px]" style={{ backgroundImage: 'linear-gradient(97.39deg,rgba(5,36,63,0) 52.13%,rgb(5,36,63) 116.63%)' }} />
          </div>
        </div>
      )}
    </TiltCard>
  )
}
