import { api } from "./apiClient";

/**
 * Initialize Paystack payment
 * @param {Object} paymentData - Payment data including car_slug, payment_schedule_id, meta_data
 * @returns {Promise<Object>} API response with payment initialization data
 */
export async function initializePaystackPayment(paymentData) {
  try {
    const { data } = await api.post("/paystack/initialize", paymentData);
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        "Failed to initialize Paystack payment";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to initialize payment");
    }
  }
}

/**
 * Verify Paystack payment
 * @param {string} reference - Payment reference from Paystack
 * @returns {Promise<Object>} API response with payment verification data
 */
export async function verifyPaystackPayment(reference) {
  try {
    const { data } = await api.post(`/payment/paystack/verify/${reference}`);
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        "Failed to verify Paystack payment";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to verify payment");
    }
  }
}
