import { api } from "./apiClient";

export async function addCar(formData) {
  try {
    const { data } = await api.post("/reg-car", { ...formData });
    return data;
  } catch (error) {
    throw new Error(error.message || "Car Registration Failed");
  }
}

export async function getCars() {
  try {
    const { data } = await api.get("/get-cars");
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch cars");
  }
}
