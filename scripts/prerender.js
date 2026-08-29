// Runs after `vite build`. This is a plain CSR React SPA — dist/index.html
// has no real content in <body>, just a script tag. That's fine for a real
// browser, but a crawler that doesn't fully execute JS (or times out before
// React finishes) sees an empty page no matter how good the <head> tags are.
//
// This snapshots each route in headless Chrome AFTER React has rendered and
// writes the resulting HTML to its own dist/<route>/index.html — so every
// route ships as real static markup (title, meta description, and visible
// content included) for crawlers, while the same file still boots the SPA
// normally for real visitors (the bundled script tag is untouched).
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import serveHandler from './serve-static.js'
import { STATES } from '../src/data/states.js'
import { BLOG_POSTS } from '../src/data/blogPosts.js'

const DIST = path.resolve(import.meta.dirname, '..', 'dist')
const PORT = 4173

const STATIC_ROUTES = [
  '/',
  '/renew/vehicle-license',
  '/renew/road-worthiness',
  '/renew/drivers-license',
  '/renew/insurance',
  '/ladipo',
  '/wallet',
  '/mo',
  '/blog',
  '/about',
  '/faq',
]

// Dynamic routes (states, blog posts) are driven by the same data modules
// the React components import, so a new state or post added there is picked
// up here automatically instead of needing a second hardcoded list.
const ROUTES = [
  ...STATIC_ROUTES,
  ...STATES.map((s) => `/states/${s.slug}`),
  ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
]

async function main() {
  if (!existsSync(DIST)) {
    console.error('[prerender] dist/ not found — run `vite build` first.')
    process.exit(1)
  }

  // Captured before any route is processed — dist/index.html gets
  // overwritten with the '/' route's own snapshot partway through the loop
  // below, so the SPA fallback needs its own untouched copy rather than
  // re-reading the file from disk on every request (see serve-static.js).
  const pristineIndexHtml = await readFile(path.join(DIST, 'index.html'), 'utf-8')

  const server = createServer((req, res) => serveHandler(req, res, DIST, pristineIndexHtml))
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`[prerender] serving dist/ on http://localhost:${PORT}`)

  const browser = await puppeteer.launch({ headless: true })

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage()
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' })
      // The SEO head hook runs in a useEffect on mount, and route content
      // itself renders synchronously with it — networkidle0 is already past
      // both, but this gives layout/images one more tick to settle.
      await new Promise((r) => setTimeout(r, 150))
      const html = await page.content()
      await page.close()

      const outDir = route === '/' ? DIST : path.join(DIST, route)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), html)
      console.log(`[prerender] wrote ${route === '/' ? '/' : route + '/'}index.html`)
    }
  } finally {
    await browser.close()
    server.close()
  }

  console.log('[prerender] done')
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
