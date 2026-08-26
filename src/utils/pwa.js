/**
 * Detect whether the app is running as an installed PWA
 * (standalone / home-screen), not a normal browser tab.
 *
 * Note: do NOT treat `fullscreen` as PWA — that matches F11 / video
 * fullscreen and incorrectly redirects users off the landing page.
 */
export function isPwaStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.navigator.standalone === true
  );
}
