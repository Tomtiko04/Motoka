import { useEffect } from 'react'

// The site is reachable at two hostnames (motoka.ng and motokaapp.ng serve
// byte-identical content) — without a canonical tag that's exactly the
// duplicate-content setup that splits ranking signal across two hosts
// instead of consolidating it onto one. motoka.ng is the chosen canonical.
//
// Specifically the *www* form: the apex 307-redirects to www.motoka.ng, so
// canonicalizing to the bare apex would point every page at a URL that
// immediately redirects. The canonical should be the address that actually
// serves a 200. Keep this in sync with sitemap.xml and robots.txt.
const CANONICAL_ORIGIN = 'https://www.motoka.ng'
const DEFAULT_OG_IMAGE = CANONICAL_ORIGIN + '/og-image.png'

function setMeta(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

// No react-helmet — this is a small enough site that a single effect setting
// document.title + the description/canonical/OG/Twitter tags directly is
// enough, and it's one less dependency for the prerender step to worry
// about. The prerender script waits for React to render before
// snapshotting, so whatever this hook sets is what ends up baked into the
// static HTML per route. Canonical path is read from the current URL, not
// passed in, so every page gets one for free without each call site having
// to supply it. `image` defaults to a single site-wide branded card rather
// than requiring every page to have its own — a generic share image beats
// no image at all, and per-page ones can be added later where it's worth
// the extra asset.
export default function useSeoHead(title, description, image = DEFAULT_OG_IMAGE) {
  useEffect(() => {
    if (title) document.title = title
    if (description) setMeta('name', 'description', description)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    const url = CANONICAL_ORIGIN + window.location.pathname
    canonical.setAttribute('href', url)

    if (title) {
      setMeta('property', 'og:title', title)
      setMeta('name', 'twitter:title', title)
    }
    if (description) {
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:description', description)
    }
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', 'Motoka')
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:image', image)
  }, [title, description, image])
}
