import { useEffect, useRef, useState } from 'react'

// Lightweight fade+slide-up-on-scroll wrapper — no animation library needed,
// just an IntersectionObserver flipping a class once an element first enters
// view. Kept dependency-free (unlike Hero/Services, which already pull in
// framer-motion for their own scroll-linked mechanics) since every other
// section only needs a one-shot reveal, not continuous scroll tracking.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
