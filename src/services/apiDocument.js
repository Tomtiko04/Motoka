import { api } from "./apiClient";

/**
 * Upload a document (car or driver_license)
 * @param {FormData} formData - Must include: file, document_type, and car_slug (for car) or omit for driver_license
 */
export async function uploadDocument(formData) {
  const { data } = await api.post("/documents/upload", formData);
  return data;
}

// Helper to build FormData for car document upload
export function buildCarDocumentFormData(file, carSlug, documentCategory = null) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("document_type", "car");
  fd.append("car_slug", carSlug);
  if (documentCategory) fd.append("document_category", documentCategory);
  return fd;
}

// Helper to build FormData for driver license document upload
export function buildDriverLicenseFormData(file, documentCategory = "driver_license") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("document_type", "driver_license");
  if (documentCategory) fd.append("document_category", documentCategory);
  return fd;
}

/**
 * Get car documents for a car
 */
export async function getCarDocuments(carSlug) {
  const { data } = await api.get(`/documents/car/${carSlug}`);
  return data?.data?.documents || data?.documents || [];
}

/**
 * Get driver's license documents for the current user
 */
export async function getDriverLicenseDocuments() {
  const { data } = await api.get("/documents/driver-license");
  return data?.data?.documents || data?.documents || [];
}
