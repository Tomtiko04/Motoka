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
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to initialize Paystack",
    );
  }
}

export async function getPaystackReference(transactionId) {
  try {
    const { data } = await api.get(
      `/payment/paystack/reference/${transactionId}`,
    );
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get Paystack reference",
    );
  }
}

export async function checkExistingPayments(carSlug, paymentScheduleIds) {
  try {
    const { data } = await api.post("/payment/check-existing", {
      car_slug: carSlug,
      payment_schedule_ids: paymentScheduleIds,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to check existing payments",
    );
  }
}

export async function verifyPaystackPayment(reference) {
  try {
    const { data } = await api.post(`/payment/paystack/verify/${reference}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to verify Paystack payment",
    );
  }
}

export async function initiateDriversLicensePayment(slug) {
  try {
    const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to initiate driver's license payment",
    );
  }
}