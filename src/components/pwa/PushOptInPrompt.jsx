import { useEffect, useState } from "react";
import { BellAlertIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { authStorage } from "../../utils/authStorage";
import { isPwaStandalone } from "../../utils/pwa";
import {
  enableWebPush,
  getNotificationPreferences,
  isPushSupported,
} from "../../services/apiPush";

/**
 * Soft push opt-in (production pattern):
 *  - Never auto-fires the browser permission dialog
 *  - Only after the user is logged in + a short delay (value moment)
 *  - "Not now" snoozes for 14 days
 *  - Never shows again if permission granted/denied, or already opted in
 *  - On iPhone: only when installed to Home Screen (Web Push requirement)
 */

const SNOOZE_KEY = "motoka:push-optin-snooze";
const NEVER_KEY = "motoka:push-optin-never";
const SNOOZE_DAYS = 14;
/** Wait after login shell loads so we don't interrupt first paint / install card */
const SHOW_DELAY_MS = 45_000;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

function isSnoozed() {
  try {
    if (localStorage.getItem(NEVER_KEY) === "1") return true;
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now()));
  } catch {
    /* private mode */
  }
}

function neverAsk() {
  try {
    localStorage.setItem(NEVER_KEY, "1");
  } catch {
    /* private mode */
  }
}

export default function PushOptInPrompt() {
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) return;
    if (!isPushSupported()) return;
    if (typeof Notification === "undefined") return;
    // Already decided at OS level — don't nag
    if (Notification.permission !== "default") return;
    if (isSnoozed()) return;
    // Mobile browsers: push soft-prompt only after install (avoids stacking
    // with the "Add to Home Screen" card, and unlocks iOS Web Push).
    const isMobile = /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isMobile && !isPwaStandalone()) return;
    if (isIos() && !isPwaStandalone()) return;

    let cancelled = false;
    let timer;

    (async () => {
      try {
        const prefs = await getNotificationPreferences();
        if (cancelled || prefs?.push) return;
      } catch {
        // API down / VAPID not ready — don't show empty promise
        return;
      }

      timer = window.setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, SHOW_DELAY_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismissForNow = () => {
    snooze();
    setVisible(false);
  };

  const dismissForever = () => {
    neverAsk();
    setVisible(false);
  };

  const enable = async () => {
    if (enabling) return;
    setEnabling(true);
    try {
      await enableWebPush();
      neverAsk();
      setVisible(false);
      toast.success("You'll get alerts for renewals, payments & orders");
    } catch (error) {
      toast.error(error?.message || "Couldn't enable notifications");
      // If they denied the OS dialog, stop soft-prompting
      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        neverAsk();
        setVisible(false);
      }
    } finally {
      setEnabling(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[9997] mx-auto max-w-sm rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/10 sm:left-auto sm:right-4 sm:mx-0">
      <button
        type="button"
        onClick={dismissForNow}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#2389E3]">
          <BellAlertIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Stay ahead of renewals</p>
          <p className="mt-1 text-xs leading-4 text-gray-600">
            Turn on alerts for document expiry, payments, and order updates — even when Motoka
            is closed.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={enable}
              disabled={enabling}
              className="inline-flex items-center rounded-md bg-[#2389E3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a7acf] disabled:opacity-60"
            >
              {enabling ? "Enabling…" : "Enable alerts"}
            </button>
            <button
              type="button"
              onClick={dismissForNow}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Not now
            </button>
          </div>

          <button
            type="button"
            onClick={dismissForever}
            className="mt-2 text-[10px] font-medium text-gray-400 hover:text-gray-600 hover:underline"
          >
            Don't ask again — I can turn this on in Settings
          </button>
        </div>
      </div>
    </div>
  );
}
