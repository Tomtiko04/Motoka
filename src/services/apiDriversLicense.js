import { api } from "./apiClient";
import { upsertDriverLicenseApplication } from "./apiDriverLicenseApplication";

/**
 * Get driver license prices (new / renew) from backend.
 * @returns {Promise<Array>} [{ id, license_type, price, description }, ...]
 */
export async function getDriverLicensePrices() {
  const { data } = await api.get("/driver-license-prices");
  return data?.data?.prices || data?.prices || [];
}

/**
 * Backwards‑compatible alias used by hooks like `useDriversLicensePaymentOptions`.
 */
export async function getDriversLicensePaymentOptions() {
  return getDriverLicensePrices();
}

/**
 * Initialize driver license payment — uses /payments/initialize with
 * payment_type: 'driver_license'. No car_slug; backend fetches price from
 * driver_license_prices by license_type.
 * @param {Object} payload - { license_type: 'new'|'renew', payment_gateway? }
 */
export async function initializeDriverLicensePayment(payload) {
  const { data } = await api.post("/payments/initialize", {
    ...payload,
    payment_type: "driver_license",
    payment_gateway: payload.payment_gateway || "monicredit",
  });
  return data;
}

/**
 * Placeholder for creating a driver license application.
 * Currently unused, but exported so imports from `useDriversLicense` succeed.
 */
export async function createDriversLicense(payload) {
  const { data } = await api.post("/driver-licenses", payload);
  return data;
}

/**
 * Upsert international driver's license application.
 * Currently reuses the same `/driver-license-applications/me` backend endpoint
 * used for local licenses, so the server can distinguish by payload fields.
 */
export async function upsertInternationalDriversLicenseApplication(payload) {
  return upsertDriverLicenseApplication(payload);
}
