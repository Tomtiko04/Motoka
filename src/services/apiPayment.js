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

export async function abandonPayment(reference, reason = 'User navigated away') {
  try {
    const { data } = await api.put(`/payments/${reference}/cancel`, { reason });
    return data;
  } catch {
    // Silent fail — best-effort cleanup, don't block navigation
  }
}



export async function initiateDriversLicensePayment(slug) {
  const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
  return data;
}

/**
 * Initialize plate number payment — reuses the same /payments/initialize endpoint
 * with payment_type: 'plate_number'. Backend branches on this to fetch price
 * from plate_number_prices instead of renewal items.
 * @param {Object} payload - { car_slug, plate_type, sub_type?, payment_gateway? }
 */
export async function initializePlatePayment(payload) {
  const { data } = await api.post('/payments/initialize', {
    ...payload,
    payment_type: 'plate_number',
    payment_gateway: payload.payment_gateway || 'monicredit'
  });
  return data;
}

/**
 * Initialize driver license payment — uses /payments/initialize with
 * payment_type: 'driver_license'. No car_slug; backend fetches price from
 * driver_license_prices by license_type.
 * @param {Object} payload - { license_type: 'new'|'renew', payment_gateway? }
 */
export async function initializeDriverLicensePayment(payload) {
  const { data } = await api.post('/payments/initialize', {
    ...payload,
    payment_type: 'driver_license',
    payment_gateway: payload.payment_gateway || 'monicredit'
  });
  return data;
}