import config from "../config/config";

function adminHeaders() {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getAdminReferralSettings() {
  const res = await fetch(`${config.getApiBaseUrl()}/admin/referral/settings`, {
    headers: adminHeaders(),
  });
  const data = await res.json();
  if (!(data.status || data.success)) {
    throw new Error(data.message || "Failed to load referral settings");
  }
  return data.data;
}

export async function updateAdminReferralSettings(payload) {
  const res = await fetch(`${config.getApiBaseUrl()}/admin/referral/settings`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!(data.status || data.success)) {
    throw new Error(data.message || "Failed to update referral settings");
  }
  return data.data;
}

export async function listAdminReferrals({ page = 1, limit = 20, status } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  const res = await fetch(`${config.getApiBaseUrl()}/admin/referral/list?${params}`, {
    headers: adminHeaders(),
  });
  const data = await res.json();
  if (!(data.status || data.success)) {
    throw new Error(data.message || "Failed to list referrals");
  }
  return data.data;
}
