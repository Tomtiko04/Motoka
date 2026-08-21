import { api } from "./apiClient";
import axios from "axios";
import config from "../config/config";

const guestApi = axios.create({
  baseURL: config.getApiBaseUrl(),
});

export async function quoteDelivery({ state, lga, purpose = "renewal", selected_items = [], guest = false }) {
  const body = { state, lga, purpose, selected_items };
  if (guest) {
    const { data } = await guestApi.post("/public/delivery/quote", body);
    return data.data;
  }
  const { data } = await api.post("/delivery/quote", body);
  return data.data;
}

export async function getOrderTracking(orderNumber) {
  const { data } = await api.get(`/orders/${orderNumber}/tracking`);
  return data.data;
}

export async function getGuestOrderTracking(orderId, token) {
  const { data } = await guestApi.get(`/guest/renewals/${orderId}/tracking`, {
    params: { token },
  });
  return data.data;
}

export async function adminCreateShipment({ order_number, guest_order_id, order_type, weight_kg }) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${config.getApiBaseUrl()}/admin/shipments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order_number, guest_order_id, order_type, weight_kg }),
  });
  const data = await res.json();
  if (!res.ok || data.success === false || data.status === false) {
    throw new Error(data.message || "Failed to generate waybill");
  }
  return data.data;
}

export async function adminGetGuestOrder(orderId) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${config.getApiBaseUrl()}/admin/guest-orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to load guest order");
  }
  return data.data;
}

export async function adminListGuestOrders({ page = 1, limit = 20, status, search } = {}) {
  const token = localStorage.getItem("adminToken");
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  const res = await fetch(`${config.getApiBaseUrl()}/admin/guest-orders?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to load guest orders");
  }
  return data.data;
}

export async function adminGetShipment(orderNumber) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${config.getApiBaseUrl()}/admin/orders/${orderNumber}/shipment`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}
