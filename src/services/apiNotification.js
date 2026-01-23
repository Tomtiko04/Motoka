import { api } from "./apiClient";

export async function getNotifications() {
  const { data } = await api.get("/notifications");
  return data.data; // Extract { notifications: [] } from response wrapper
}

export async function getNotificationsByType(type) {
  const { data } = await api.get(`/notifications/type/${encodeURIComponent(type)}`);
  return data;
}