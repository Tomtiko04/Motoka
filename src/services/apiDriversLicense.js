import { api } from "./apiClient";

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
