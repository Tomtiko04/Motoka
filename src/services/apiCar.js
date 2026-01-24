import { api } from "./apiClient";

export async function addCar(formData) {
  const { data } = await api.post("/reg-car", { ...formData });
  return data;
}

export async function getCars() {
  const { data } = await api.get("/get-cars");
  return data.data; // Extract { cars: [...], pagination: {...} } from response wrapper
}

export async function updateCarDocuments(carSlug, carData) {
  const { data } = await api.put(`/car/${carSlug}`, carData);
  return data;
}

export async function updateCarDetails(carSlug, carData) {
  const { data } = await api.put(`/car/${carSlug}`, carData);
  return data;
}

export async function deleteCar(carId) {
  const { data } = await api.delete(`/car/${carId}`);
  return data;
}
