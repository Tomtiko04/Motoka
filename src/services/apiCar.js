import { api } from "./apiClient";

export async function addCar(formData) {
  try {
    const { data } = await api.post("/car/reg", { ...formData });
    return data;
  } catch (error) {
    throw new Error(error.message || "Car Registration Failed");
  }
}

export async function getCars() {
  try {
    const { data } = await api.get("/car/get-cars");
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch cars");
  }
}
