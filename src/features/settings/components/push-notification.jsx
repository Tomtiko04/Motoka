"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { isPwaStandalone } from "../../../utils/pwa";
import {
  disableWebPush,
  enableWebPush,
  getNotificationPreferences,
  isPushSupported,
  updateNotificationPreferences,
} from "../../../services/apiPush";

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className={`relative inline-flex flex-shrink-0 items-center ${disabled ? "opacity-50" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
    </label>
  );
}

export default function PushNotification() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  const pushCapable = isPushSupported();
  const standalone = typeof window !== "undefined" && isPwaStandalone();
  const isIos =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs = await getNotificationPreferences();
        if (cancelled) return;
        setPushEnabled(Boolean(prefs?.push));
        setEmailEnabled(prefs?.email !== false);
        setSmsEnabled(Boolean(prefs?.sms));
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePushToggle = async () => {
    if (saving) return;

    if (!pushCapable) {
      toast.error(
        isIos && !standalone
          ? "On iPhone, add Motoka to your Home Screen first to enable push"
          : "Push notifications are not supported in this browser",
      );
      return;
    }

    setSaving(true);
    try {
      if (!pushEnabled) {
        await enableWebPush();
        setPushEnabled(true);
        setPermission(Notification.permission);
        toast.success("Push notifications enabled");
      } else {
        await disableWebPush();
        setPushEnabled(false);
        toast.success("Push notifications turned off");
      }
    } catch (error) {
      toast.error(error?.message || "Could not update push settings");
      setPermission(typeof Notification !== "undefined" ? Notification.permission : "default");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateNotificationPreferences({
        email: emailEnabled,
        sms: smsEnabled,
        push: pushEnabled,
      });
      toast.success("Preferences saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {isIos && !standalone && (
          <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            On iPhone/iPad, install Motoka to your Home Screen (Share → Add to Home Screen)
            before push alerts can work.
          </div>
        )}

        {permission === "denied" && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-800">
            Notifications are blocked in your browser settings. Enable them for Motoka to
            receive alerts.
          </div>
        )}

        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
            <div className="pr-4">
              <h3 className="text-sm font-medium md:text-base">Push Notifications</h3>
              <p className="mt-1 text-xs text-gray-500 md:text-sm">
                Get order, payment, and renewal alerts on this device
              </p>
            </div>
            <Toggle
              checked={pushEnabled}
              disabled={saving}
              onChange={handlePushToggle}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
            <div className="pr-4">
              <h3 className="text-sm font-medium md:text-base">Email Preference</h3>
              <p className="mt-1 text-xs text-gray-500 md:text-sm">
                I want to receive email notifications
              </p>
            </div>
            <Toggle
              checked={emailEnabled}
              disabled={saving}
              onChange={() => setEmailEnabled((v) => !v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
            <div className="pr-4">
              <h3 className="text-sm font-medium md:text-base">SMS Alerts</h3>
              <p className="mt-1 text-xs text-gray-500 md:text-sm">
                I want to receive SMS alerts
              </p>
            </div>
            <Toggle
              checked={smsEnabled}
              disabled={saving}
              onChange={() => setSmsEnabled((v) => !v)}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pb-5">
        <button
          type="button"
          disabled={saving}
          onClick={handleConfirm}
          className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#1a6db8] focus:outline-none focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
