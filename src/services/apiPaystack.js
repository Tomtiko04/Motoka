import { api } from "./apiClient";
import { getAttribution } from "../utils/attribution";

/**
 * Initialize Paystack payment
 * @param {Object} paymentData - Payment data including car_slug, payment_schedule_id, meta_data
 * @returns {Promise<Object>} API response with payment initialization data
 */
export async function initializePaystackPayment(paymentData) {
  // Ensure payment_gateway is set to 'paystack'
  const payload = {
    ...paymentData,
    attribution: getAttribution(),
    payment_gateway: 'paystack'
  };
  const { data } = await api.post("/payments/initialize", payload);
  return data;
}

/**
 * Verify Paystack payment
 * @param {string} reference - Payment reference from Paystack
 * @returns {Promise<Object>} API response with payment verification data
 */
export async function verifyPaystackPayment(reference) {
  const { data } = await api.post(`/payment/paystack/verify/${reference}`);
  return data;
}
