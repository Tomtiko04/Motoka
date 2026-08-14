import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

/**
 * "Add to Home Screen" prompt.
 *
 * Two different worlds:
 *  - Android/Chrome fires `beforeinstallprompt`, which we capture and replay when
 *    the user taps Install. This is a real one-tap install.
 *  - iOS Safari has no such event. Installing is only possible via Share → Add to
 *    Home Screen, done by hand, so all we can do is show the instructions. This is
 *    also why iOS web-push adoption will trail Android: push only works once the
 *    app has been added to the home screen this way.
 *
 * Dismissal is remembered so this never becomes nagware.
 */

const DISMISS_KEY = 'motoka:install-prompt-dismissed';
const DISMISS_DAYS = 30;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const recentlyDismissed = () => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Already installed, or told us to go away recently
    if (isStandalone() || recentlyDismissed()) return;

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    const onBeforeInstall = (e) => {
      e.preventDefault(); // stop Chrome's own mini-infobar
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* private mode */ }
    setDeferredPrompt(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice; // resolves whether they accept or dismiss
    setDeferredPrompt(null);
  };

  if (!deferredPrompt && !showIosHint) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[9998] mx-auto max-w-sm rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/10 sm:left-auto sm:right-4 sm:mx-0">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        {/* Inline styles, deliberately: index.css has an UNLAYERED `img { width: 100% }`
            rule, and unlayered CSS beats Tailwind v4's layered utilities no matter the
            specificity. With `w-10` losing, the image stretched to fill the card and
            pushed this text off-screen. Inline style is the reliable override. */}
        <img
          src="/icons/icon-192.png"
          alt=""
          style={{ width: 40, height: 40 }}
          className="shrink-0 rounded-lg"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Install Motoka</p>

          {showIosHint ? (
            <p className="mt-1 text-xs text-gray-600">
              Tap <ShareIcon className="inline h-3.5 w-3.5 align-text-bottom" /> Share, then
              <strong> Add to Home Screen</strong> to keep Motoka one tap away.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-gray-600">
                Add it to your home screen for faster access, even on a poor connection.
              </p>
              <button
                type="button"
                onClick={install}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#2389E3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a7acf]"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                Install
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
