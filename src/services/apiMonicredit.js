// Monicredit Payment API Service

import { api } from "./apiClient";

// Initialize Payment via backend
export async function initiateMonicreditPayment(paymentData) {
  // paymentData should include all necessary fields for your backend
  const res = await api.post("/payment/initialize", paymentData);
  if (!res.data.status) throw new Error(res.data.message || "Payment initialization failed");
  // Return what your backend returns (e.g., authorization_url, id, etc)
  return res.data;
}

// Verify Payment via backend
export async function verifyMonicreditPayment(transaction_id) {
  // You may need to pass additional params if your backend requires
  const res = await api.get(`/payment/verify?transaction_id=${transaction_id}`);
  if (!res.data.data) throw new Error("Invalid response from verification");
  return res.data.data;
} 