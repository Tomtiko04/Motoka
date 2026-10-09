const CONSENT_KEY = "motoka_cookie_consent";
export const META_PIXEL_ID = "2156944911874251";

export const getConsent = () => {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
};

export const hasConsented = () => getConsent() === "accepted";

export const setConsent = (value) => {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // storage unavailable (private mode) — banner just shows again next visit
  }
  window.dispatchEvent(new CustomEvent("motoka-consent-change", { detail: value }));
};

const gaMeasurementId = () =>
  typeof import.meta !== "undefined" ? import.meta.env?.VITE_GA_MEASUREMENT_ID : null;

let gtagLoaded = false;
let fbqLoaded = false;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

export const loadAnalytics = async () => {
  // GA4 — no-ops until VITE_GA_MEASUREMENT_ID is configured.
  const gaId = gaMeasurementId();
  if (gaId && !gtagLoaded) {
    try {
      await loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      // Manual page_view per route (Seo.jsx) — disable the automatic one
      // so hard loads aren't double-counted.
      window.gtag("config", gaId, { send_page_view: false });
      gtagLoaded = true;
    } catch {
      // tracker blocked (adblock) — page still works, events just don't send
    }
  }
  // Meta Pixel — same snippet that lived in index.html, now consent-gated.
  // The queueing stub must be defined BEFORE fbevents.js loads, otherwise
  // the queued init/track calls are never processed by the real library.
  if (typeof window.fbq !== "function" && !fbqLoaded) {
    const stub = function fbq() {
      (stub.queue = stub.queue || []).push(arguments);
    };
    stub.loaded = true;
    stub.version = "2.0";
    window.fbq = stub;
  }
  if (!fbqLoaded && typeof window.fbq === "function") {
    const fireInit = () => {
      try {
        window.fbq("init", META_PIXEL_ID);
        window.fbq("track", "PageView");
        fbqLoaded = true;
      } catch {
        // blocked — Seo.jsx guards on typeof window.fbq === "function"
      }
    };
    if (document.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]')) {
      fireInit();
    } else {
      loadScript("https://connect.facebook.net/en_US/fbevents.js").then(fireInit, () => {});
    }
  }
};

export const trackPageView = ({ path, title } = {}) => {
  if (!hasConsented()) return;
  const gaId = gaMeasurementId();
  if (gaId && typeof window.gtag === "function") {
    try {
      window.gtag("event", "page_view", {
        page_path: path || window.location.pathname,
        page_title: title || document.title,
        page_location: window.location.href,
      });
    } catch {
      // never break navigation for analytics
    }
  }
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", "PageView");
    } catch {
      // never break navigation for analytics
    }
  }
};
