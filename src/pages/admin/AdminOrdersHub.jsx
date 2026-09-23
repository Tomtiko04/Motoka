import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminOrders from './AdminOrders';
import AdminGuestOrders from './AdminGuestOrders';
import { adminListGuestOrders } from '../../services/apiDelivery';
import config from '../../config/config';

const LAST_SEEN_KEY = 'adminOrdersLastSeen';
const POLL_MS = 60000;

const readLastSeen = () => {
  try {
    return JSON.parse(localStorage.getItem(LAST_SEEN_KEY)) || {};
  } catch {
    return {};
  }
};

const writeLastSeen = (tab) => {
  const seen = readLastSeen();
  seen[tab] = new Date().toISOString();
  localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(seen));
  return seen;
};

const countNewer = (rows, sinceIso) => {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  // First visit ever: nothing counts as unread, otherwise the badge screams
  // on day one about orders the admin has long since handled elsewhere.
  if (!sinceIso) return 0;
  const since = new Date(sinceIso).getTime();
  return rows.filter((r) => r?.created_at && new Date(r.created_at).getTime() > since).length;
};

export default function AdminOrdersHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'guest' ? 'guest' : 'orders';
  const [newCounts, setNewCounts] = useState({ orders: 0, guest: 0 });

  const refreshBadges = useCallback(async (seenOverride) => {
    const seen = seenOverride || readLastSeen();
    const token = localStorage.getItem('adminToken');
    const results = { orders: 0, guest: 0 };

    // Both fetches are first-page-only probes; a badge that occasionally
    // says 20 when the truth is 23 is fine, a page that hammers the API is not.
    await Promise.all([
      (async () => {
        try {
          const res = await fetch(
            `${config.getApiBaseUrl()}/admin/orders?status=all&page=1&per_page=20`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          results.orders = countNewer(data?.data?.data, seen.orders);
        } catch {
          /* badge only — never surface an error for this */
        }
      })(),
      (async () => {
        try {
          const data = await adminListGuestOrders({ page: 1, limit: 20 });
          results.guest = countNewer(data?.orders, seen.guest);
        } catch {
          /* badge only */
        }
      })(),
    ]);

    setNewCounts(results);
  }, []);

  // Mark the visible tab as seen (its badge clears), keep the other's badge live.
  useEffect(() => {
    const seen = writeLastSeen(activeTab);
    refreshBadges(seen);
    const timer = setInterval(() => refreshBadges(), POLL_MS);
    return () => clearInterval(timer);
  }, [activeTab, refreshBadges]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setSearchParams(tab === 'guest' ? { tab: 'guest' } : {}, { replace: false });
  };

  const tabs = [
    { key: 'orders', label: 'Orders' },
    { key: 'guest', label: 'Guest Orders' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ key, label }) => {
          const isActive = key === activeTab;
          const unread = !isActive ? newCounts[key] : 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className={`relative -mb-px flex items-center gap-2 rounded-t-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border border-b-0 border-gray-200 bg-white text-blue-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
              {unread > 0 && (
                <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold leading-none text-white">
                  {unread >= 20 ? '20+' : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'guest' ? <AdminGuestOrders /> : <AdminOrders />}
    </div>
  );
}
