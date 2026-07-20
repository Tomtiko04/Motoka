import { api } from "./apiClient";

export async function getPaymentMethods() {
  const { data } = await api.get("/payment-methods");
  return data;
}

export async function getBanks() {
  const { data } = await api.get("/banks");
  return data;
}

export async function getPendingTokenizationSubscriptions() {
  const { data } = await api.get("/payment-methods/pending-tokenization");
  return data;
}
