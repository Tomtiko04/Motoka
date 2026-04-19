import { api } from "./apiClient";

/**
 * Create a subscription for a car.
 * @param {Object} payload - { car_slug, amount, plan, selected_items }
 */
export async function createSubscription(payload) {
  const { data } = await api.post("/subscriptions", payload);
  return data;
}

/**
 * Get all subscriptions for the current user.
 */
export async function getSubscriptions(params = {}) {
  const { data } = await api.get("/subscriptions", { params });
  return data;
}

/**
 * Initiate ₦50 card tokenization for a pending subscription.
 * Returns { payment: { authorization_url, access_code, reference } }
 * @param {number} subscriptionId
 */
export async function initiateTokenization(subscriptionId) {
  const { data } = await api.post(`/subscriptions/${subscriptionId}/tokenize`);
  return data;
}

/**
 * Cancel a subscription.
 * @param {number} subscriptionId
 * @param {string} [reason]
 */
export async function cancelSubscription(subscriptionId, reason) {
  const { data } = await api.put(`/subscriptions/${subscriptionId}/cancel`, { reason });
  return data;
}

/**
 * Pause a subscription.
 * @param {number} subscriptionId
 */
export async function pauseSubscription(subscriptionId) {
  const { data } = await api.put(`/subscriptions/${subscriptionId}/pause`);
  return data;
}

/**
 * Resume a paused subscription.
 * @param {number} subscriptionId
 */
export async function resumeSubscription(subscriptionId) {
  const { data } = await api.put(`/subscriptions/${subscriptionId}/resume`);
  return data;
}
