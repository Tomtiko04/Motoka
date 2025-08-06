import { api } from "./apiClient";

export async function createDriverLicense(formData) {
  try {
    const { data } = await api.post("/driver-license", { ...formData });
    return data;
  } catch (error) {
    throw new Error(error.message || "Driver License Creation Failed");
  }
}

export async function getDriverLicenses() {
  try {
    const { data } = await api.get("/driver-license");
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch driver licenses");
  }
}

export async function getDriverLicenseById(id) {
  try {
    const { data } = await api.get(`/driver-license/${id}`);
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch driver license");
  }
}

export async function updateDriverLicense(id, formData) {
  try {
    const { data } = await api.put(`/driver-license/${id}`, { ...formData });
    return data;
  } catch (error) {
    throw new Error(error.message || "Driver License Update Failed");
  }
}

export async function deleteDriverLicense(id) {
  try {
    const { data } = await api.delete(`/driver-license/${id}`);
    return data;
  } catch (error) {
    throw new Error(error.message || "Driver License Deletion Failed");
  }
} 