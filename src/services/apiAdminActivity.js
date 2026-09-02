import config from "../config/config";

function adminHeaders() {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Everything created since `since` (ISO). The response carries the server's own
// `now`, which the caller should use as the next `since` — polling off the
// browser clock replays or skips activity whenever the laptop is skewed.
export async function getAdminActivitySince(since) {
  const params = new URLSearchParams({ since });
  const res = await fetch(`${config.getApiBaseUrl()}/admin/activity/since?${params}`, {
    headers: adminHeaders(),
  });
  const data = await res.json();
  if (!(data.status || data.success)) {
    throw new Error(data.message || "Failed to load activity");
  }
  return data.data;
}
