import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, BoltIcon } from '@heroicons/react/24/outline';
import config from '../../config/config';
import { StatusBadge } from './ui';

/**
 * Payment gateway health — surfaces GET /admin/gateways/health and
 * GET /admin/metrics/payments as a compact status strip.
 *
 * One row per gateway. When the backend's health monitor isn't running
 * (0 checks, stale readings) the strip says "no live data" in neutral grey
 * instead of screaming red about a gateway that's merely unmeasured —
 * red is reserved for a gateway the monitor has actually seen fail.
 */

const REFRESH_MS = 30000; // matches the backend health monitor's check interval

const STATUS_DOT = {
  healthy: 'bg-green-500',
  degraded: 'bg-amber-500',
  unhealthy: 'bg-red-500',
  unknown: 'bg-gray-300',
};

const BREAKER_TONE = {
  closed: 'green',
  half_open: 'amber',
  'half-open': 'amber',
  open: 'red',
};

function timeAgo(iso) {
  if (!iso) return 'never';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(secs)) return 'never';
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

function GatewayRow({ name, data, isPrimary, isFallback, hasLiveData }) {
  const status = hasLiveData ? data?.status || 'unknown' : 'unknown';
  const breakerState = data?.circuitBreaker?.state || 'closed';
  const measuredDown = hasLiveData && (!data?.available || status === 'unhealthy');

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[status] || STATUS_DOT.unknown}`} />
        <span className="text-sm font-medium capitalize text-gray-900">{name}</span>
        {isPrimary && (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
            Primary
          </span>
        )}
        {isFallback && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            Fallback
          </span>
        )}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {hasLiveData ? (
          <>
            <span>
              {Number(data?.successRate ?? 0).toFixed(1)}% ok ·{' '}
              {Math.round(Number(data?.averageResponseTime ?? 0))}ms · checked {timeAgo(data?.lastCheck)}
            </span>
            {measuredDown && (
              <span className="font-medium text-red-700">not accepting traffic</span>
            )}
            {data?.consecutiveFailures > 0 && (
              <span className="font-medium text-red-700">
                {data.consecutiveFailures} consecutive failure{data.consecutiveFailures === 1 ? '' : 's'}
              </span>
            )}
          </>
        ) : (
          <span>no live data</span>
        )}
        <StatusBadge tone={BREAKER_TONE[breakerState] || 'gray'}>
          breaker {String(breakerState).replace('_', ' ')}
          {data?.circuitBreaker?.failureCount > 0 &&
            ` · ${data.circuitBreaker.failureCount}/${data.circuitBreaker.threshold}`}
        </StatusBadge>
      </div>
    </div>
  );
}

const GatewayHealthPanel = () => {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  const fetchHealth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [healthRes, metricsRes] = await Promise.allSettled([
        fetch(`${config.getApiBaseUrl()}/admin/gateways/health`, { headers }).then((r) => r.json()),
        fetch(`${config.getApiBaseUrl()}/admin/metrics/payments`, { headers }).then((r) => r.json()),
      ]);

      const healthData = healthRes.status === 'fulfilled' ? healthRes.value : null;
      if (!healthData?.status) throw new Error(healthData?.message || 'Failed to load gateway health');

      setHealth(healthData.data);
      if (metricsRes.status === 'fulfilled' && metricsRes.value?.status) {
        setMetrics(metricsRes.value.data);
      }
      setError(null);
      setRefreshedAt(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load gateway health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchHealth]);

  const gateways = health?.gateways ? Object.entries(health.gateways) : [];
  const monitorRunning = Boolean(health?.statistics?.healthMonitor?.isRunning);
  // Only trust (and alarm on) readings the monitor is actively producing.
  const hasLiveData = (g) => monitorRunning && Number(g?.totalChecks ?? 0) > 0;
  const anyDown = gateways.some(([, g]) => hasLiveData(g) && (!g.available || g.status !== 'healthy'));
  const anyLive = gateways.some(([, g]) => hasLiveData(g));

  const txTotal = Number(metrics?.transactions?.total ?? 0);
  const alerts =
    Number(metrics?.webhooks?.signatureFailed ?? 0) > 0 ||
    Number(metrics?.amountValidation?.mismatches ?? 0) > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Payment gateways</h2>
          {!loading && !error && (
            <StatusBadge tone={anyDown ? 'red' : anyLive ? 'green' : 'gray'}>
              {anyDown ? 'Attention needed' : anyLive ? 'All healthy' : 'No live data'}
            </StatusBadge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {refreshedAt && (
            <span className="text-xs text-gray-400">
              Updated {refreshedAt.toLocaleTimeString('en-GB')}
            </span>
          )}
          <button
            type="button"
            onClick={fetchHealth}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !health && (
        <div className="mt-3 space-y-2">
          <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {health && (
        <>
          <div className="mt-2 divide-y divide-gray-100">
            {gateways.map(([name, data]) => (
              <GatewayRow
                key={name}
                name={name}
                data={data}
                isPrimary={health.primary === name}
                isFallback={health.fallback === name}
                hasLiveData={hasLiveData(data)}
              />
            ))}
          </div>

          {!anyLive && (
            <p className="mt-1 text-xs text-gray-400">
              The health monitor isn't reporting from this instance — statuses show the last known
              configuration, not live probes.
            </p>
          )}

          {(txTotal > 0 || alerts) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span className="font-medium text-gray-700">Activity since restart:</span>
              <span>{txTotal} attempted</span>
              <span className="text-green-700">{metrics.transactions?.successful ?? 0} ok</span>
              <span className={Number(metrics.transactions?.failed ?? 0) > 0 ? 'text-red-700' : ''}>
                {metrics.transactions?.failed ?? 0} failed
              </span>
              <span>{Number(metrics.calculated?.successRate ?? 0).toFixed(1)}% success</span>
              {Number(metrics?.webhooks?.signatureFailed ?? 0) > 0 && (
                <span className="font-medium text-red-700">
                  {metrics.webhooks.signatureFailed} webhook signature failure(s)
                </span>
              )}
              {Number(metrics?.amountValidation?.mismatches ?? 0) > 0 && (
                <span className="font-medium text-red-700">
                  {metrics.amountValidation.mismatches} amount mismatch(es)
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GatewayHealthPanel;
