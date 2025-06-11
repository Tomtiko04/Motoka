import { api } from "./apiClient";



export async function getReminder() {
  try {
    const { data } = await api.get("/reminder");
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch reminders");
  }
}
