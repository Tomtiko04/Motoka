// Monicredit Payment API Service

import { api } from "./apiClient";

// Initialize Payment via backend
export async function initiateMonicreditPayment(paymentData) {
  // Debug: log the payload
  console.log("Monicredit Payment Payload:", paymentData, JSON.stringify(paymentData));
  const res = await api.post(
    "/payment/initialize",
    paymentData,
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
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