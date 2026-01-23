import { api } from "./apiClient";

export async function initializePayment(payload) {
  const { data } = await api.post("/car/initiate", payload);
  return data;
}
