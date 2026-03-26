import { api } from "./apiClient";

/**
 * Get driver license prices (new / renew) from backend.
 * @returns {Promise<Array>} [{ id, license_type, price, description }, ...]
 */
export async function getDriverLicensePrices() {
  const { data } = await api.get("/driver-license-prices");
  return data?.data?.prices || data?.prices || [];
}

/** Alias for getDriverLicensePrices — used by useDriversLicensePaymentOptions */
export const getDriversLicensePaymentOptions = getDriverLicensePrices;

/** Re-export for useCreateDriverLicense hook */
export { createDriverLicense as createDriversLicense } from "./apiLicense";

/**
 * Create or update international driver license application.
 * @param {Object} payload - Form data (fullName, email, phoneNumber, address, etc.)
 */
export async function upsertInternationalDriversLicenseApplication(payload) {
  const formData = new FormData();
  const fields = {
    fullName: "full_name",
    email: "email",
    phoneNumber: "phone_number",
    address: "address",
    dateOfBirth: "date_of_birth",
    placeOfBirth: "place_of_birth",
    stateOfOrigin: "state_of_origin",
    localGovernment: "local_government",
    height: "height",
    occupation: "occupation",
    nextOfKin: "next_of_kin",
    nextOfKinNumber: "next_of_kin_number",
    motherName: "mother_maiden_name",
    licenseNumber: "license_number",
  };
  Object.entries(fields).forEach(([key, snakeKey]) => {
    if (payload[key] != null && payload[key] !== "") {
      formData.append(snakeKey, payload[key]);
    }
  });
  if (payload.driversLicense) {
    formData.append("drivers_license", payload.driversLicense);
  }
  const { data } = await api.put(
    "/international-driver-license-applications/me",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data?.data ?? data;
}

/**
 * Initialize driver license payment — uses /payments/initialize with
 * payment_type: 'driver_license'. No car_slug; backend fetches price from
 * driver_license_prices by license_type.
 * @param {Object} payload - { license_type: 'new'|'renew', payment_gateway? }
 */
export async function initializeDriverLicensePayment(payload) {
  const { data } = await api.post("/payments/initialize", {
    ...payload,
    payment_type: "driver_license",
    payment_gateway: payload.payment_gateway || "monicredit",
  });
  return data;
}
