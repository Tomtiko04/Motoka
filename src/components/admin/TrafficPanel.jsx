import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import config from '../../config/config';

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
];

const fmtInt = (v) => Number(v || 0).toLocaleString();

function ChannelRow({ channel, maxSessions }) {
  const share = maxSessions > 0 ? Math.round((channel.sessions / maxSessions) * 100) : 0;
  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium text-gray-900">{channel.channel}</span>
        <span className="shrink-0 text-xs text-gray-500">
          {fmtInt(channel.sessions)} sessions · {fmtInt(channel.users)} users
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-[#2389E3]" style={{ width: `${share}%` }} />
      </div>
    </div>
  );
}

const TrafficPanel = () => {
  const [report, setReport] = useState(null);
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  const fetchTraffic = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const res = await fetch(
        `${config.getApiBaseUrl()}/admin/analytics/traffic?days=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await res.json().catch(() => null);
      if (!body?.status) {
        throw new Error(
          body?.message ||
            (res.status === 503
              ? 'Google Analytics reporting is not connected yet.'
              : 'Failed to load traffic data')
        );
      }
      setReport(body.data);
      setError(null);
      setRefreshedAt(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load traffic data');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchTraffic();
  }, [fetchTraffic]);

  const channels = report?.channels || [];
  const pages = report?.pages || [];
  const maxSessions = channels.reduce((m, c) => Math.max(m, Number(c.sessions || 0)), 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Website traffic</h2>
          <span className="text-xs text-gray-400">Google Analytics · motokaapp.ng</span>
        </div>

        <div className="flex items-center gap-3">
          {refreshedAt && (
            <span className="text-xs text-gray-400">
              Updated {refreshedAt.toLocaleTimeString('en-GB')}
            </span>
          )}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {RANGES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  range === opt.value ? 'bg-[#2389E3] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={fetchTraffic}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !report && (
        <div className="mt-3 space-y-2">
          <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {report && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Sessions', value: report.totals?.sessions },
              { label: 'Users', value: report.totals?.users },
              { label: 'Page views', value: report.totals?.pageViews },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="text-lg font-semibold text-gray-900">{fmtInt(s.value)}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Where visitors come from
              </h3>
              {channels.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {channels.map((c) => (
                    <ChannelRow key={c.channel} channel={c} maxSessions={maxSessions} />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400">No channel data for this period.</p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Top pages
              </h3>
              {pages.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {pages.map((p) => (
                    <div key={p.path} className="flex items-baseline justify-between gap-3 py-2.5">
                      <span className="truncate text-sm font-medium text-gray-900" title={p.path}>
                        {p.path}
                      </span>
                      <span className="shrink-0 text-xs text-gray-500">
                        {fmtInt(p.pageViews)} views
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400">No page data for this period.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrafficPanel;
