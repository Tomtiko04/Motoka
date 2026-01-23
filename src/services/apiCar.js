import { api } from "./apiClient";

export async function addCar(formData) {
  const { data } = await api.post("/reg-car", { ...formData });
  return data;
}

export async function getCars() {
  const { data } = await api.get("/get-cars");
  return data.data; // Extract { cars: [...], pagination: {...} } from response wrapper
}
