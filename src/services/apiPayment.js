import { api } from "./apiClient";

export async function initializePayment(payload) {
  try {
    const { data } = await api.post("/payment/initialize", payload);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function verifyPaymentMonicredit(orderId) {
  try {
    const { data } = await api.post(`/payment/verify-payment/${orderId}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
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

export async function verifyPayment() {
  console.log("coming soon");
}

export async function verifyDriversLicensePaymentMonicredit(payload) {
  console.log("soon");
}

export async function verifyDriversLicensePaymentPaystack(payload) {
  console.log("soon"); 
}