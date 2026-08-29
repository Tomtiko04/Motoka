import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { adminListGuestOrders } from '../../services/apiDelivery';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'payment_success', label: 'Paid' },
  { value: 'pending_payment', label: 'Pending payment' },
  { value: 'payment_failed', label: 'Failed' },
];

const STATUS_COLOR = {
  payment_success: 'text-green-600',
  pending_payment: 'text-orange-600',
  payment_failed: 'text-red-600',
};

const STATUS_LABEL = {
  payment_success: 'Paid',
  pending_payment: 'Pending payment',
  payment_failed: 'Failed',
};

function formatNairaFromKobo(kobo) {
  const n = Number(kobo);
  if (!Number.isFinite(n)) return '—';
  return `₦${(n / 100).toLocaleString('en-NG')}`;
}

function hasDelivery(order) {
  return Boolean(order?.delivery_details?.address || Number(order?.delivery_fee) > 0);
}

export default function AdminGuestOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await adminListGuestOrders({
          page: currentPage,
          limit: 20,
          status: activeFilter,
          search: submittedSearch,
        });
        if (cancelled) return;
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalOrders(data.pagination?.total || 0);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load guest orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeFilter, currentPage, submittedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-xl font-semibold text-gray-900">Guest orders</h1>
        </div>
        <div className="text-sm text-gray-500">{totalOrders} total</div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
              setSubmittedSearch(searchTerm.trim());
            }}
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search plate, email, or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/admin/guest-orders/${order.id}`)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{order.guest_name}</div>
                      <div className="text-xs text-gray-500">{order.guest_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.plate_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatNairaFromKobo(order.total_amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {hasDelivery(order) ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${STATUS_COLOR[order.payment_status] || 'text-gray-600'}`}>
                        {STATUS_LABEL[order.payment_status] || order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">No guest orders found.</div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
