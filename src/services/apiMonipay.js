import { api } from "./apiClient";

export async function initializeMonipayPayment(paymentData) {
  const payload = {
    ...paymentData,
    payment_gateway: "monipay",
  };
  const { data } = await api.post("/payments/initialize", payload);
  return data;
}

export async function verifyMonipayPayment(reference) {
  const { data } = await api.post(`/payment/verify-payment/${reference}`);
  return data;
}
