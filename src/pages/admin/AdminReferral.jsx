import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GiftIcon } from "@heroicons/react/24/outline";
import {
  getAdminReferralSettings,
  updateAdminReferralSettings,
  listAdminReferrals,
} from "../../services/apiAdminReferral";
import {
  PageHeader,
  Card,
  StatusBadge,
  EmptyState,
  BTN_PRIMARY,
  BTN_SECONDARY,
  INPUT,
  TH,
  TD,
} from "../../components/admin/ui";

const koboToNaira = (kobo) => (Number(kobo || 0) / 100).toFixed(2);
const nairaToKobo = (naira) => Math.round(parseFloat(naira) * 100);

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "qualified", label: "Qualified" },
  { value: "rewarded", label: "Rewarded" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_TONES = {
  pending: "amber",
  qualified: "blue",
  rewarded: "green",
  rejected: "red",
};

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
    <div className="space-y-6">
      <PageHeader
        icon={GiftIcon}
        title="Referral Program"
        subtitle="Rewards credit both wallets after the referred user's first real purchase."
      />

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Bonus amounts</h2>
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
                className={INPUT}
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
                className={INPUT}
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
                className={INPUT}
              />
            </label>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                Program active
              </label>
              <button
                type="button"
                disabled={saving}
                onClick={saveSettings}
                className={BTN_PRIMARY}
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
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Referrals</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${INPUT} w-auto`}
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
          <EmptyState
            icon={GiftIcon}
            title="No referrals found"
            body="Referrals will appear here once users start sharing their codes."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className={TH}>Referrer</th>
                  <th className={TH}>Referee</th>
                  <th className={TH}>Code</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Rewards</th>
                  <th className={TH}>Attributed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((r) => (
                  <tr key={r.id}>
                    <td className={TD}>
                      <div className="font-medium text-gray-900">{r.referrer?.name || "—"}</div>
                      <div className="text-xs text-gray-400">{r.referrer?.email}</div>
                    </td>
                    <td className={TD}>
                      <div className="font-medium text-gray-900">{r.referee?.name || "—"}</div>
                      <div className="text-xs text-gray-400">{r.referee?.email}</div>
                    </td>
                    <td className={`${TD} font-mono text-xs`}>{r.referral_code}</td>
                    <td className={TD}>
                      <StatusBadge tone={STATUS_TONES[r.status] || "gray"} className="capitalize">
                        {r.status}
                      </StatusBadge>
                    </td>
                    <td className={`${TD} text-xs text-gray-600`}>
                      {r.status === "rewarded"
                        ? `₦${koboToNaira(r.referrer_reward_kobo)} / ₦${koboToNaira(r.referee_reward_kobo)}`
                        : "—"}
                    </td>
                    <td className={`${TD} text-xs text-gray-500`}>
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
                className={BTN_SECONDARY}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => loadList(page + 1)}
                className={BTN_SECONDARY}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
