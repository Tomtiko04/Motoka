import React, { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  EyeIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  listAdminDriverLicenseApplications,
  getAdminDriverLicenseApplication,
  updateAdminDriverLicenseApplicationStatus,
} from '../../services/apiAdminDocument';
import {
  PageHeader,
  StatusBadge,
  PageLoader,
  EmptyState,
  BTN_PRIMARY,
  BTN_SECONDARY,
  TH,
  CARD,
} from '../../components/admin/ui';

const STATUS_TONES = {
  draft:     'gray',
  submitted: 'blue',
  approved:  'green',
  rejected:  'red',
  expired:   'amber',
};

const AppStatusBadge = ({ status }) => (
  <StatusBadge tone={STATUS_TONES[status] || 'gray'} className="capitalize">
    {status}
  </StatusBadge>
);

const TYPE_LABELS = { new: 'New License', renew: 'Renewal' };

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 sm:w-44 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 break-all">{value}</span>
    </div>
  );
}

function DetailPanel({ applicationId, onClose, onStatusUpdated }) {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    getAdminDriverLicenseApplication(applicationId)
      .then(data => {
        setApp(data.data || data);
        setSelectedStatus('');
        setNotes('');
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return toast.error('Select a status first');
    setUpdating(true);
    try {
      await updateAdminDriverLicenseApplicationStatus(applicationId, {
        status: selectedStatus,
        notes: notes || undefined,
      });
      toast.success(`Application ${selectedStatus}`);
      onStatusUpdated?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Application Detail</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <PageLoader />
        ) : !app ? (
          <EmptyState
            icon={IdentificationIcon}
            title="Application not found"
            body="It may have been deleted, or the link is out of date."
          />
        ) : (
          <div className="px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">{app.full_name || '—'}</p>
                <p className="text-xs text-gray-500">{app.user_email || app.user_id}</p>
              </div>
              <AppStatusBadge status={app.status} />
              <StatusBadge tone="gray">
                {TYPE_LABELS[app.application_type] || app.application_type}
              </StatusBadge>
            </div>

            {/* Photos */}
            {(app.passport_photo_url || app.license_document_url) && (
              <div className="grid grid-cols-2 gap-3">
                {app.passport_photo_url && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Passport Photo</p>
                    <a href={app.passport_photo_url} target="_blank" rel="noreferrer">
                      <img
                        src={app.passport_photo_url}
                        alt="Passport"
                        className="h-28 w-full object-cover rounded-xl border border-gray-200"
                      />
                    </a>
                  </div>
                )}
                {app.license_document_url && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Existing License</p>
                    <a href={app.license_document_url} target="_blank" rel="noreferrer">
                      <img
                        src={app.license_document_url}
                        alt="License"
                        className="h-28 w-full object-cover rounded-xl border border-gray-200"
                      />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Personal details */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Personal Info</p>
              <DetailRow label="Phone" value={app.phone} />
              <DetailRow label="Date of Birth" value={app.date_of_birth} />
              <DetailRow label="Place of Birth" value={app.place_of_birth} />
              <DetailRow label="Address" value={app.address} />
              <DetailRow label="State / LGA" value={[app.home_of_origin, app.local_government].filter(Boolean).join(' / ')} />
              <DetailRow label="Blood Group" value={app.blood_group} />
              <DetailRow label="Height" value={app.height} />
              <DetailRow label="Occupation" value={app.occupation} />
              <DetailRow label="Next of Kin" value={app.next_of_kin_name} />
              <DetailRow label="Next of Kin Phone" value={app.next_of_kin_phone} />
              <DetailRow label="Mother's Maiden Name" value={app.mother_maiden_name} />
            </div>

            {/* License details */}
            {(app.license_number || app.date_of_expiry || app.license_years) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">License Details</p>
                <DetailRow label="License Number" value={app.license_number} />
                <DetailRow label="Date of Expiry" value={app.date_of_expiry} />
                <DetailRow label="License Years" value={app.license_years} />
              </div>
            )}

            {/* Order */}
            {app.renewal_orders && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Linked Order</p>
                <DetailRow label="Order ID" value={String(app.renewal_orders.id)} />
                <DetailRow label="Order Status" value={app.renewal_orders.status} />
                <DetailRow label="Created" value={new Date(app.renewal_orders.created_at).toLocaleString()} />
              </div>
            )}

            {/* Existing admin notes */}
            {app.admin_notes && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-xs font-semibold text-amber-700 mb-1">Admin Notes</p>
                <p className="text-sm text-amber-900">{app.admin_notes}</p>
              </div>
            )}

            {/* Status update (only when submitted or needs action) */}
            {['submitted', 'approved', 'rejected'].includes(app.status) && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900">Update Status</p>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Select new status —</option>
                  {app.status !== 'approved' && <option value="approved">Approved</option>}
                  {app.status !== 'rejected' && <option value="rejected">Rejected</option>}
                  <option value="expired">Expired</option>
                </select>
                <textarea
                  placeholder="Notes (optional — required for rejections)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={!selectedStatus || updating}
                    className={`flex-1 ${BTN_PRIMARY}`}
                  >
                    {updating ? 'Updating...' : 'Save Status'}
                  </button>
                  <button onClick={onClose} className={BTN_SECONDARY}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 text-right">
              Last updated: {new Date(app.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDriverLicenseApplications() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await listAdminDriverLicenseApplications({
        page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        application_type: typeFilter || undefined,
        search: search || undefined,
      });
      setApplications(res.data?.applications || []);
      setPagination(res.data?.pagination || { total: 0, page, limit: 20, totalPages: 1 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, statusFilter, typeFilter, search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => { setSearch(''); setSearchInput(''); };

  const filtered = !!(search || statusFilter || typeFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={IdentificationIcon}
        title="Driver License Applications"
        subtitle={`${pagination.total} application${pagination.total !== 1 ? 's' : ''} total`}
      />

      {/* Filters */}
      <div className={`${CARD} p-4 flex flex-wrap gap-3 items-end`}>
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className={BTN_PRIMARY}>
            Search
          </button>
          {search && (
            <button type="button" onClick={clearSearch} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              <XMarkIcon className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </form>

        <div className="flex gap-2 items-center">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            <option value="new">New License</option>
            <option value="renew">Renewal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-hidden ${CARD}`}>
        {loading ? (
          <PageLoader />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={IdentificationIcon}
            title="No applications found"
            body={filtered ? 'Try adjusting your search or filters.' : 'Applications will appear here once users apply for a driver license.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Applicant', 'Type', 'Status', 'Payment', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className={TH}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{app.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{app.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {TYPE_LABELS[app.application_type] || app.application_type}
                    </td>
                    <td className="px-4 py-3">
                      <AppStatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {app.renewal_orders ? (
                        <StatusBadge tone="green">
                          Paid · #{app.renewal_orders.id}
                        </StatusBadge>
                      ) : app.status === 'submitted' ? (
                        <StatusBadge tone="amber">
                          Awaiting payment
                        </StatusBadge>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(app.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(app.id)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => load(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => load(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedId && (
        <DetailPanel
          applicationId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusUpdated={() => load(pagination.page)}
        />
      )}
    </div>
  );
}
