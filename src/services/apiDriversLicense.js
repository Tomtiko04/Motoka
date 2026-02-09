import { api } from "./apiClient";

export async function getDriversLicensePaymentOptions() {
  const { data } = await api.get("/driver-license/payment-options");
  return data;
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

  const { data } = await api.post("/driver-license", dataToSend, config);
  return data;
}

export async function initializeDriversLicensePayment(slug) {
  const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
  return data;
}

export async function initializeDriversLicensePaymentPaystack(slug) {
  const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
  return data;
}

export async function initializeDriversLicensePaymentMonicredit(slug) {
  const { data } = await api.post(`/driver-license/${slug}/initialize-payment`);
  return data;
}

export async function verifyDriversLicensePayment(reference, licenseId) {
  const { data } = await api.get(`/driver-license/${licenseId}/verify-payment`, {
    params: { reference }
  });
  return data;
}