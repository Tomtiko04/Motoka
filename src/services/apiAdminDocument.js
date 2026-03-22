import config from '../config/config';

function getAdminHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    Authorization: `Bearer ${token}`,
    ...(token ? {} : {}),
  };
}

/**
 * List documents with filters (admin)
 * @param {Object} params - { user_id, car_id, document_type, status, page, limit }
 */
export async function listAdminDocuments(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.user_id) searchParams.set('user_id', params.user_id);
  if (params.car_id) searchParams.set('car_id', params.car_id);
  if (params.document_type) searchParams.set('document_type', params.document_type);
  if (params.status) searchParams.set('status', params.status);
  searchParams.set('page', params.page ?? 1);
  searchParams.set('limit', params.limit ?? 20);

  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/documents?${searchParams}`,
    { headers: getAdminHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch documents');
  return data;
}

/**
 * Get document details by ID (admin)
 */
export async function getAdminDocumentDetails(id) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/documents/${id}`,
    { headers: getAdminHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch document');
  return data;
}

/**
 * Admin upload document for a user
 * @param {FormData} formData - Must include: file, user_id, document_type, and car_id or car_slug (for car docs)
 */
export async function adminUploadDocument(formData) {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${config.getApiBaseUrl()}/admin/documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type - browser sets multipart boundary
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload document');
  return data;
}

/**
 * Approve document (admin)
 */
export async function approveDocument(id) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/documents/${id}/approve`,
    {
      method: 'PUT',
      headers: {
        ...getAdminHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to approve document');
  return data;
}

/**
 * Reject document (admin)
 * @param {number} id - Document ID
 * @param {string} reason - Optional rejection reason
 */
export async function rejectDocument(id, reason = '') {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/documents/${id}/reject`,
    {
      method: 'PUT',
      headers: {
        ...getAdminHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reject document');
  return data;
}

/**
 * Get document download URL (admin)
 */
export async function getDocumentDownloadUrl(id) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/documents/${id}/download`,
    { headers: getAdminHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get download URL');
  return data.url;
}

/**
 * Search users by name / email / phone (for upload modal)
 */
export async function searchAdminUsers(q) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/users/search?q=${encodeURIComponent(q)}`,
    { headers: getAdminHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Search failed');
  return data.data || [];
}

/**
 * Get cars belonging to a user (for upload modal)
 */
export async function getUserCarsForUpload(userId) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/users/${userId}/cars`,
    { headers: getAdminHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch cars');
  return data.data || [];
}

/**
 * Manually mark a pending transaction as paid (creates order + sends notifications)
 */
export async function markTransactionPaid(reference) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/transactions/${reference}/mark-paid`,
    {
      method: 'PUT',
      headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to mark transaction as paid');
  return data;
}

/**
 * Manually mark a transaction as failed (no money received — closes it out)
 */
export async function markTransactionFailed(reference) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/transactions/${reference}/mark-failed`,
    {
      method: 'PUT',
      headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to mark transaction as failed');
  return data;
}

// ─── Driver License Applications ─────────────────────────────────────────────

/**
 * List driver license applications with optional filters
 * @param {Object} params - { page, limit, status, application_type, search }
 */
export async function listAdminDriverLicenseApplications(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);
  if (params.status) searchParams.set('status', params.status);
  if (params.application_type) searchParams.set('application_type', params.application_type);
  if (params.search) searchParams.set('search', params.search);

  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/driver-license-applications?${searchParams}`,
    { headers: getAdminHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch driver license applications');
  return data;
}

/**
 * Get full detail for a single driver license application
 */
export async function getAdminDriverLicenseApplication(id) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/driver-license-applications/${id}`,
    { headers: getAdminHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch application');
  return data;
}

/**
 * Update status (and optional notes) for a driver license application
 * @param {string|number} id
 * @param {Object} payload - { status, notes? }
 */
export async function updateAdminDriverLicenseApplicationStatus(id, payload) {
  const res = await fetch(
    `${config.getApiBaseUrl()}/admin/driver-license-applications/${id}/status`,
    {
      method: 'PATCH',
      headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update application status');
  return data;
}
