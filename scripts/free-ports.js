// Runs before `npm run dev`. If a previous dev session didn't shut down
// cleanly (closed terminal, force-quit, crashed), the vite and/or server
// process can be left orphaned holding their ports — the next `npm run dev`
// then either fails outright (vite's strictPort) or silently lands on a
// different port than expected. This frees both ports first so `npm run dev`
// always starts clean on the same ports.
import { execSync } from 'node:child_process'

const PORTS = [Number(process.env.PORT) || 5173, Number(process.env.SERVER_PORT) || 8787]

for (const port of PORTS) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean)

    for (const pid of pids) {
      execSync(`kill -9 ${pid}`)
      console.log(`[free-ports] killed stale process ${pid} on port ${port}`)
    }
  } catch {
    // lsof exits non-zero when nothing is listening on the port — that's
    // the normal/expected case, not an error.
  }
}
