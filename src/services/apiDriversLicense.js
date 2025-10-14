import { api } from "./apiClient";

export async function getDriversLicensePaymentOptions() {
  try {
    const { data } = await api.get("/driver-license/payment-options");
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Failed to fetch payment options";
    throw new Error(message);
  }
}

export async function createDriversLicense(payload) {
  try {
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

    const { data } = await api.post("/driver-license", dataToSend, config);
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Failed to create driver's license";
    throw new Error(message);
  }
}

export async function initializeDriversLicensePayment(slug) {
  try {
    const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Failed to initialize payment";
    throw new Error(message);
  }
}

export async function verifyDriversLicensePayment(reference, licenseId) {
  try {
    const { data } = await api.get(`/driver-license/${licenseId}/verify-payment`, {
      params: { reference }
    });
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Payment verification failed";
    throw new Error(message);
  }
}
