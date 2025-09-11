import { api } from "./apiClient";

export async function initializePayment(payload) {
  try {
    const { data } = await api.post("/payment/initialize", payload);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function verifyPayment(reference) {
  try {
    const { data } = await api.post(`/payment/verify-payment/${reference}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function getPaymentHistory() {
  try {
    const { data } = await api.get("/payment/history");
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function getCarPaymentReceipt(carId) {
  try {
    const { data } = await api.get(`/payment/car-receipt/${carId}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

// Paystack: initialize and verify
export async function initializePaystackPayment(payload) {
  try {
    const { data } = await api.post("/paystack/initialize", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to initialize Paystack");
  }
}

export async function verifyPaystackPayment(reference) {
  try {
    const { data } = await api.get(`/paystack/verify/${reference}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to verify Paystack payment");
  }
}