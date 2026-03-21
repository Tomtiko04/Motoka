/**
 * GUEST RENEWAL API SERVICE
 *
 * Plain axios (no auth token). Covers:
 *  - Public reference data (renewal items, states, LGAs)
 *  - Guest renewal lifecycle (init, status poll, verify, receipt, resend)
 *  - Post-payment signup
 */

import axios from "axios";
import config from "../config/config";

const guestApi = axios.create({
  baseURL: config.getApiBaseUrl(),
});

// ── Public reference data ───────────────────────────────────────────────────

export const getRenewalItems = () => guestApi.get("/public/renewal-items");

export const getStates = () => guestApi.get("/public/states");

export const getLGAs = (stateCode) =>
  guestApi.get(`/public/states/${stateCode}/lgas`);

// ── Guest renewal lifecycle ─────────────────────────────────────────────────

/**
 * Initiates a guest renewal payment.
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.phone
 * @param {string} data.plate_number
 * @param {string} data.expiry_date       - YYYY-MM-DD
 * @param {string[]} data.selected_items  - array of item_key strings
 * @param {boolean} data.wants_delivery
 * @param {Object} [data.delivery_details]
 * @param {string} data.payment_gateway   - "monicredit" | "paystack"
 */
export const initGuestRenewal = (data) =>
  guestApi.post("/guest/renewals", data);

/** Polls the current payment status of a guest order */
export const getGuestOrderStatus = (orderId) =>
  guestApi.get(`/guest/renewals/${orderId}/status`);

/** Actively verifies payment with the gateway (Paystack callback fallback) */
export const verifyGuestOrder = (orderId, reference) =>
  guestApi.post(`/guest/renewals/${orderId}/verify`, { reference });

/** Fetches the full receipt (requires receipt_token) */
export const getGuestReceipt = (orderId, token) =>
  guestApi.get(`/guest/renewals/${orderId}/receipt`, { params: { token } });

/** Silently resends receipt email — always returns 200 */
export const resendGuestReceipt = (email) =>
  guestApi.post("/guest/receipt/resend", { email });

// ── Post-payment signup ─────────────────────────────────────────────────────

/**
 * Creates a full account from a paid guest order.
 *
 * @param {string} orderId
 * @param {Object} data
 * @param {string} data.receipt_token
 * @param {string} data.password
 * @param {string} data.password_confirmation
 */
export const guestSignup = (orderId, data) =>
  guestApi.post(`/guest/renewals/${orderId}/signup`, data);
