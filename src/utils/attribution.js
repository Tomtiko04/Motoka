const STASH_KEY = "motoka_attribution";
const MAX_SOURCE = 60;
const MAX_CAMPAIGN = 120;

function clean(source, campaign) {
  const s = (source || "").trim().slice(0, MAX_SOURCE);
  const c = (campaign || "").trim().slice(0, MAX_CAMPAIGN);
  if (!s && !c) return null;
  return { ...(s ? { source: s } : {}), ...(c ? { campaign: c } : {}) };
}

// Marketing attribution for payment init payloads.
//
// Resolution order: current-URL UTMs first (and stashed to sessionStorage so
// they survive SPA navigation to checkout), then the stash, then an external
// referrer host. Returns null when nothing is known — the backend stores
// that as unknown rather than fake-"direct", and sanitizes defensively.
//
// Safe to call on every init: idempotent, best-effort, never throws.
export function getAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = clean(params.get("utm_source"), params.get("utm_campaign"));
    if (fromUrl) {
      try {
        sessionStorage.setItem(STASH_KEY, JSON.stringify(fromUrl));
      } catch {
        // Private mode etc. — URL params still returned below.
      }
      return fromUrl;
    }

    try {
      const stashed = sessionStorage.getItem(STASH_KEY);
      if (stashed) {
        const parsed = JSON.parse(stashed);
        const kept = clean(parsed?.source, parsed?.campaign);
        if (kept) return kept;
      }
    } catch {
      // Corrupt stash — fall through to referrer.
    }

    const ref = document.referrer;
    if (ref) {
      try {
        const host = new URL(ref).hostname;
        if (host && host !== window.location.hostname) {
          return { source: host.slice(0, MAX_SOURCE) };
        }
      } catch {
        // Unparseable referrer — unknown.
      }
    }
    return null;
  } catch {
    return null;
  }
}
