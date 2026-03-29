import { api } from "./apiClient";
import axios from "axios";
import config from "../config/config";

const guestApi = axios.create({
  baseURL: config.getApiBaseUrl(),
});

export async function saveDeferredReminders(payload) {
  const { data } = await api.post("/renewals/deferred-reminders", payload);
  return data;
}

export async function saveGuestDeferredReminders(payload) {
  const { data } = await guestApi.post("/guest/renewals/deferred-reminders", payload);
  return data;
}
