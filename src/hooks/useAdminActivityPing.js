import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminActivitySince } from "../services/apiAdminActivity";

const POLL_MS = 45000;
const SOUND_KEY = "adminActivitySound";
const MAX_CONSECUTIVE_FAILURES = 5;

// Two-tone chime built with WebAudio rather than shipping an mp3 — no asset to
// 404, and an AudioContext created inside the toggle's click handler counts as
// the user gesture browsers require before anything is allowed to make noise.
function playChime(ctx) {
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.14;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.14);
  });
}

/**
 * Polls for admin-visible activity (new signups, successful payments) and
 * announces it in the tab: a count in the title, and a chime if sound is on.
 *
 * Sound is opt-in and off by default. That is not a preference — audio is
 * blocked until the page has been interacted with, so the toggle IS the gesture
 * that unlocks it. Enabling it later from anywhere else would silently fail.
 */
export default function useAdminActivityPing({ enabled = true } = {}) {
  const [soundOn, setSoundOn] = useState(
    () => localStorage.getItem(SOUND_KEY) === "true",
  );
  const [unseen, setUnseen] = useState({ users: 0, payments: 0 });

  const sinceRef = useRef(new Date().toISOString());
  const audioCtxRef = useRef(null);
  const soundOnRef = useRef(soundOn);
  const baseTitleRef = useRef("Motoka Admin");

  soundOnRef.current = soundOn;

  const total = unseen.users + unseen.payments;

  const clear = useCallback(() => setUnseen({ users: 0, payments: 0 }), []);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      localStorage.setItem(SOUND_KEY, String(next));
      if (next) {
        // Created and resumed inside the click so the browser unlocks audio.
        if (!audioCtxRef.current) {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) audioCtxRef.current = new Ctx();
        }
        audioCtxRef.current?.resume?.();
        if (audioCtxRef.current) playChime(audioCtxRef.current);
      }
      return next;
    });
  }, []);

  // Title badge. Restores the plain title on unmount so leaving the admin area
  // does not strand a count in the tab.
  useEffect(() => {
    const base = baseTitleRef.current;
    document.title = total > 0 ? `(${total}) ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [total]);

  // Looking at the tab counts as having seen it.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") clear();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [clear]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let failures = 0;
    let timer;

    const tick = async () => {
      try {
        const data = await getAdminActivitySince(sinceRef.current);
        if (cancelled) return;

        failures = 0;
        // Only advance on success, and off the server's clock — a failed tick
        // must not swallow the window it covered.
        if (data?.now) sinceRef.current = data.now;

        const users = data?.users?.count || 0;
        const payments = data?.payments?.count || 0;

        if (users + payments > 0) {
          setUnseen((prev) => ({
            users: prev.users + users,
            payments: prev.payments + payments,
          }));
          if (soundOnRef.current && audioCtxRef.current) {
            audioCtxRef.current.resume?.();
            playChime(audioCtxRef.current);
          }
        }
      } catch {
        failures += 1;
      }

      if (cancelled) return;
      // A dead token or a down API would otherwise mean a request every 45s
      // forever, in a tab that tends to stay open all day.
      if (failures < MAX_CONSECUTIVE_FAILURES) timer = setTimeout(tick, POLL_MS);
    };

    timer = setTimeout(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled]);

  return { soundOn, toggleSound, unseen, total, clear };
}
