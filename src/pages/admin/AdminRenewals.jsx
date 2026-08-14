import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { listRenewals, listDeferredRenewals } from '../../services/apiAdminRenewals';

/**
 * Renewals — a call list, not a dashboard.
 *
 * Read-only by design: it sends nothing. Outbound reminders belong to the daily
 * expiry-notifications job; this screen exists so the team can work the book by
 * hand, which matters most for the expired cohort no automated reminder revisits.
 */

const DEFERRED_TAB = 'deferred';

// Nigerian numbers are stored as 08… locally; wa.me needs E.164 without the +.
const toWhatsApp = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/[\s\-().+]/g, '');
  if (digits.startsWith('0') && digits.length === 11) return `234${digits.slice(1)}`;
  if (digits.startsWith('234')) return digits;
  return digits.length >= 10 ? digits : null;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Timing, always — never the workflow state. For an in-progress renewal the API's
// expiry_message becomes "Renewal in progress", which the state badge beside it
// already says; showing the date facts here instead keeps the two badges
// complementary rather than repetitive.
const daysText = (daysLeft) => {
  const n = Math.abs(daysLeft);
  const unit = n === 1 ? 'day' : 'days';
  if (daysLeft < 0) return `${n} ${unit} overdue`;
  if (daysLeft === 0) return 'Expires today';
  return `${n} ${unit} to expire`;
};

function UrgencyBadge({ daysLeft, message, state }) {
  const inProgress = state === 'in_progress';

  const style =
    inProgress ? 'bg-blue-100 text-blue-800'
    : daysLeft < 0 ? 'bg-red-100 text-red-800'
    : daysLeft === 0 ? 'bg-orange-100 text-orange-800'
    : daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${style}`}>
      {inProgress ? daysText(daysLeft) : message}
    </span>
  );
}

/**
 * Why a row might not be a sales call.
 *
 * `chase` renders nothing — the absence of a badge is the signal that the row is
 * safe to ring. Only the exceptions get called out.
 */
function RenewalStateBadge({ state, openOrder, cancelledOrder }) {
  if (state === 'in_progress') {
    return (
      <span
        className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800"
        title={openOrder ? `Order ${openOrder} is open` : undefined}
      >
        Renewal in progress — don&apos;t call
      </span>
    );
  }
  if (state === 'needs_review') {
    return (
      <span
        className="inline-block rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900"
        title={cancelledOrder ? `Order ${cancelledOrder} was cancelled after payment` : undefined}
      >
        Paid but order cancelled — review
      </span>
    );
  }
  return null;
}

function ContactLinks({ email, phone }) {
  const wa = toWhatsApp(phone);

  if (!email && !phone) {
    return <span className="text-xs text-gray-400">No contact details</span>;
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      {email && (
        <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline break-all">
          <EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />
          {email}
        </a>
      )}
      {phone && (
        <span className="inline-flex items-center gap-2">
          <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline">
            <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
            {phone}
          </a>
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              WhatsApp
            </a>
          )}
        </span>
      )}
    </div>
  );
}

const AdminRenewals = () => {
  // Dashboard tiles deep-link in as /admin/renewals?bucket=week
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('bucket') || 'expired');
  const [buckets, setBuckets] = useState([]);
  const [rows, setRows] = useState([]);
  const [deferredCount, setDeferredCount] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === DEFERRED_TAB) {
        const data = await listDeferredRenewals({ page, limit: 25 });
        setRows(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, total_pages: 1 });
        setDeferredCount(data.pagination?.total ?? 0);
      } else {
        const data = await listRenewals({ bucket: tab, page, limit: 25, search: search || undefined });
        setRows(data.data || []);
        setBuckets(data.buckets || []);
        setPagination(data.pagination || { total: 0, page: 1, total_pages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load renewals');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, search]);

  useEffect(() => { load(); }, [load]);

  // Deferred count is needed for its tab badge even while another tab is open
  useEffect(() => {
    listDeferredRenewals({ page: 1, limit: 1 })
      .then(d => setDeferredCount(d.pagination?.total ?? 0))
      .catch(() => {});
  }, []);

  const switchTab = (key) => {
    setTab(key);
    setPage(1);
    // Keep the URL shareable so an admin can send a colleague a specific bucket
    setSearchParams(key === DEFERRED_TAB ? {} : { bucket: key }, { replace: true });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const isDeferred = tab === DEFERRED_TAB;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renewals</h1>
          <p className="text-sm text-gray-600 mt-1">
            Customers to contact about expiring or expired vehicle licences.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Urgency tabs — counts come from the API so they stay right on every tab */}
      <div className="flex gap-2 flex-wrap">
        {buckets.map(b => (
          <button
            key={b.key}
            type="button"
            onClick={() => switchTab(b.key)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
              tab === b.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {b.label}
            <span className={`ml-2 text-xs font-bold ${tab === b.key ? 'text-white/80' : 'text-gray-400'}`}>
              {b.count}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => switchTab(DEFERRED_TAB)}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
            isDeferred
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
          title="Customers who chose 'remind me later' on a document at checkout"
        >
          Asked to be reminded
          <span className={`ml-2 text-xs font-bold ${isDeferred ? 'text-white/80' : 'text-gray-400'}`}>
            {deferredCount ?? '—'}
          </span>
        </button>
      </div>

      {/* State the sort in words. A column arrow alone does not tell a non-technical
          user WHICH end is urgent, and "call from the top" is the whole workflow. */}
      <p className="text-xs text-gray-500">
        {isDeferred
          ? 'Most recent request first.'
          : tab === 'expired'
            ? 'Sorted by longest overdue first — start calling from the top.'
            : 'Sorted by soonest to expire first — start calling from the top.'}
      </p>

      {!isDeferred && (
        <form onSubmit={submitSearch} className="relative max-w-md">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search plate, vehicle, owner name, email or phone…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-gray-900">Nothing here</p>
            <p className="text-sm text-gray-500 mt-1">
              {isDeferred
                ? 'No customers have asked to be reminded about a document.'
                : search
                  ? 'No matches for that search in this group.'
                  : 'No vehicles fall into this group right now.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">
                    {isDeferred ? 'Document' : 'Vehicle'}
                  </th>
                  <th className="text-left font-semibold px-5 py-3">Customer</th>
                  <th className="text-left font-semibold px-5 py-3">Contact</th>
                  <th className="text-left font-semibold px-5 py-3">
                    {isDeferred ? 'Requested' : 'Expiry ↓'}
                  </th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(row => (
                  <tr key={row.car_id || row.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-gray-900">
                        {isDeferred ? row.document_name : (row.registration_no || '—')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isDeferred ? (row.plate_number || 'No plate recorded') : (row.vehicle || '—')}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="text-gray-900">{row.owner?.name || '—'}</p>
                      {row.owner?.is_guest && (
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          Guest
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <ContactLinks email={row.owner?.email} phone={row.owner?.phone} />
                    </td>

                    <td className="px-5 py-4 align-top whitespace-nowrap text-gray-700">
                      {formatDate(isDeferred ? row.requested_at : row.expiry_date)}
                      {isDeferred && row.expiry_date && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Doc expires {formatDate(row.expiry_date)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 align-top">
                      {isDeferred ? (
                        <span className="text-xs text-gray-600">
                          {row.custom_reason || String(row.reason || '').replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <UrgencyBadge
                            daysLeft={row.days_left}
                            message={row.expiry_message}
                            state={row.renewal_state}
                          />
                          <RenewalStateBadge
                            state={row.renewal_state}
                            openOrder={row.open_order_number}
                            cancelledOrder={row.cancelled_order_number}
                          />
                          {row.car_status && row.car_status !== 'approved' && (
                            <p className="text-[11px] text-gray-500 capitalize">
                              Vehicle: {row.car_status}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.total_pages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRenewals;
