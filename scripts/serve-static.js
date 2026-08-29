// Minimal static file server used only by scripts/prerender.js to serve the
// dist/ build locally while puppeteer snapshots each route. Not a dependency
// on its own — small enough to just write directly instead of pulling in
// `serve` or `sirv` for a one-off build-time script.
import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

// `fallbackHtml`, if given, is served in place of dist/index.html for the
// SPA-fallback case below. The prerender script needs this: it overwrites
// dist/index.html with the '/' route's own baked snapshot as soon as that
// route is processed, so every route requested afterwards would otherwise
// fall back to an already-rendered (and already-hydrated-once) homepage
// instead of the original empty shell — the previous route's <script
// type="application/ld+json"> tags, baked into that stale HTML as static
// markup, would then sit alongside the new route's own, since React only
// cleans up script tags it created itself, not ones already in the initial
// document. Passing the pristine index.html read once before the loop
// starts sidesteps that entirely.
export default function serveHandler(req, res, distDir, fallbackHtml) {
  const urlPath = decodeURIComponent(req.url.split('?')[0])
  let filePath = path.join(distDir, urlPath)

  // Directory or unknown route (client-side router path) — SPA fallback to
  // index.html, same as any real static host needs to be configured to do.
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    if (fallbackHtml !== undefined) {
      res.setHeader('Content-Type', MIME['.html'])
      res.end(fallbackHtml)
      return
    }
    filePath = path.join(distDir, 'index.html')
  }

  const ext = path.extname(filePath)
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  createReadStream(filePath).pipe(res)
}
