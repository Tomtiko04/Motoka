import { api } from "./apiClient";

/**
 * Get driver license prices (new / renew) from backend.
 * @returns {Promise<Array>} [{ id, license_type, price, description }, ...]
 */
export async function getDriverLicensePrices() {
  const { data } = await api.get("/driver-license-prices");
  return data?.data?.prices || data?.prices || [];
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