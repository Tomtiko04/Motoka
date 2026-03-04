import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  listAdminDocuments,
  approveDocument,
  rejectDocument,
  adminUploadDocument,
  getDocumentDownloadUrl,
  searchAdminUsers,
  getUserCarsForUpload,
} from '../../services/apiAdminDocument';

const DOC_CATEGORIES = [
  'Registration Certificate',
  'Insurance',
  'Roadworthiness',
  'Inspection Report',
  'Proof of Ownership',
  'Driver License',
  'Plate Number',
  'Other',
];

const StatusBadge = ({ status }) => {
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

// UserSearch — debounced search input that shows a dropdown of users
const UserSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const users = await searchAdminUsers(query);
        setResults(users);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email or phone…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      />
      {searching && (
        <div className="absolute right-3 top-2.5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {results.map((u) => (
            <li
              key={u.id}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(u);
                setQuery(`${u.name} (${u.email})`);
                setOpen(false);
              }}
            >
              <div className="font-medium text-gray-900">{u.name}</div>
              <div className="text-gray-500 text-xs">{u.email}</div>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && !searching && query.length >= 2 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 px-3 py-2 text-sm text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [nameSearch, setNameSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, doc: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Upload form state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    document_type: 'car',
    car_id: '',
    document_category: '',
    description: '',
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
    if (!token) { window.location.href = '/admin/login'; return; }
    fetchDocuments();
  }, [currentPage, statusFilter, typeFilter]);

  // Load cars when a user is selected and type is 'car'
  useEffect(() => {
    if (!selectedUser || uploadForm.document_type !== 'car') { setUserCars([]); return; }
    getUserCarsForUpload(selectedUser.id)
      .then(setUserCars)
      .catch(() => setUserCars([]));
  }, [selectedUser, uploadForm.document_type]);

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

  const handleDownload = async (doc) => {
    try {
      const url = await getDocumentDownloadUrl(doc.id);
      window.open(url, '_blank');
    } catch (err) {
      toast.error(err.message || 'Failed to download');
    }
  };

  const resetUploadModal = () => {
    setSelectedUser(null);
    setUserCars([]);
    setUploadForm({ document_type: 'car', car_id: '', document_category: '', description: '', file: null });
    setUploadModal(false);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) { toast.error('Please select a user'); return; }
    if (!uploadForm.file) { toast.error('Please select a file'); return; }
    if (uploadForm.document_type === 'car' && !uploadForm.car_id) { toast.error('Please select a car'); return; }

    try {
      setActionLoading(true);
      const fd = new FormData();
      fd.append('file', uploadForm.file);
      fd.append('user_id', selectedUser.id);
      fd.append('document_type', uploadForm.document_type);
      if (uploadForm.document_type === 'car') {
        fd.append('car_id', uploadForm.car_id);
      }
      if (uploadForm.document_category) fd.append('document_category', uploadForm.document_category);
      if (uploadForm.description) fd.append('description', uploadForm.description);
      await adminUploadDocument(fd);
      toast.success('Document uploaded');
      resetUploadModal();
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || 'Failed to upload');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDocs = nameSearch.trim()
    ? documents.filter((d) => {
        const name = `${d.user?.first_name || ''} ${d.user?.last_name || ''}`.toLowerCase();
        const email = (d.user?.email || '').toLowerCase();
        const q = nameSearch.toLowerCase();
        return name.includes(q) || email.includes(q);
      })
    : documents;

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-6 w-6 text-gray-600" />
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <span className="text-sm text-gray-400">({total})</span>
        </div>
        <button
          onClick={() => setUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Upload for User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by name or email…"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-400 shrink-0" />
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <DocumentTextIcon className="h-10 w-10 mx-auto mb-2" />
            No documents found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map((doc) => {
                  const u = doc.user || {};
                  const userName = (u.first_name || u.last_name)
                    ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                    : '—';
                  const car = doc.cars || doc.car;
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{userName}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize whitespace-nowrap">
                        {doc.document_type?.replace('_', ' ')}
                        {car && <div className="text-xs text-gray-400">{car.registration_no || car.vehicle_make}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {doc.document_category || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[180px]">
                        <span className="truncate block" title={doc.description}>{doc.description || '—'}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-GB') : '—'}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
            >
              Next <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Preview Modal ───────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Document Preview</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {previewDoc.document_category || (previewDoc.document_type?.replace('_', ' '))}
                  {previewDoc.description && <> · {previewDoc.description}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  Download
                </button>
                <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* File preview */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex justify-center items-center min-h-[300px]">
              {previewDoc.file_url?.match(/\.(pdf)(\?|$)/i) ? (
                <iframe src={previewDoc.file_url} title="Document" className="w-full h-[55vh] rounded border" />
              ) : (
                <img
                  src={previewDoc.file_url}
                  alt="Document"
                  className="max-w-full max-h-[60vh] object-contain rounded shadow"
                />
              )}
            </div>

            {/* Status info + actions */}
            <div className="px-5 py-3 border-t flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <StatusBadge status={previewDoc.status} />
                {previewDoc.rejection_reason && (
                  <span className="text-xs text-red-500 italic">"{previewDoc.rejection_reason}"</span>
                )}
              </div>
              {previewDoc.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRejectModal({ open: true, doc: previewDoc, reason: '' })}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(previewDoc)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Reason Modal ─────────────────────────────── */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Reject Document</h3>
            <p className="text-sm text-gray-500 mb-3">Optionally provide a reason for rejection.</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((m) => ({ ...m, reason: e.target.value }))}
              placeholder="Reason (optional)…"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModal({ open: false, doc: null, reason: '' })}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ────────────────────────────────────── */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
              <h3 className="font-semibold text-gray-900">Upload Document for User</h3>
              <button onClick={resetUploadModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="px-5 py-4 space-y-4">
              {/* User search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User <span className="text-red-500">*</span>
                </label>
                <UserSearch
                  onSelect={(u) => {
                    setSelectedUser(u);
                    setUploadForm((f) => ({ ...f, car_id: '' }));
                  }}
                />
                {selectedUser && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckIcon className="h-3 w-3" />
                    Selected: {selectedUser.name} ({selectedUser.email})
                  </p>
                )}
              </div>

              {/* Document type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type <span className="text-red-500">*</span></label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm((f) => ({ ...f, document_type: e.target.value, car_id: '' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="car">Car Document</option>
                  <option value="driver_license">Driver License</option>
                </select>
              </div>

              {/* Car selector (when type = car) */}
              {uploadForm.document_type === 'car' && selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Car <span className="text-red-500">*</span>
                  </label>
                  {userCars.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No cars found for this user</p>
                  ) : (
                    <select
                      value={uploadForm.car_id}
                      onChange={(e) => setUploadForm((f) => ({ ...f, car_id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Choose a car…</option>
                      {userCars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.vehicle_make} {c.vehicle_model} — {c.registration_no || c.slug}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={uploadForm.document_category}
                  onChange={(e) => setUploadForm((f) => ({ ...f, document_category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select category…</option>
                  {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Renewed vehicle license 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File (PDF / Image) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setUploadForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={resetUploadModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Uploading…' : 'Upload'}
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
