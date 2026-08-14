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

/** GET /admin/renewals — call list for one urgency bucket, plus counts for all */
export async function listRenewals({ bucket = 'expired', page = 1, limit = 25, search } = {}) {
  const params = new URLSearchParams({ bucket, page, limit });
  if (search) params.set('search', search);
  const res = await fetch(`${config.getApiBaseUrl()}/admin/renewals?${params}`, { headers: adminHeaders() });
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
