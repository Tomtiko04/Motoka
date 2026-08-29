import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAdminReferralSettings,
  updateAdminReferralSettings,
  listAdminReferrals,
} from "../../services/apiAdminReferral";

const koboToNaira = (kobo) => (Number(kobo || 0) / 100).toFixed(2);
const nairaToKobo = (naira) => Math.round(parseFloat(naira) * 100);

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "qualified", label: "Qualified" },
  { value: "rewarded", label: "Rewarded" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminReferral() {
  const [settings, setSettings] = useState(null);
  const [referrerNaira, setReferrerNaira] = useState("300");
  const [refereeNaira, setRefereeNaira] = useState("300");
  const [isActive, setIsActive] = useState(true);
  const [maxRewards, setMaxRewards] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const limit = 20;

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await getAdminReferralSettings();
      setSettings(data);
      setReferrerNaira(koboToNaira(data.referrer_reward_kobo));
      setRefereeNaira(koboToNaira(data.referee_reward_kobo));
      setIsActive(!!data.is_active);
      setMaxRewards(
        data.max_rewards_per_referrer == null ? "" : String(data.max_rewards_per_referrer),
      );
    } catch (e) {
      toast.error(e.message || "Failed to load settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadList = async (p = page) => {
    try {
      setLoadingList(true);
      const data = await listAdminReferrals({
        page: p,
        limit,
        status: status || undefined,
      });
      setList(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch (e) {
      toast.error(e.message || "Failed to load referrals");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const saveSettings = async () => {
    const referrerKobo = nairaToKobo(referrerNaira);
    const refereeKobo = nairaToKobo(refereeNaira);
    if (Number.isNaN(referrerKobo) || referrerKobo < 0 || Number.isNaN(refereeKobo) || refereeKobo < 0) {
      toast.error("Enter valid reward amounts in Naira");
      return;
    }
    let maxVal = null;
    if (maxRewards.trim() !== "") {
      maxVal = parseInt(maxRewards, 10);
      if (!Number.isInteger(maxVal) || maxVal < 1) {
        toast.error("Max rewards must be a positive integer or empty");
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await updateAdminReferralSettings({
        referrer_reward_kobo: referrerKobo,
        referee_reward_kobo: refereeKobo,
        is_active: isActive,
        max_rewards_per_referrer: maxVal,
      });
      setSettings(updated);
      toast.success("Referral settings updated");
    } catch (e) {
      toast.error(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#05243F]">Referral Program</h1>
        <p className="mt-1 text-sm text-gray-500">
          Rewards credit both wallets after the referred user&apos;s first real purchase.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#05243F]">Bonus amounts</h2>
        {loadingSettings ? (
          <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-600">Referrer reward (₦)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={referrerNaira}
                onChange={(e) => setReferrerNaira(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F4F5FC] px-3 py-2.5 text-[#05243F] focus:outline-none focus:ring-2 focus:ring-[#2389E3]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-600">Referee reward (₦)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={refereeNaira}
                onChange={(e) => setRefereeNaira(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F4F5FC] px-3 py-2.5 text-[#05243F] focus:outline-none focus:ring-2 focus:ring-[#2389E3]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-600">Max rewards / referrer</span>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={maxRewards}
                onChange={(e) => setMaxRewards(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F4F5FC] px-3 py-2.5 text-[#05243F] focus:outline-none focus:ring-2 focus:ring-[#2389E3]/30"
              />
            </label>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#2389E3]"
                />
                Program active
              </label>
              <button
                type="button"
                disabled={saving}
                onClick={saveSettings}
                className="rounded-xl bg-[#2389E3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b6dbd] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save settings"}
              </button>
            </div>
          </div>
        )}
        {settings?.updated_at && (
          <p className="mt-3 text-xs text-gray-400">
            Last updated {new Date(settings.updated_at).toLocaleString("en-NG")}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#05243F]">Referrals</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#F4F5FC] px-3 py-2 text-sm text-[#05243F]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {loadingList ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No referrals found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-3 py-2 font-medium">Referrer</th>
                  <th className="px-3 py-2 font-medium">Referee</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Rewards</th>
                  <th className="px-3 py-2 font-medium">Attributed</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="px-3 py-3">
                      <div className="font-medium text-[#05243F]">{r.referrer?.name || "—"}</div>
                      <div className="text-xs text-gray-400">{r.referrer?.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-[#05243F]">{r.referee?.name || "—"}</div>
                      <div className="text-xs text-gray-400">{r.referee?.email}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{r.referral_code}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {r.status === "rewarded"
                        ? `₦${koboToNaira(r.referrer_reward_kobo)} / ₦${koboToNaira(r.referee_reward_kobo)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {r.attributed_at
                        ? new Date(r.attributed_at).toLocaleString("en-NG")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadList(page - 1)}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => loadList(page + 1)}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
