import config from '../config/config';

function getAdminHeaders(extra = {}) {
  const token = localStorage.getItem('adminToken');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

async function parseJsonResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || 'Request failed' };
  }
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Request failed');
    err.status = res.status;
    err.code = data.code;
    err.data = data.data;
    throw err;
  }
  return data;
}

export async function getAdminLadipoCapabilities() {
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/capabilities`, {
    headers: getAdminHeaders(),
  });
  return parseJsonResponse(res);
}

export async function listAdminLadipoOrders(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.per_page) searchParams.set('per_page', params.per_page);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.workflow_state) searchParams.set('workflow_state', params.workflow_state);
  if (params.unassigned) searchParams.set('unassigned', params.unassigned);
  if (params.handler_key) searchParams.set('handler_key', params.handler_key);
  if (params.exclude_handler_key) searchParams.set('exclude_handler_key', params.exclude_handler_key);

  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/orders?${searchParams.toString()}`, {
    headers: getAdminHeaders(),
  });
  return parseJsonResponse(res);
}

export async function getAdminLadipoOrder(orderNumber) {
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/orders/${orderNumber}`, {
    headers: getAdminHeaders(),
  });
  return parseJsonResponse(res);
}

export async function updateAdminLadipoOrderStatus(orderNumber, payload) {
  const {
    status,
    reason,
    handledByName,
    expectedAdminOpsVersion,
    idempotencyKey,
  } = payload;
  const body = { status };
  if (reason) body.reason = reason;
  if (handledByName) body.handled_by_name = handledByName;
  if (expectedAdminOpsVersion !== undefined && expectedAdminOpsVersion !== null) {
    body.expected_admin_ops_version = expectedAdminOpsVersion;
  }
  const headers = getAdminHeaders();
  const key = idempotencyKey || newIdempotencyKey();
  if (key) headers['Idempotency-Key'] = key;
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/orders/${orderNumber}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}

export async function updateAdminLadipoOrderAssignee(orderNumber, handledByName, options = {}) {
  const {
    expectedAdminOpsVersion,
    assignedByName,
    idempotencyKey,
  } = options;
  const body = { handled_by_name: handledByName };
  if (assignedByName) body.assigned_by_name = assignedByName;
  if (expectedAdminOpsVersion !== undefined && expectedAdminOpsVersion !== null) {
    body.expected_admin_ops_version = expectedAdminOpsVersion;
  }
  const headers = getAdminHeaders();
  const key = idempotencyKey || newIdempotencyKey();
  if (key) headers['Idempotency-Key'] = key;
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/orders/${orderNumber}/assignee`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}

export async function updateAdminLadipoOrderWorkflow(orderNumber, payload) {
  const {
    workflowState,
    blockReason,
    handledByName,
    expectedAdminOpsVersion,
    idempotencyKey,
  } = payload;
  const body = { workflow_state: workflowState, handled_by_name: handledByName };
  if (blockReason) body.block_reason = blockReason;
  if (expectedAdminOpsVersion !== undefined && expectedAdminOpsVersion !== null) {
    body.expected_admin_ops_version = expectedAdminOpsVersion;
  }
  const headers = getAdminHeaders();
  const key = idempotencyKey || newIdempotencyKey();
  if (key) headers['Idempotency-Key'] = key;
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/orders/${orderNumber}/workflow`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}

export async function listAdminLadipoProducts(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.per_page) searchParams.set('per_page', params.per_page);
  if (params.search) searchParams.set('search', params.search);

  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/products?${searchParams.toString()}`, {
    headers: getAdminHeaders(),
  });
  return parseJsonResponse(res);
}

export async function createAdminLadipoProduct(payload) {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  });
  return parseJsonResponse(res);
}

export async function updateAdminLadipoProduct(productId, payload) {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/products/${productId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  });
  return parseJsonResponse(res);
}

export async function deleteAdminLadipoProduct(productId) {
  const res = await fetch(`${config.getApiBaseUrl()}/admin/ladipo/products/${productId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });
  return parseJsonResponse(res);
}
