import React from 'react';

/**
 * Motoka admin design system — the single source of truth for admin chrome.
 *
 * Tokens:
 *  - Primary action: blue-600 (hover blue-700). Never hex blues, indigo, or purple.
 *  - Success: green. Warning: amber. Danger: red. Never emerald/yellow/orange.
 *  - Icons: @heroicons/react/24/outline only.
 *  - Cards: white, rounded-xl, border-gray-100, shadow-sm.
 *  - Badges: rounded-full pills.
 * Every admin page should compose these instead of hand-rolling chrome.
 */

// ── Class recipes (for elements that stay inline, e.g. <button>, <input>) ────

export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

export const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

export const BTN_DANGER =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

export const INPUT =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none';

export const TH =
  'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider';

export const TD = 'px-4 py-3 text-sm';

export const CARD = 'bg-white rounded-xl border border-gray-100 shadow-sm';

// ── Components ───────────────────────────────────────────────────────────────

/** Standard page header: icon tile + title + subtitle on the left, actions on the right. */
export function PageHeader({ icon: Icon, title, subtitle, actions, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2">{actions || children}</div>
      )}
    </div>
  );
}

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`${CARD} ${className}`} {...rest}>
      {children}
    </div>
  );
}

const STAT_TILE = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
};

/**
 * KPI card. Numbers are gray-900 so colour is reserved for meaning;
 * `hint` is a small line under the value (e.g. a breakdown or delta).
 */
export function StatCard({ icon: Icon, label, value, hint, color = 'blue', loading = false, className = '' }) {
  return (
    <div className={`${CARD} p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 break-words">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${STAT_TILE[color] || STAT_TILE.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

const BADGE_TONES = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-600',
};

export function StatusBadge({ tone = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONES[tone] || BADGE_TONES.gray} ${className}`}
    >
      {children}
    </span>
  );
}

const SPINNER_SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-gray-200 border-t-blue-600 ${SPINNER_SIZES[size] || SPINNER_SIZES.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Full-area loading treatment for list/detail pages. */
export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action, className = '' }) {
  return (
    <div className={`py-12 text-center ${className}`}>
      {Icon && <Icon className="mx-auto mb-3 h-12 w-12 text-gray-300" />}
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
