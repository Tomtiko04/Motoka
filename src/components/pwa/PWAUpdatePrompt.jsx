import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Update toast.
 *
 * The service worker is registered with `registerType: 'prompt'`, so a new build
 * downloads in the background and then waits. Nothing swaps until the user taps
 * Update — important here because a mid-session asset swap on a payment screen
 * can strand someone on a half-old bundle.
 */
const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check hourly so long-lived tabs still notice a deploy.
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[9999] mx-auto max-w-sm rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/10 sm:left-auto sm:right-4 sm:mx-0"
    >
      <p className="text-sm font-semibold text-gray-900">A new version is available</p>
      <p className="mt-1 text-xs text-gray-600">
        Reload to get the latest version of Motoka.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="rounded-md bg-[#2389E3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a7acf]"
        >
          Update
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
