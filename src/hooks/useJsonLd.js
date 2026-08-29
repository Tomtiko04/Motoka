import { useEffect } from 'react'

// Injects a <script type="application/ld+json"> for the given structured
// data object(s), removing it on unmount/dependency change so navigating
// between pages doesn't stack up stale schema from the previous route. Same
// prerender-timing note as useSeoHead — this runs before the Puppeteer
// snapshot, so the script tag ends up baked into the static HTML.
export default function useJsonLd(data) {
  useEffect(() => {
    if (!data) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
    return () => script.remove()
  }, [data])
}
