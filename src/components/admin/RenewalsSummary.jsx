import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellAlertIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { listRenewals } from '../../services/apiAdminRenewals';

/**
 * Renewals at a glance.
 *
 * Deliberately leads with Expired: it is the biggest cohort and the one no
 * automated reminder ever revisits, so it is where the recoverable revenue sits.
 * Every tile links straight into the matching tab so this is a way in, not a
 * dead readout.
 */

// Single blue scale, matching the rest of the dashboard. Urgency is carried by the
// left-to-right order (most urgent first) and by depth of blue, not by a traffic-light
// palette — the counts are a summary, not an alarm.
const TILES = [
  { key: 'expired', label: 'Expired',     tone: 'text-[#1B4F8A]' },
  { key: 'today',   label: 'Due today',   tone: 'text-[#1B6DBD]' },
  { key: 'week',    label: 'Next 7 days', tone: 'text-[#2389E3]' },
  { key: 'month',   label: '8–30 days',   tone: 'text-[#4BA3EA]' },
  { key: 'quarter', label: '31–90 days',  tone: 'text-[#7CBEF1]' },
];

const RenewalsSummary = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // bucket=expired so `states` describes the expired cohort — the one the
    // "needs review" warning below is about.
    listRenewals({ bucket: 'expired', limit: 1 })
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  const counts = data?.counts;
  const states = data?.states;
  const needsReview = states?.needs_review ?? 0;
  const inProgress = states?.in_progress ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="h-5 w-5 text-gray-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Renewals</h2>
            <p className="text-xs text-gray-500">Most urgent first — click any number to see who</p>
          </div>
        </div>
        <Link to="/admin/renewals" className="text-xs font-medium text-blue-600 hover:underline">
          View call list →
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && !counts && <p className="text-sm text-gray-500">Loading…</p>}

      {counts && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TILES.map(t => (
              <Link
                key={t.key}
                to={`/admin/renewals?bucket=${t.key}`}
                className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
              >
                <p className="text-xs text-gray-500">{t.label}</p>
                <p className={`text-2xl font-bold ${t.tone}`}>{counts[t.key] ?? 0}</p>
              </Link>
            ))}
          </div>

          {(needsReview > 0 || inProgress > 0) && (
            <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-[#2389E3] shrink-0 mt-0.5" />
                <div className="text-xs text-[#12406F]">
                  {needsReview > 0 && (
                    <p>
                      <strong>{needsReview}</strong> expired {needsReview === 1 ? 'vehicle has' : 'vehicles have'} a
                      cancelled order despite a successful payment — a billing issue to resolve, not a sales call.
                    </p>
                  )}
                  {inProgress > 0 && (
                    <p className={needsReview > 0 ? 'mt-1' : ''}>
                      <strong>{inProgress}</strong> {inProgress === 1 ? 'has' : 'have'} a renewal already in
                      progress. Excluded from chasing.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RenewalsSummary;
