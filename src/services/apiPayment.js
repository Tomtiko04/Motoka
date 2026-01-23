import { api } from "./apiClient";

export async function initializePayment(payload) {
  const { data } = await api.post("/payment/initialize", payload);
  return data;
}

export async function verifyPayment(reference) {
  const { data } = await api.post(`/payment/verify-payment/${reference}`);
  return data;
}

export async function getPaymentHistory() {
  const { data } = await api.get("/payment/history");
  return data;
}

export async function getCarPaymentReceipt(carId) {
  const { data } = await api.get(`/payment/car-receipt/${carId}`);
  return data;
}

// Paystack: initialize and verify
export async function initializePaystackPayment(payload) {
  const { data } = await api.post("/paystack/initialize", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function getPaystackReference(transactionId) {
  const { data } = await api.get(
    `/payment/paystack/reference/${transactionId}`,
  );
  return data;
}

export async function checkExistingPayments(carSlug, paymentScheduleIds) {
  const { data } = await api.post("/payment/check-existing", {
    car_slug: carSlug,
    payment_schedule_ids: paymentScheduleIds,
  });
  return data;
}

export async function verifyPaystackPayment(reference) {
  const { data } = await api.post(`/payment/paystack/verify/${reference}`);
  return data;
}

export async function initiateDriversLicensePayment(slug) {
  const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
  return data;
}