import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import config from '../../config/config';

const formatAmount = (n) =>
  `₦${parseFloat(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatScheduleName = (id) =>
  String(id).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const StatusPill = ({ status }) => {
  const map = {
    active:    { bg: 'bg-green-100 text-green-800',  label: 'Active' },
    unpaid:    { bg: 'bg-yellow-100 text-yellow-800', label: 'Unpaid' },
    expired:   { bg: 'bg-red-100 text-red-800',       label: 'Expired' },
    pending:   { bg: 'bg-blue-100 text-blue-800',     label: 'Pending' },
    completed: { bg: 'bg-green-100 text-green-800',   label: 'Completed' },
    in_progress:{ bg: 'bg-orange-100 text-orange-800',label: 'In Progress' },
    cancelled: { bg: 'bg-gray-100 text-gray-600',     label: 'Cancelled' },
    successful:{ bg: 'bg-green-100 text-green-800',   label: 'Successful' },
    failed:    { bg: 'bg-red-100 text-red-800',       label: 'Failed' },
  };
  const cfg = map[status?.toLowerCase()] || { bg: 'bg-gray-100 text-gray-700', label: status };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
};

const AdminCarDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => { fetchCarDetails(); }, [slug]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/cars/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status) {
        setCar(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch car details');
        navigate('/admin/cars');
      }
    } catch {
      toast.error('Failed to fetch car details');
      navigate('/admin/cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/cars/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status) {
        toast.success('Car deleted successfully');
        navigate('/admin/cars');
      } else {
        toast.error(data.message || 'Failed to delete car');
      }
    } catch {
      toast.error('Failed to delete car');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Car not found</p>
      </div>
    );
  }

  const expiryDate = car.expiry_date ? new Date(car.expiry_date) : null;
  const today = new Date();
  const daysLeft = expiryDate
    ? Math.round((expiryDate.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86400000)
    : null;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/cars')}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Car Details</h1>
            <p className="text-sm text-gray-500">{car.registration_no || car.slug}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
          Delete Car
        </button>
      </div>

      {/* Hero Card */}
      <div className="overflow-hidden rounded-xl shadow">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
                  <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875H3.75a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                  <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                  <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {car.vehicle_make} {car.vehicle_model}
                </h2>
                <p className="text-blue-100 text-sm">
                  {car.vehicle_year} &bull; {car.vehicle_color} &bull; {car.car_type?.toUpperCase() || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill status={car.status} />
              {isExpired && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/30 px-3 py-1 text-xs font-semibold text-red-100">
                  <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                  Overdue {Math.abs(daysLeft)}d
                </span>
              )}
              {isUrgent && !isExpired && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/30 px-3 py-1 text-xs font-semibold text-yellow-100">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Expires in {daysLeft}d
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-3">
          <div className="bg-white px-6 py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plate Number</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{car.registration_no || 'N/A'}</p>
          </div>
          <div className="bg-white px-6 py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiry Date</p>
            <p className={`mt-1 text-lg font-bold ${isExpired ? 'text-red-600' : isUrgent ? 'text-yellow-600' : 'text-gray-900'}`}>
              {formatDate(car.expiry_date)}
            </p>
          </div>
          <div className="bg-white px-6 py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registered</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{formatDate(car.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registration Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Registration Details</h3>
          <dl className="space-y-3">
            {[
              ['Status', <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${car.registration_status === 'registered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{car.registration_status?.toUpperCase() || 'N/A'}</span>],
              ['Chassis No.', car.chasis_no || 'N/A'],
              ['Engine No.', car.engine_no || 'N/A'],
              ['Date Issued', formatDate(car.date_issued)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                <dt className="text-sm text-gray-500">{label}</dt>
                <dd className="text-sm font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Owner Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Owner Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{car.name_of_owner || car.user?.name || 'N/A'}</p>
                {car.user?.email && <p className="text-xs text-gray-500">{car.user.email}</p>}
              </div>
            </div>
            {(car.user?.phone_number || car.phone_number) && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <PhoneIcon className="h-4 w-4 text-gray-400 shrink-0" />
                {car.user?.phone_number || car.phone_number}
              </div>
            )}
            {car.address && (
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <MapPinIcon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <span>{car.address}</span>
              </div>
            )}
            {car.user?.email && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 shrink-0" />
                {car.user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders History */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Order History</h3>
        </div>
        {car.orders?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {car.orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/orders/${order.order_number}`)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.order_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} &bull; {formatDate(order.created_at)}
                  </p>
                  {order.selected_items?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {order.selected_items.map(item => (
                        <span key={item} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                          {formatScheduleName(item)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-sm font-semibold text-gray-900">{formatAmount(order.amount_paid)}</span>
                  <StatusPill status={order.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <ClipboardDocumentListIcon className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">No orders yet</p>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <CreditCardIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Payment Transactions</h3>
        </div>
        {car.transactions?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {car.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.reference}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tx.payment_gateway?.toUpperCase() || 'PAYSTACK'} &bull; {formatDate(tx.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-sm font-semibold text-gray-900">{formatAmount(tx.amount)}</span>
                  <StatusPill status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <CreditCardIcon className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-center text-lg font-semibold text-gray-900">Delete Car</h3>
            <p className="mt-2 text-center text-sm text-gray-500">
              Are you sure you want to delete <strong>{car.vehicle_make} {car.vehicle_model}</strong>? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCar}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarDetails;
