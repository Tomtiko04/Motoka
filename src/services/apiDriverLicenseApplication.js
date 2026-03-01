import { api } from "./apiClient";

export async function getDriverLicenseApplication(type = "new") {
  const { data } = await api.get(`/driver-license-applications/me?type=${type}`);
  return data?.data ?? null;
}

export async function upsertDriverLicenseApplication(payload) {
  const { data } = await api.put("/driver-license-applications/me", payload);
  return data?.data ?? null;
}
