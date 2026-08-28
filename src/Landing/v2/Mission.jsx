import { useEffect, useRef, useState } from 'react'

// Every "word" the sentence progressively lights up, in order. The
// highlighted phrase is kept as one token so it lights up as a unit and
// still carries its own underline decoration.
const WORDS = [
  'Nobody',
  'should',
  'get',
  'arrested,',
  'impounded,',
  'or',
  'extorted',
  'over',
  'an',
  { highlight: 'expired license' },
]

const GREY = [203, 213, 225] // #cbd5e1
const BLUE = [35, 137, 227] // #2389e3

function lerpColor(a, b, t) {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

function wordColor(progress, index, total) {
  // Stagger each word's own reveal window across the shared 0-1 progress
  // range, with a slight overlap so adjacent words don't have a visible
  // hard edge, while still resolving one after another rather than all
  // at once. Clamped to 1 so the last word can actually reach full color.
  const start = index / total
  const end = Math.min(1, start + (1 / total) * 1.15)
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)))
  return lerpColor(GREY, BLUE, t)
}

export default function Mission() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    function update() {
      ticking = false
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // 0 when the section's top just enters at the bottom of the viewport,
      // 1 once it has traveled a full viewport height (roughly reaching the
      // top) — a wide, forgiving scroll distance so an ordinary scroll can't
      // blow past the reveal in one wheel tick.
      const raw = (window.innerHeight - rect.top) / window.innerHeight
      setProgress(Math.max(0, Math.min(1, raw)))
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#f8fafc]">
      <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 112, paddingBottom: 112, textAlign: 'center' }}>
        <p style={{ fontWeight: 500, fontSize: 50.9, lineHeight: 'normal', maxWidth: 820, marginLeft: 'auto', marginRight: 'auto' }}>
          {WORDS.map((token, index) => {
            const color = wordColor(progress, index, WORDS.length)
            return typeof token === 'string' ? (
              <span key={index}>
                <span style={{ color }}>{token}</span>{' '}
              </span>
            ) : (
              <span key={index}>
                <span className="relative inline-block">
                  <span className="relative z-10" style={{ color }}>
                    {token.highlight}
                  </span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 bg-[#21b993]/70 -z-0" aria-hidden="true" />
                </span>{' '}
              </span>
            )
          })}
          .
        </p>
        <p style={{ marginTop: 24, color: '#64748b' }}>That&apos;s the whole reason Motoka exists.</p>
      </div>
    </section>
  )
}
