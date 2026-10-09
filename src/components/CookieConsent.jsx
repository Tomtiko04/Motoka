import { useEffect, useState } from "react";
import { getConsent, setConsent, loadAnalytics, trackPageView } from "../utils/consent.js";

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => getConsent() === null);

  useEffect(() => {
    const onChange = () => setVisible(getConsent() === null);
    window.addEventListener("motoka-consent-change", onChange);
    return () => window.removeEventListener("motoka-consent-change", onChange);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    setConsent(value);
    if (value === "accepted") void loadAnalytics().then(() => trackPageView());
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-[#E1E6F4] bg-white p-4 shadow-xl sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <p className="text-sm font-semibold text-[#05243F]">We value your privacy</p>
      <p className="mt-1 text-xs leading-relaxed text-[#05243F]/70 sm:text-sm">
        We use cookies to analyse traffic and improve Motoka. Accepting lets us
        measure visits with Google Analytics and Meta Pixel. Declining means no
        tracking scripts load at all.
      </p>
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => choose("declined")}
          className="h-10 rounded-full border border-[#E1E6F4] px-5 text-sm font-semibold text-[#05243F] hover:bg-[#F2F5FB]"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="h-10 rounded-full bg-[#2389E3] px-5 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
