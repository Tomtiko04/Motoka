import { useCallback, useRef, useState } from 'react'

// 3D "spatial" tilt: rotateX/rotateY tracks cursor position within the card
// (perspective + a moving radial-gradient glare sells the depth), then
// springs back flat on mouse-leave. Movement itself is applied with a near-
// zero transition (so it feels directly cursor-driven, not laggy) while the
// leave/enter settle uses a slower eased one — hence the two different
// `transition` values swapped via `settling`, rather than one fixed value.
const FLAT_SHADOW = '0 1px 2px -1px rgba(5,36,63,0.08)'
const LIFTED_SHADOW = '0 14px 25px -14px rgba(5,36,63,0.19)'

export default function TiltCard({ children, className = '', style, maxTilt = 6, scale = 1.0075, glare = true, shadow = true, ...rest }) {
  const ref = useRef(null)
  const reduceMotionRef = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [transform, setTransform] = useState('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)')
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 })
  const [hovering, setHovering] = useState(false)
  const [settling, setSettling] = useState(true)

  const handleMove = useCallback(
    (e) => {
      if (reduceMotionRef.current) return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rotateY = (x - 0.5) * maxTilt * 2
      const rotateX = (0.5 - y) * maxTilt * 2
      setSettling(false)
      setHovering(true)
      setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`)
      if (glare) {
        setGlareStyle({ opacity: 1, background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.175), transparent 55%)` })
      }
    },
    [maxTilt, scale, glare]
  )

  const handleLeave = useCallback(() => {
    setSettling(true)
    setHovering(false)
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)')
    setGlareStyle((s) => ({ ...s, opacity: 0 }))
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        ...style,
        position: 'relative',
        transform: reduceMotionRef.current ? undefined : transform,
        transformStyle: 'preserve-3d',
        boxShadow: shadow ? (hovering ? LIFTED_SHADOW : FLAT_SHADOW) : style?.boxShadow,
        transition: settling
          ? 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms ease'
          : 'transform 80ms linear, box-shadow 200ms ease',
        willChange: 'transform',
      }}
      {...rest}
    >
      {children}
      {glare && !reduceMotionRef.current && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ ...glareStyle, transition: settling ? 'opacity 400ms ease' : 'opacity 120ms ease' }}
        />
      )}
    </div>
  )
}
