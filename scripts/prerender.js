// Runs after `vite build`. This is a plain CSR React SPA — dist/index.html
// has no real content in <body>, just a script tag. A real browser is fine
// with that. A crawler that doesn't execute JS is not, and neither is any
// social link-preview scraper: WhatsApp, X, Facebook and LinkedIn all read
// the raw HTML and none of them run JavaScript.
//
// Verified on production before this existed: motokaapp.ng/, /about and /faq
// all served the same homepage <title> and no crawlable body text. Every
// Motoka link shared on WhatsApp showed the same generic preview regardless
// of which page it pointed at.
//
// This snapshots each public route in headless Chrome after React has
// rendered and writes the result to dist/<route>/index.html, so each route
// ships as real static markup while the same file still boots the SPA
// normally for visitors — the bundled script tag is left untouched.
//
// Ported from the prototype's script (awRasak/Motoka), adapted to this app's
// routes and data layout.
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import serveHandler from './serve-static.js'
import { STATES } from '../src/Data/states.js'

const DIST = path.resolve(import.meta.dirname, '..', 'dist')
const PORT = 4173

// Public marketing pages only. Everything behind ProtectedRoute is
// deliberately absent — prerendering a dashboard would bake a logged-out
// redirect into a static file, and none of it should be indexed anyway.
const STATIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/how-it-works',
  '/guides',
  '/reminders',
  '/renew-vehicle-licence',
  '/renew/vehicle-license',
  '/renew/road-worthiness',
  '/renew/drivers-license',
  '/renew/insurance',
  '/faq',
  '/mo',
  '/ladipo-marketplace',
  '/save-ahead-wallet',
  '/blogs',
]

async function main() {
  if (!existsSync(DIST)) {
    console.error('[prerender] dist/ not found — run `vite build` first.')
    process.exit(1)
  }

  // Captured before any route is processed — dist/index.html is overwritten
  // with the '/' snapshot partway through the loop, so the SPA fallback needs
  // its own untouched copy rather than re-reading from disk (see
  // serve-static.js for why that matters for JSON-LD).
  const pristineIndexHtml = await readFile(path.join(DIST, 'index.html'), 'utf-8')

  const server = createServer((req, res) => serveHandler(req, res, DIST, pristineIndexHtml))
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`[prerender] serving dist/ on http://localhost:${PORT}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    // Blog slugs are derived from post titles at runtime by computeSlug, and
    // the post data lives in a .jsx file that imports an image — not
    // something Node can import here. Reading the links off the rendered
    // /blogs page keeps this in step with the data automatically, and works
    // whatever the slug rule is.
    const indexPage = await browser.newPage()
    await indexPage.goto(`http://localhost:${PORT}/blogs`, { waitUntil: 'networkidle0' })
    const blogRoutes = await indexPage.evaluate(() =>
      [...new Set([...document.querySelectorAll('a[href^="/blog/"]')].map((a) => a.getAttribute('href')))],
    )
    await indexPage.close()
    console.log(`[prerender] discovered ${blogRoutes.length} blog post routes`)

    const routes = [...STATIC_ROUTES, ...STATES.map((s) => `/states/${s.slug}`), ...blogRoutes]

    for (const route of routes) {
      const page = await browser.newPage()
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' })
      // Seo sets title/description/canonical in a useEffect. networkidle0 is
      // already past that; this gives layout one more tick to settle.
      await new Promise((r) => setTimeout(r, 150))
      const html = await page.content()
      await page.close()

      const outDir = route === '/' ? DIST : path.join(DIST, route)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), html)
      console.log(`[prerender] wrote ${route === '/' ? '/' : route + '/'}index.html`)
    }

    console.log(`[prerender] done — ${routes.length} routes`)
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
