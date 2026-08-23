import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export function Pulse({ className, style }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />;
}

export function MetricNumber({ loading, value, className = 'text-3xl font-bold tabular-nums text-gray-900' }) {
  if (loading) return <Pulse className="mt-1 h-9 w-16" />;
  return <p className={className}>{Number(value || 0).toLocaleString()}</p>;
}

export function ExpiredMonthChart({
  data = [],
  selected,
  onSelect,
  loading = false,
  height = 176,
}) {
  if (loading) {
    return (
      <div className="flex h-44 items-end gap-2 px-1">
        {[48, 72, 36, 88, 56, 64, 40, 80].map((h, i) => (
          <Pulse key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No expired licences in the last 12 months.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          width={28}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: '#f3f4f6' }}
          formatter={(value) => [Number(value).toLocaleString(), 'Expired']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          cursor={onSelect ? 'pointer' : 'default'}
          onClick={(item) => {
            if (!onSelect) return;
            const key = item?.payload?.month || item?.month;
            if (!key) return;
            onSelect(selected === key ? '' : key);
          }}
        >
          {data.map((m) => (
            <Cell
              key={m.month}
              fill={selected === m.month ? '#1D4ED8' : '#2284DB'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function QueueCard({
  label,
  hint,
  count,
  loading,
  active,
  onClick,
  as: Tag = 'button',
  ...rest
}) {
  const className = `rounded-lg border p-4 text-left transition-colors ${
    active
      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
      : 'border-gray-100 bg-white hover:bg-gray-50'
  }`;

  const body = (
    <>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <MetricNumber
        loading={loading}
        value={count}
        className={`mt-1 text-2xl font-bold tabular-nums ${active ? 'text-blue-700' : 'text-gray-900'}`}
      />
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </>
  );

  if (Tag === 'button') {
    return (
      <button type="button" onClick={onClick} className={className} {...rest}>
        {body}
      </button>
    );
  }

  return (
    <Tag onClick={onClick} className={`block ${className}`} {...rest}>
      {body}
    </Tag>
  );
}
