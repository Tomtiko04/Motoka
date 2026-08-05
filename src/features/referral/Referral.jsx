import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Share2, Users, Gift, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { getMyReferral } from "../../services/apiReferral";

const naira = (kobo) =>
  `₦${(Number(kobo || 0) / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const STATUS_LABEL = {
  pending: "Waiting for first purchase",
  qualified: "Processing reward",
  rewarded: "Rewarded",
  rejected: "Not eligible",
};

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["referral"],
    queryFn: getMyReferral,
  });

  const copyCode = async () => {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      toast.success("Referral code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy code");
    }
  };

  const copyLink = async () => {
    if (!data?.share_url) return;
    try {
      await navigator.clipboard.writeText(data.share_url);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const share = async () => {
    if (!data?.share_url) return;
    const message = `Join Motoka with my referral code ${data.code} and we both get ${naira(data.referee_reward_kobo)} wallet credit after your first purchase. ${data.share_url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join Motoka", text: message, url: data.share_url });
        return;
      } catch {
        /* user cancelled or unsupported — fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Invite message copied");
    } catch {
      toast.error("Could not share");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-3 pb-16 sm:px-6">
        <h1 className="mb-5 text-xl font-medium text-[#05243F] sm:text-2xl">Referrals</h1>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-[#F1F4F9]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-3 pb-16 sm:px-6">
        <h1 className="mb-5 text-xl font-medium text-[#05243F] sm:text-2xl">Referrals</h1>
        <p className="text-sm text-[#A73957]">Could not load your referral details. Please try again.</p>
      </div>
    );
  }

  const stats = data.stats || {};
  const referrals = data.referrals || [];

  return (
    <div className="mx-auto max-w-2xl px-3 pb-16 sm:px-6">
      <h1 className="mb-5 text-xl font-medium text-[#05243F] sm:text-2xl">Referrals</h1>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#05243F] to-[#0A3B66] p-6 text-white shadow-sm">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="mb-1 text-sm text-white/70">Your referral code</p>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-3xl font-semibold tracking-widest">{data.code}</span>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mb-5 max-w-md text-sm text-white/75">
            Share your link. When a friend signs up with your code and completes their first Motoka
            purchase, you both get {naira(data.referrer_reward_kobo)} in wallet credit.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={share}
              className="flex items-center gap-2 rounded-full bg-[#2389E3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b6dbd]"
            >
              <Share2 className="h-4 w-4" /> Share invite
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/20"
            >
              <Copy className="h-4 w-4" /> Copy link
            </button>
          </div>
        </div>
      </div>

      {!data.is_active && (
        <p className="mt-3 rounded-2xl bg-[#FFF4DD] px-4 py-3 text-sm text-[#05243F]">
          The referral program is currently paused. Your existing referrals are still tracked.
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#EEF1F6] bg-white p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F3FC] text-[#2389E3]">
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-2xl font-semibold text-[#05243F]">{stats.pending || 0}</p>
          <p className="text-xs text-[#697C8C]">Pending</p>
        </div>
        <div className="rounded-2xl border border-[#EEF1F6] bg-white p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#E7F6EF] text-[#1FA97A]">
            <Users className="h-4 w-4" />
          </div>
          <p className="text-2xl font-semibold text-[#05243F]">{stats.rewarded || 0}</p>
          <p className="text-xs text-[#697C8C]">Rewarded</p>
        </div>
        <div className="rounded-2xl border border-[#EEF1F6] bg-white p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF4DD] text-[#C48A1A]">
            <Gift className="h-4 w-4" />
          </div>
          <p className="text-2xl font-semibold text-[#05243F]">{naira(stats.earned_kobo)}</p>
          <p className="text-xs text-[#697C8C]">Earned</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-[#05243F]">Your referrals</h2>
        {referrals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E1E5EE] p-8 text-center">
            <p className="text-sm text-[#697C8C]">No referrals yet.</p>
            <p className="mt-1 text-xs text-[#697C8C]/70">Share your code to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F1F4F9] overflow-hidden rounded-2xl border border-[#EEF1F6] bg-white">
            {referrals.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#05243F]">{r.referee_first_name}</p>
                  <p className="text-xs text-[#697C8C]">
                    {STATUS_LABEL[r.status] || r.status}
                    {r.attributed_at
                      ? ` · ${new Date(r.attributed_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}`
                      : ""}
                  </p>
                </div>
                {r.status === "rewarded" && (
                  <span className="text-sm font-semibold text-[#1FA97A]">
                    +{naira(r.referrer_reward_kobo ?? data.referrer_reward_kobo)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
