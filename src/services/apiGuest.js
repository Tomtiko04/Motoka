/**
 * GUEST API SERVICE
 *
 * All calls go to the public guest and public-data endpoints;
 * no auth token is attached.
 */

import axios from 'axios';
import config from '../config/config';

// Bare axios instance — no auth interceptors
const guestApi = axios.create({
  baseURL: config.getApiBaseUrl(),
});

// ── Reference data (public) ───────────────────────────────────────────────────

export async function fetchRenewalItems() {
  const { data } = await guestApi.get('/public/renewal-items');
  return data.data; // [{ id, name, price, required }]
}

export async function fetchStates() {
  const { data } = await guestApi.get('/public/states');
  return data.data; // [{ name, code, delivery_fee }]
}

export async function fetchLGAs(stateCode) {
  const { data } = await guestApi.get(`/public/states/${stateCode}/lgas`);
  return data.data; // string[]
}

// ── Guest renewal ─────────────────────────────────────────────────────────────

/**
 * Initiates a guest renewal and returns payment details.
 *
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.email
 * @param {string} payload.phone
 * @param {string} payload.plate_number
 * @param {string} payload.expiry_date   - YYYY-MM-DD
 * @param {string[]} payload.selected_items
 * @param {boolean} payload.wants_delivery
 * @param {Object} [payload.delivery_details]
 * @param {string} payload.payment_gateway  - "monicredit" | "paystack"
 */
export async function initGuestRenewal(payload) {
  const { data } = await guestApi.post('/guest/renewals', payload);
  return data.data;
}

/**
 * Poll order status by orderId.
 * Returns { paymentStatus, receiptToken (on success), ... }
 */
export async function getGuestOrderStatus(orderId) {
  const { data } = await guestApi.get(`/guest/renewals/${orderId}/status`);
  return data.data;
}

/**
 * Fetch receipt for a paid order.
 * @param {string} orderId
 * @param {string} token - receipt_token returned after payment
 */
export async function getGuestReceipt(orderId, token) {
  const { data } = await guestApi.get(`/guest/renewals/${orderId}/receipt`, {
    params: { token }
  });
  return data.data;
}

/**
 * Directly verify payment with the gateway API.
 * Use this on the callback page after a redirect so the order is confirmed
 * without waiting for a webhook (critical for localhost / Paystack redirect flow).
 *
 * @param {string} orderId
 * @param {string} reference - payment reference from gateway redirect URL
 * @returns {{ status: 'payment_success'|'payment_failed'|'pending_payment', receiptToken?: string }}
 */
export async function verifyGuestOrder(orderId, reference) {
  const { data } = await guestApi.post(`/guest/renewals/${orderId}/verify`, { reference });
  return data.data;
}

/**
 * Create an account after payment.
 * Returns { user, session } matching existing auth shape.
 */
export async function guestSignup(orderId, { receipt_token, password, password_confirmation }) {
  const { data } = await guestApi.post(`/guest/renewals/${orderId}/signup`, {
    receipt_token,
    password,
    password_confirmation
  });
  return data.data;
}

/**
 * Resend the payment receipt email.
 * Always resolves (server returns 200 regardless of whether email exists).
 * @param {string} email
 */
export async function resendGuestReceiptEmail(email) {
  const { data } = await guestApi.post('/guest/receipt/resend', { email });
  return data;
}
