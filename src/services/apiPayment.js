import { api } from "./apiClient";

export async function initializePayment(payload) {
  // If payment_gateway is not specified, default to 'monicredit' to match backend default
  const paymentPayload = {
    ...payload,
    payment_gateway: payload.payment_gateway || 'monicredit'
  };
  const { data } = await api.post("/payments/initialize", paymentPayload);
  return data;
}

export async function verifyPayment(reference) {
  const { data } = await api.post(`/payment/verify-payment/${reference}`);
  return data;
}

export async function verifyPaymentMonicredit(reference) {
  const { data } = await api.post(`/payment/verify-payment/${reference}`);
  return data;
}

export async function verifyPaystackPayment(reference) {
    const { data } = await api.post(`/payment/paystack/verify/${reference}`);
    return data;
}

export async function getPaymentHistory() {
  const { data } = await api.get("/payments/history");
  return data;
}

export async function getCarPaymentReceipt(carId) {
  const { data } = await api.get(`/payment/car-receipt/${carId}`);
  return data;
}

/**
 * Get payment receipt based on payment type
 * @param {string} paymentType - Payment type (drivers_license, vehicle_paper, etc.)
 * @param {string} identifier - Identifier for the payment (slug, carId, etc.)
 * @returns {Promise<Object>} Receipt data
 */
export async function getPaymentReceipt(paymentType, identifier) {
  try {
    let endpoint;
    
    switch (paymentType) {
      case 'drivers_license':
        endpoint = `/driver-license/${identifier}/receipt`;
        break;
      case 'vehicle_paper':
      case 'license_renewal':
        endpoint = `/payment/car-receipt/${identifier}`;
        break;
      default:
        // Fallback to car receipt for unknown types
        endpoint = `/payment/car-receipt/${identifier}`;
    }
    
    const { data } = await api.get(endpoint);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
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



export async function initiateDriversLicensePayment(slug) {
  const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
  return data;
}