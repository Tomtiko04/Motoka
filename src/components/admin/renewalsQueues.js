export const RENEWAL_QUEUES = [
  { key: 'expired', label: 'Expired', hint: 'Already lapsed' },
  { key: 'today', label: 'Due today', hint: 'Call today' },
  { key: 'week', label: 'Next 7 days', hint: 'This week' },
  { key: 'month', label: '8–30 days', hint: 'Coming up' },
  { key: 'quarter', label: '31–90 days', hint: 'Later' },
];

export function monthTitle(key) {
  if (!key) return '';
  const [year, month] = String(key).split('-').map(Number);
  if (!year || !month) return key;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
