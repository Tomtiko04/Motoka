import { api } from "./apiClient";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export async function getVapidPublicKey() {
  const fromEnv = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (fromEnv) return fromEnv;

  const { data } = await api.get("/push/vapid-public-key");
  return data?.data?.publicKey || data?.publicKey;
}

export async function getNotificationPreferences() {
  const { data } = await api.get("/notification-preferences");
  return data?.data || data;
}

export async function updateNotificationPreferences(prefs) {
  const { data } = await api.put("/notification-preferences", prefs);
  return data?.data || data;
}

/**
 * Request permission, subscribe this device, and register with the backend.
 */
export async function enableWebPush() {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported on this device/browser");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was denied");
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    throw new Error(
      "App update required — close and reopen Motoka (or hard-refresh) so notifications can install",
    );
  }
  await navigator.serviceWorker.ready;

  const vapidKey = await getVapidPublicKey();
  if (!vapidKey) {
    throw new Error("Push is not configured (missing VAPID public key)");
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  await api.post("/push/subscribe", subscription.toJSON());
  await updateNotificationPreferences({ push: true });
  return subscription;
}

/**
 * Unsubscribe this device and turn off push preference.
 */
export async function disableWebPush() {
  if (!isPushSupported()) {
    await updateNotificationPreferences({ push: false });
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const endpoint = subscription?.endpoint;

  if (subscription) {
    await subscription.unsubscribe();
  }

  await api.delete("/push/subscribe", {
    data: endpoint ? { endpoint } : {},
  });
  await updateNotificationPreferences({ push: false });
}
