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
    const { data } = await api.get(`/payment/verify-payment/${reference}`);
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