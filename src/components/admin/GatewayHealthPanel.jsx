import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, BoltIcon } from '@heroicons/react/24/outline';
import config from '../../config/config';

/**
 * Payment gateway health — surfaces GET /admin/gateways/health and
 * GET /admin/metrics/payments, which the backend has always exposed but no
 * admin screen ever rendered.
 *
 * Answers the question ops actually has during a payment incident: is a gateway
 * down, has its circuit breaker tripped, and are we currently failing over?
 */

const REFRESH_MS = 30000; // matches the backend health monitor's check interval

const STATUS_STYLES = {
  healthy:  { dot: 'bg-green-500',  text: 'text-green-700',  chip: 'bg-green-50 border-green-200' },
  degraded: { dot: 'bg-yellow-500', text: 'text-yellow-700', chip: 'bg-yellow-50 border-yellow-200' },
  unhealthy:{ dot: 'bg-red-500',    text: 'text-red-700',    chip: 'bg-red-50 border-red-200' },
  unknown:  { dot: 'bg-gray-400',   text: 'text-gray-600',   chip: 'bg-gray-50 border-gray-200' },
};

const BREAKER_STYLES = {
  closed:    'bg-green-100 text-green-800',
  half_open: 'bg-yellow-100 text-yellow-800',
  'half-open': 'bg-yellow-100 text-yellow-800',
  open:      'bg-red-100 text-red-800',
};

function timeAgo(iso) {
  if (!iso) return 'never';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(secs)) return 'never';
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

function GatewayCard({ name, data, isPrimary, isFallback }) {
  const style = STATUS_STYLES[data?.status] || STATUS_STYLES.unknown;
  const breakerState = data?.circuitBreaker?.state || 'closed';
  const breakerStyle = BREAKER_STYLES[breakerState] || BREAKER_STYLES.closed;
  const successRate = Number(data?.successRate ?? 0);

  return (
    <div className={`rounded-lg border p-4 ${style.chip}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
          <span className="font-semibold text-gray-900 capitalize truncate">{name}</span>
          {isPrimary && (
            <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
              Primary
            </span>
          )}
          {isFallback && (
            <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 shrink-0">
              Fallback
            </span>
          )}
        </div>
        <span className={`text-xs font-medium ${style.text} capitalize shrink-0`}>
          {data?.status || 'unknown'}
        </span>
      </div>

      {!data?.available && (
        <p className="mt-2 text-xs font-medium text-red-700">
          Not accepting traffic — payments are routing elsewhere.
        </p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-gray-500">Success rate</dt>
          <dd className="font-semibold text-gray-900">{successRate.toFixed(1)}%</dd>
        </div>
        <div>
          <dt className="text-gray-500">Checks</dt>
          <dd className="font-semibold text-gray-900">
            {data?.successCount ?? 0}/{data?.totalChecks ?? 0}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Avg response</dt>
          <dd className="font-semibold text-gray-900">
            {Math.round(Number(data?.averageResponseTime ?? 0))}ms
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Last check</dt>
          <dd className="font-semibold text-gray-900">{timeAgo(data?.lastCheck)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/5 pt-2">
        <span className="text-xs text-gray-500">Circuit breaker</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${breakerStyle}`}>
          {String(breakerState).replace('_', ' ')}
          {data?.circuitBreaker?.failureCount > 0 &&
            ` · ${data.circuitBreaker.failureCount}/${data.circuitBreaker.threshold}`}
        </span>
      </div>

      {data?.consecutiveFailures > 0 && (
        <p className="mt-2 text-xs text-red-700">
          {data.consecutiveFailures} consecutive failure{data.consecutiveFailures === 1 ? '' : 's'}
          {data?.lastFailure ? ` · last ${timeAgo(data.lastFailure)}` : ''}
        </p>
      )}
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
  const anyDown = gateways.some(([, g]) => !g.available || g.status !== 'healthy');
  const monitorRunning = health?.statistics?.healthMonitor?.isRunning;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Payment Gateways</h2>
          {!loading && !error && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                anyDown ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {anyDown ? 'Attention needed' : 'All healthy'}
            </span>
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !health && <p className="text-sm text-gray-500">Loading gateway health…</p>}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {health && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gateways.map(([name, data]) => (
              <GatewayCard
                key={name}
                name={name}
                data={data}
                isPrimary={health.primary === name}
                isFallback={health.fallback === name}
              />
            ))}
          </div>

          {monitorRunning === false && (
            <p className="mt-3 text-xs text-red-700">
              Health monitor is not running — the readings above are stale.
            </p>
          )}

          {metrics && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-900">Payment activity</h3>
                {/* These counters live in the API process's memory, so they zero out on
                    every deploy/restart and reflect one instance only. Labelled so the
                    numbers are never mistaken for all-time totals — Payments is the
                    source of truth for those. */}
                <span className="text-xs text-gray-400">since last API restart · this instance</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">Attempted</dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {metrics.transactions?.total ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Successful</dt>
                  <dd className="text-lg font-bold text-green-600">
                    {metrics.transactions?.successful ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Failed</dt>
                  <dd className="text-lg font-bold text-red-600">
                    {metrics.transactions?.failed ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Success rate</dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {Number(metrics.calculated?.successRate ?? 0).toFixed(1)}%
                  </dd>
                </div>
              </dl>

              {(metrics.webhooks?.signatureFailed > 0 || metrics.amountValidation?.mismatches > 0) && (
                <p className="mt-3 text-xs text-red-700">
                  {metrics.webhooks?.signatureFailed > 0 &&
                    `${metrics.webhooks.signatureFailed} webhook signature failure(s). `}
                  {metrics.amountValidation?.mismatches > 0 &&
                    `${metrics.amountValidation.mismatches} amount mismatch(es).`}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GatewayHealthPanel;
