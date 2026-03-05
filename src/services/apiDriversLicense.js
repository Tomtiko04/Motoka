import { api } from "./apiClient";

export async function getDriversLicensePaymentOptions() {
  const response = await api.get("/driver-license-prices");
  // Backend returns: { success: true, data: { prices: [...] }, message: "..." }
  // api.get returns axios response, so response.data is the JSON body
  // Transform to match frontend expectations: array with { type, amount } structure
  const responseData = response.data || response;
  const prices = responseData?.data?.prices || responseData?.prices || [];
  
  // Ensure prices is an array
  if (!Array.isArray(prices)) {
    console.warn('Expected prices to be an array, got:', prices);
    return { data: [] };
  }
  
  // Transform backend format to frontend format
  // Backend: { license_type: 'new', duration: '3yr', price: 40000, ... }
  // Frontend expects: { type: 'new', amount: 40000, ... }
  const transformed = prices.map(price => ({
    type: price.license_type || price.type,
    amount: price.price || price.amount,
    duration: price.duration,
    description: price.description,
    id: price.id
  }));
  
  return { data: transformed };
}

export async function createDriversLicense(payload) {
  let dataToSend = payload;
  let config = {};

  if (payload && payload.passport_photograph instanceof File) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    dataToSend = formData;
    config.headers = { "Content-Type": "multipart/form-data" };
  }

  // Use the backend endpoint for driver license applications
  const { data } = await api.put("/driver-license-applications/me", dataToSend, config);
  return data;
}

export async function getDriversLicenseApplication(type = 'new') {
  const { data } = await api.get("/driver-license-applications/me", {
    params: { type }
  });
  return data;
}

// Upsert an international driver's license application so admins can see the user's details.
// This reuses the /driver-license-applications/me endpoint with the "new" application type.
export async function upsertInternationalDriversLicenseApplication(form) {
  // Map frontend field names to backend column names allowed in driverLicenseApplication.service.js
  const payload = {
    full_name: form.fullName,
    phone: form.phoneNumber,
    address: form.address,
    date_of_birth: form.dateOfBirth,
    place_of_birth: form.placeOfBirth,
    home_of_origin: form.stateOfOrigin,
    local_government: form.localGovernment,
    height: form.height,
    occupation: form.occupation,
    next_of_kin_name: form.nextOfKin,
    next_of_kin_phone: form.nextOfKinNumber,
    mother_maiden_name: form.motherName,
    license_number: form.licenseNumber,
    // We keep application_type as "new" (default on backend); "international"
    // is distinguished via the payment duration field.
  };

  const { data } = await api.put("/driver-license-applications/me", payload);
  return data;
}

// Helper function to normalize payment data (handles both string slug and object)
function normalizePaymentData(input) {
  if (typeof input === 'string') {
    // If input is a slug string, create a payment data object with defaults
    // The backend will handle payment initialization based on the user's application
    return {
      license_type: 'new', // Default, can be overridden if needed
      duration: null
    };
  }
  return input || {};
}

export async function initializeDriversLicensePayment(paymentData) {
  // Use the backend payment initialization endpoint
  const normalized = normalizePaymentData(paymentData);
  const { data } = await api.post("/payments/initialize", {
    payment_type: 'driver_license',
    license_type: normalized.license_type || 'new',
    duration: normalized.duration || null,
    payment_gateway: normalized.payment_gateway || 'monicredit',
    ...normalized
  });
  return data;
}

export async function initializeDriversLicensePaymentPaystack(paymentData) {
  const normalized = normalizePaymentData(paymentData);
  const { data } = await api.post("/payments/initialize", {
    payment_type: 'driver_license',
    license_type: normalized.license_type || 'new',
    duration: normalized.duration || null,
    payment_gateway: 'paystack',
    ...normalized
  });
  return data;
}

export async function initializeDriversLicensePaymentMonicredit(paymentData) {
  const normalized = normalizePaymentData(paymentData);
  const { data } = await api.post("/payments/initialize", {
    payment_type: 'driver_license',
    license_type: normalized.license_type || 'new',
    duration: normalized.duration || null,
    payment_gateway: 'monicredit',
    ...normalized
  });
  return data;
}

export async function verifyDriversLicensePayment(reference) {
  // Use the backend payment verification endpoint
  const { data } = await api.get(`/payments/verify/${reference}`);
  return data;
}