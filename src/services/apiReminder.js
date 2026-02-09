import { api } from "./apiClient";



export async function getReminder() {
  const { data } = await api.get("/reminder");
  return data;
}
