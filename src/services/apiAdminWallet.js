import config from '../config/config';

function adminHeaders(json = false) {
  const token = localStorage.getItem('adminToken');
  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

// GET /admin/wallets — list + liability stats
export async function listAdminWallets({ page = 1, limit = 20, search } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const res = await fetch(`${config.getApiBaseUrl()}/admin/wallets?${params}`, { headers: adminHeaders() });
  return handle(res);
}

// GET /admin/wallets/:userId/ledger
export async function getAdminWalletLedger(userId, { page = 1, limit = 25 } = {}) {
  const params = new URLSearchParams({ page, limit });
  const res = await fetch(`${config.getApiBaseUrl()}/admin/wallets/${userId}/ledger?${params}`, { headers: adminHeaders() });
  return handle(res);
}

// POST /admin/wallets/:userId/adjust  { direction, amount_kobo, reason }
export async function adjustAdminWallet(userId, { direction, amount_kobo, reason }) {
  const res = await fetch(`${config.getApiBaseUrl()}/admin/wallets/${userId}/adjust`, {
    method: 'POST',
    headers: adminHeaders(true),
    body: JSON.stringify({ direction, amount_kobo, reason }),
  });
  return handle(res);
}

// POST /admin/wallets/:userId/status  { status }
export async function setAdminWalletStatus(userId, status) {
  const res = await fetch(`${config.getApiBaseUrl()}/admin/wallets/${userId}/status`, {
    method: 'POST',
    headers: adminHeaders(true),
    body: JSON.stringify({ status }),
  });
  return handle(res);
}
