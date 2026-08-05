import { api } from "./apiClient";

export async function getMyReferral() {
  const { data } = await api.get("/referral");
  return data?.data ?? data;
}

export async function validateReferralCode(code) {
  const { data } = await api.get(`/referral/validate/${encodeURIComponent(code)}`);
  return data?.data ?? data;
}

const REFERRAL_STORAGE_KEY = "referralCode";

export function captureReferralCodeFromUrl(search = window.location.search) {
  try {
    const params = new URLSearchParams(search);
    const ref = (params.get("ref") || "").trim().toUpperCase();
    if (ref && /^[A-Z0-9]{6,12}$/.test(ref)) {
      sessionStorage.setItem(REFERRAL_STORAGE_KEY, ref);
      return ref;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getStoredReferralCode() {
  try {
    return sessionStorage.getItem(REFERRAL_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function clearStoredReferralCode() {
  try {
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
