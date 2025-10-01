import { api } from "./apiClient";

export async function getNotifications() {
  try {
    const { data } = await api.get("/notifications");
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message || "Failed to fetch notifications";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to fetch notifications");
    }
  }
}

export async function getNotificationsByType(type) {
  try {
    const { data } = await api.get(`/notifications/type/${encodeURIComponent(type)}`);
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        `Failed to fetch notifications for type: ${type}`;
      throw new Error(errorMessage);
    } else {
      throw new Error(
        error.message || `Failed to fetch notifications for type: ${type}`,
      );
    }
  }
}