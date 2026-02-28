import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  listAdminDocuments,
  approveDocument,
  rejectDocument,
  adminUploadDocument,
} from '../../services/apiAdminDocument';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userIdSearch, setUserIdSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, doc: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    user_id: '',
    document_type: 'car',
    car_slug: '',
    car_id: '',
    file: null,
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        document_type: typeFilter === 'all' ? undefined : typeFilter,
        user_id: userIdSearch.trim() || undefined,
      };
      const res = await listAdminDocuments(params);
      setDocuments(res?.data ?? []);
      setTotal(res?.pagination?.total ?? 0);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchDocuments();
  }, [currentPage, statusFilter, typeFilter]);

  const handleApprove = async (doc) => {
    try {
      setActionLoading(true);
      await approveDocument(doc.id);
      toast.success('Document approved');
      setPreviewDoc(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOpen = (doc) => {
    setRejectModal({ open: true, doc, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.doc) return;
    try {
      setActionLoading(true);
      await rejectDocument(rejectModal.doc.id, rejectModal.reason);
      toast.success('Document rejected');
      setRejectModal({ open: false, doc: null, reason: '' });
      setPreviewDoc(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const { user_id, document_type, car_slug, car_id, file } = uploadForm;
    if (!user_id || !document_type || !file) {
      toast.error('User ID, document type, and file are required');
      return;
    }
    if (document_type === 'car' && !car_slug && !car_id) {
      toast.error('Car slug or ID is required for car documents');
      return;
    }
    try {
      setActionLoading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('user_id', user_id);
      fd.append('document_type', document_type);
      if (document_type === 'car') {
        const carVal = car_slug || car_id;
        if (/^\d+$/.test(carVal)) fd.append('car_id', carVal);
        else fd.append('car_slug', carVal);
      }
      await adminUploadDocument(fd);
      toast.success('Document uploaded');
      setUploadModal(false);
      setUploadForm({ user_id: '', document_type: 'car', car_slug: '', car_id: '', file: null });
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || 'Failed to upload');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DocumentTextIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} total</span>
          <button
            onClick={() => setUploadModal(true)}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Upload for User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="User ID..."
                value={userIdSearch}
                onChange={(e) => setUserIdSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (setCurrentPage(1), fetchDocuments())}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => { setCurrentPage(1); fetchDocuments(); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Search
            </button>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All types</option>
              <option value="car">Car</option>
              <option value="driver_license">Driver License</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No documents found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => {
                  const user = doc.user || {};
                  const userName = user.first_name || user.last_name
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : doc.user_id?.slice(0, 8) || '—';
                  const car = doc.cars || doc.car;
                  const carLabel = car ? (car.registration_no || car.vehicle_make || car.slug || '—') : '—';
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{userName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        {doc.document_type?.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{carLabel}</td>
                      <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" /> Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Next <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Document Preview</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex justify-center bg-gray-100">
              {previewDoc.file_url?.match(/\.(pdf)$/i) ? (
                <iframe
                  src={previewDoc.file_url}
                  title="Document"
                  className="w-full h-[60vh] rounded"
                />
              ) : (
                <img
                  src={previewDoc.file_url}
                  alt="Document"
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              )}
            </div>
            {previewDoc.status === 'pending' && (
              <div className="p-4 border-t flex gap-2 justify-end">
                <button
                  onClick={() => handleRejectOpen(previewDoc)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(previewDoc)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Reject Document</h3>
            <p className="text-sm text-gray-500 mb-4">Optional: Provide a reason for rejection.</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((m) => ({ ...m, reason: e.target.value }))}
              placeholder="Reason..."
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModal({ open: false, doc: null, reason: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upload Document for User</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                <input
                  type="text"
                  value={uploadForm.user_id}
                  onChange={(e) => setUploadForm((f) => ({ ...f, user_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Supabase user UUID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm((f) => ({ ...f, document_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="car">Car</option>
                  <option value="driver_license">Driver License</option>
                </select>
              </div>
              {uploadForm.document_type === 'car' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Slug or ID *</label>
                  <input
                    type="text"
                    value={uploadForm.car_slug || uploadForm.car_id}
                    onChange={(e) =>
                      setUploadForm((f) => ({
                        ...f,
                        car_slug: e.target.value,
                        car_id: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Car slug or numeric ID"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, file: e.target.files?.[0] || null }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModal(false);
                    setUploadForm({ user_id: '', document_type: 'car', car_slug: '', car_id: '', file: null });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
