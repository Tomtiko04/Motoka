import { useEffect } from 'react'

// The site is reachable at two hostnames (motoka.ng and motokaapp.ng both
// resolve to the same content) — without a canonical tag that's exactly the
// duplicate-content setup that can split ranking signal between two URLs
// instead of consolidating it onto one. motoka.ng is the one used in
// sitemap.xml/robots.txt, so it's the one every page canonicalizes to here.
const CANONICAL_ORIGIN = 'https://motoka.ng'

// No react-helmet — this is a small enough site that a single effect setting
// document.title + the description/canonical tags directly is enough, and
// it's one less dependency for the prerender step to worry about. The
// prerender script waits for React to render before snapshotting, so
// whatever this hook sets is what ends up baked into the static HTML per
// route. Canonical path is read from the current URL, not passed in, so
// every page gets one for free without each call site having to supply it.
export default function useSeoHead(title, description) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', CANONICAL_ORIGIN + window.location.pathname)
  }, [title, description])
}
