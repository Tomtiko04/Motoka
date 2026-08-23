import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { getRenewalsSummary } from '../../services/apiAdminRenewals';
import {
  MetricNumber,
  ExpiredMonthChart,
  QueueCard,
} from './renewalsMetrics';
import { RENEWAL_QUEUES, monthTitle } from './renewalsQueues';

/**
 * Dashboard renewals block: hero counts, queue metrics, month trend.
 * Hits /admin/renewals/summary only — never the call list.
 */

const RenewalsSummary = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRenewalsSummary()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const counts = data?.counts || {};
  const byMonth = data?.by_month || [];
  const thisMonthLabel = monthTitle(data?.expired_month) || 'This month';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="h-5 w-5 text-gray-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Licence renewals</h2>
            <p className="text-xs text-gray-500">Overdue papers and who to call next</p>
          </div>
        </div>
        <Link to="/admin/renewals?bucket=expired" className="text-xs font-medium text-blue-600 hover:underline">
          Open call list
        </Link>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600">
          Couldn’t load renewals. The rest of the dashboard is unaffected.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/admin/renewals?bucket=expired"
          className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Overdue</p>
          <MetricNumber loading={loading && !error} value={data?.expired_total} />
          <p className="mt-1 text-xs text-gray-500">Licences already expired</p>
        </Link>
        <Link
          to={
            data?.expired_month
              ? `/admin/renewals?bucket=expired&month=${data.expired_month}`
              : '/admin/renewals?bucket=expired'
          }
          className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Lapsed this month</p>
          <MetricNumber loading={loading && !error} value={data?.expired_this_month} />
          <p className="mt-1 text-xs text-gray-500">{loading ? 'Calendar month' : thisMonthLabel}</p>
        </Link>
      </div>

      <p className="mt-6 mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Call queue</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {RENEWAL_QUEUES.map((q) => (
          <QueueCard
            key={q.key}
            as={Link}
            to={`/admin/renewals?bucket=${q.key}`}
            label={q.label}
            hint={q.hint}
            count={counts[q.key]}
            loading={loading && !error}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Expired by month
        </p>
        <ExpiredMonthChart
          data={byMonth}
          loading={loading && !error}
          onSelect={(month) => {
            navigate(
              month
                ? `/admin/renewals?bucket=expired&month=${month}`
                : '/admin/renewals?bucket=expired'
            );
          }}
        />
      </div>
    </div>
  );
};

export default RenewalsSummary;
