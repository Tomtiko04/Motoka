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
