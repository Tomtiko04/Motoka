import { api } from "./apiClient";

export async function initializePayment(formData) {
  try {
    const { data } = await api.post("/car/initiate", { ...formData });
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}
