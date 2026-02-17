import { api } from "./apiClient";

export async function getNotifications(unreadOnly = false) {
  const params = unreadOnly ? { unread_only: 'true' } : {};
  const { data } = await api.get("/notifications", { params });
  return data.data; // Extract { notifications: [] } from response wrapper
}

export async function getNotificationsByType(type) {
  const { data } = await api.get(`/notifications/type/${encodeURIComponent(type)}`);
  return data;
}

export async function markNotificationAsRead(notificationId) {
  const { data } = await api.put(`/notifications/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.put(`/notifications/mark-all-read`);
  return data;
}