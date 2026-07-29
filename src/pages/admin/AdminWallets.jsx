import React, { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  LockClosedIcon,
  LockOpenIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  listAdminWallets,
  getAdminWalletLedger,
  adjustAdminWallet,
  setAdminWalletStatus,
} from '../../services/apiAdminWallet';

const naira = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

const REASON_LABEL = {
  funding: 'Top-up', payment: 'Payment', refund: 'Refund',
  admin_adjustment: 'Adjustment', reversal: 'Reversal',
};

function WalletDrawer({ userId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [direction, setDirection] = useState('credit');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getAdminWalletLedger(userId)
      .then((r) => setData(r.data || r))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const wallet = data?.wallet;
  const frozen = wallet?.status === 'frozen';

  const applyAdjust = async () => {
    const kobo = Math.round(Number(amount) * 100);
    if (!kobo || kobo <= 0) return toast.error('Enter a valid amount');
    if (!reason.trim()) return toast.error('A reason is required');
    setBusy(true);
    try {
      await adjustAdminWallet(userId, { direction, amount_kobo: kobo, reason: reason.trim() });
      toast.success(`Wallet ${direction === 'credit' ? 'credited' : 'debited'} ${naira(kobo)}`);
      setAmount(''); setReason('');
      load(); onChanged?.();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const toggleFreeze = async () => {
    setBusy(true);
    try {
      await setAdminWalletStatus(userId, frozen ? 'active' : 'frozen');
      toast.success(frozen ? 'Wallet unfrozen' : 'Wallet frozen');
      load(); onChanged?.();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
          <h2 className="text-lg font-semibold text-[#05243F]">Wallet</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100"><XMarkIcon className="h-5 w-5 text-gray-500" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" /></div>
        ) : (
          <div className="space-y-6 px-5 py-5">
            {/* Balance */}
            <div className="rounded-2xl bg-gradient-to-br from-[#05243F] to-[#0A3B66] p-5 text-white">
              <p className="text-xs text-white/60">Balance</p>
              <p className="mt-1 text-3xl font-semibold">{naira(wallet?.balance_kobo)}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${frozen ? 'bg-red-500/20 text-red-100' : 'bg-emerald-500/20 text-emerald-100'}`}>
                  {frozen ? 'Frozen' : 'Active'}
                </span>
                <button onClick={toggleFreeze} disabled={busy}
                  className="ml-auto flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20 disabled:opacity-50">
                  {frozen ? <LockOpenIcon className="h-3.5 w-3.5" /> : <LockClosedIcon className="h-3.5 w-3.5" />}
                  {frozen ? 'Unfreeze' : 'Freeze'}
                </button>
              </div>
            </div>

            {/* Adjust */}
            <div className="rounded-2xl border border-[#E1E6F4] bg-[#F9FAFC] p-4">
              <p className="mb-3 text-sm font-semibold text-[#05243F]">Manual adjustment</p>
              <div className="mb-3 flex gap-2">
                {['credit', 'debit'].map((d) => (
                  <button key={d} onClick={() => setDirection(d)}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all ${direction === d ? (d === 'credit' ? 'bg-[#1FA97A] text-white' : 'bg-[#C0435C] text-white') : 'bg-white text-[#05243F] border border-gray-200'}`}>
                    {d}
                  </button>
                ))}
              </div>
              <div className="relative mb-3">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#05243F]">₦</span>
                <input type="number" min="1" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2284DB]" />
              </div>
              <textarea rows={2} placeholder="Reason (required — e.g. refund for duplicate charge #257)" value={reason} onChange={(e) => setReason(e.target.value)}
                className="mb-3 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2284DB]" />
              <button onClick={applyAdjust} disabled={busy}
                className="w-full rounded-full bg-[#2284DB] py-2.5 text-sm font-semibold text-white hover:bg-[#1a6bb8] disabled:opacity-50">
                {busy ? 'Applying…' : `Apply ${direction}`}
              </button>
            </div>

            {/* Ledger */}
            <div>
              <p className="mb-2 text-sm font-semibold text-[#05243F]">History</p>
              {(data?.entries || []).length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">No transactions.</p>
              ) : (
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
                  {(data.entries || []).map((e) => {
                    const credit = e.direction === 'credit';
                    return (
                      <li key={e.id} className="flex items-center gap-3 px-3 py-2.5">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {credit ? <ArrowDownLeftIcon className="h-4 w-4" /> : <ArrowUpRightIcon className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#05243F]">{REASON_LABEL[e.reason] || e.reason}</p>
                          {e.note && <p className="truncate text-xs text-gray-500">{e.note}</p>}
                          <p className="text-[11px] text-gray-400">{new Date(e.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${credit ? 'text-emerald-600' : 'text-[#05243F]'}`}>{credit ? '+' : '−'}{naira(e.amount_kobo)}</p>
                          <p className="text-[11px] text-gray-400">{naira(e.balance_after)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminWallets() {
  const [wallets, setWallets] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await listAdminWallets({ page, limit: pagination.limit, search: search || undefined });
      const d = res.data || res;
      setWallets(d.wallets || []);
      setStats(d.stats || null);
      setPagination(d.pagination || { total: 0, page, limit: 20, totalPages: 1 });
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  }, [pagination.limit, search]);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#05243F]">Wallets</h1>
        <p className="mt-1 text-sm text-gray-500">Manage user wallet balances, adjustments and freezes.</p>
      </div>

      {/* Liability stat */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF4FD] text-[#2284DB]"><BanknotesIcon className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total liability (owed to users)</p>
            <p className="text-2xl font-bold text-[#05243F]">{stats ? naira(stats.total_liability_kobo) : '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F4F9] text-[#697C8C]">👛</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Wallets</p>
            <p className="text-2xl font-bold text-[#05243F]">{stats ? stats.wallet_count : '—'}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }} className="mb-6 flex max-w-md gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2284DB]" />
        </div>
        <button type="submit" className="rounded-lg bg-[#2284DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a6bb8]">Search</button>
        {search && <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"><XMarkIcon className="h-4 w-4 text-gray-500" /></button>}
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" /></div>
        ) : wallets.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No wallets found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>{['Owner', 'Balance', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wallets.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#05243F]">{w.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{w.user?.email || w.user_id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#05243F]">{naira(w.balance_kobo)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${w.status === 'frozen' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedUserId(w.user_id)} className="flex items-center gap-1 text-xs font-medium text-[#2284DB] hover:underline">
                        <EyeIcon className="h-3.5 w-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)} className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)} className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedUserId && (
        <WalletDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} onChanged={() => load(pagination.page)} />
      )}
    </div>
  );
}
