import config from '../config/config';

function adminHeaders() {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}` };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

/** GET /admin/renewals — one page of the call list, plus bucket counts */
export async function listRenewals({ bucket = 'expired', page = 1, limit = 25, search, month } = {}) {
  const params = new URLSearchParams({ bucket, page, limit });
  if (search) params.set('search', search);
  if (month) params.set('month', month);
  const res = await fetch(`${config.getApiBaseUrl()}/admin/renewals?${params}`, { headers: adminHeaders() });
  const json = await handle(res);
  return json.data;
}

/** GET /admin/renewals/summary — counts only, no car rows */
export async function getRenewalsSummary({ fresh = false } = {}) {
  const params = fresh ? '?fresh=1' : '';
  const res = await fetch(`${config.getApiBaseUrl()}/admin/renewals/summary${params}`, { headers: adminHeaders() });
  const json = await handle(res);
  return json.data;
}

/** GET /admin/renewals/deferred — customers who asked to be reminded later */
export async function listDeferredRenewals({ page = 1, limit = 25 } = {}) {
  const params = new URLSearchParams({ page, limit });
  const res = await fetch(`${config.getApiBaseUrl()}/admin/renewals/deferred?${params}`, { headers: adminHeaders() });
  const json = await handle(res);
  return json.data;
}
