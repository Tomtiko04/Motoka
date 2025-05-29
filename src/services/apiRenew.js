import { api } from "./apiClient";

export async function initializePayment(payload) {
  try {
    const { data } = await api.post("/car/initiate", payload);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}
