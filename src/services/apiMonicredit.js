// Monicredit Payment API Service

import { api } from "./apiClient";

// Initialize Payment via backend
export async function initiateMonicreditPayment(paymentData) {
  const payload = { ...paymentData, payment_gateway: 'monicredit' };
  const res = await api.post("/payments/initialize", payload);
  if (!res.data.status) throw new Error(res.data.message || "Payment initialization failed");
  return res.data;
}

// Verify Payment via backend
// Uses POST /payment/verify-payment/:reference — consistent with apiPayment.js
export async function verifyMonicreditPayment(reference) {
  const res = await api.post(`/payment/verify-payment/${reference}`);
  if (!res.data) throw new Error("Invalid response from verification");
  return res.data.data || res.data;
}

// Fetch all payment schedules
export async function fetchPaymentSchedules() {
  const res = await api.get("/payment-schedule");
  if (!res.data.status) throw new Error(res.data.message || "Failed to fetch payment schedules");
  return res.data.data;
}

// Fetch all payment heads
export async function fetchPaymentHeads() {
  const res = await api.get("/payment-schedule/get-payment-head");
  if (!res.data.status) throw new Error(res.data.message || "Failed to fetch payment heads");
  return res.data.data;
} 