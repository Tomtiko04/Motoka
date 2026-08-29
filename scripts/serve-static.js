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

export default function serveHandler(req, res, distDir) {
  const urlPath = decodeURIComponent(req.url.split('?')[0])
  let filePath = path.join(distDir, urlPath)

  // Directory or unknown route (client-side router path) — SPA fallback to
  // index.html, same as any real static host needs to be configured to do.
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html')
  }

  const ext = path.extname(filePath)
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  createReadStream(filePath).pipe(res)
}
