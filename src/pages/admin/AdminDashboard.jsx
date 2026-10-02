import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarDaysIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import config from '../../config/config';
import GatewayHealthPanel from '../../components/admin/GatewayHealthPanel';
import RenewalsSummary from '../../components/admin/RenewalsSummary';
import { PageHeader, StatCard, StatusBadge } from '../../components/admin/ui';

const formatNaira = (value) =>
  `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsReady, setStatsReady] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [guestPaidOrders, setGuestPaidOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('monthly');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const safeJson = async (res) => {
      try { return await res.json(); } catch { return null; }
    };

    const statsPromise = fetch(`${config.getApiBaseUrl()}/admin/dashboard/stats`, { headers })
      .then(safeJson)
      .then((statsData) => {
        if (statsData?.status) setStats(statsData.data);
        setStatsReady(true);
        return statsData;
      })
      .catch(() => {
        setStatsReady(true);
        return null;
      });

    const [statsData, ordersResult, txResult, allOrdersResult, guestResult] = await Promise.all([
      statsPromise,
      fetch(`${config.getApiBaseUrl()}/admin/recent-orders`, { headers }).then(safeJson).catch(() => null),
      fetch(`${config.getApiBaseUrl()}/admin/recent-transactions`, { headers }).then(safeJson).catch(() => null),
      fetch(`${config.getApiBaseUrl()}/admin/orders?page=1&per_page=200`, { headers }).then(safeJson).catch(() => null),
      fetch(`${config.getApiBaseUrl()}/admin/guest-orders?page=1&limit=100&status=payment_success`, { headers }).then(safeJson).catch(() => null),
    ]);

    if (ordersResult?.status) setRecentOrders(ordersResult.data);
    if (txResult?.status) setRecentTransactions(txResult.data);

    const orders = allOrdersResult?.status
      ? (allOrdersResult.data?.data || allOrdersResult.data || [])
      : (ordersResult?.data || []);
    setAllOrders(orders);

    // Paid guest renewals feed the revenue chart alongside user orders.
    // Guest amounts are stored in kobo; normalise to naira here.
    const guestOrders = (guestResult?.data?.orders || []).map((o) => ({
      created_at: o.created_at,
      amount: Number(o.total_amount || 0) / 100,
      status: 'completed',
    }));
    setGuestPaidOrders(guestOrders);

    const allFailed = !statsData && !ordersResult && !txResult && !allOrdersResult;
    if (allFailed) toast.error('Failed to fetch dashboard data');
  };

  const buildChartFromOrders = (orders, period) => {
    if (!orders || orders.length === 0) return [];

    // Exclude declined/cancelled orders
    const valid = orders.filter(
      (o) => !['declined', 'cancelled'].includes(o.status?.toLowerCase())
    );

    const buckets = {};
    valid.forEach((order) => {
      const date = new Date(order.created_at);
      if (isNaN(date)) return;
      let key;
      if (period === 'daily') {
        key = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      } else {
        key = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      }
      if (!buckets[key]) buckets[key] = { label: key, amount: 0, orders: 0, _date: date };
      buckets[key].amount += parseFloat(order.amount || 0);
      buckets[key].orders += 1;
    });

    return Object.values(buckets)
      .sort((a, b) => a._date - b._date)
      .map(({ label, amount, orders }) => ({ label, amount, orders }));
  };

  // Re-bucket whenever orders data or period changes — no extra fetch needed
  useEffect(() => {
    const source = allOrders.length > 0 ? allOrders : recentOrders;
    const built = buildChartFromOrders([...source, ...guestPaidOrders], chartPeriod);
    if (built.length > 0) setChartData(built);
  }, [chartPeriod, allOrders, recentOrders, guestPaidOrders]);

  // Helper function to format order status. Accepts canonical DB values
  // (pending|processing|completed|cancelled) and legacy aliases for
  // transitional safety.
  const formatOrderStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'New';
      case 'processing':
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Done';
      case 'cancelled':
      case 'declined':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Helper function to format order type
  const formatOrderType = (orderType) => {
    switch (orderType) {
      case 'car_renewal':
        return 'Car Renewal';
      case 'driver_license':
        return 'Driver License';
      default:
        return orderType;
    }
  };

  const STATUS_TONE = {
    'New': 'blue',
    'In Progress': 'amber',
    'Done': 'green',
    'Cancelled': 'gray',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HomeIcon}
        title="Dashboard"
        subtitle="Revenue, orders, and renewals at a glance"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          icon={CreditCardIcon}
          label="Total Revenue"
          value={formatNaira(stats?.total_amount)}
          hint={
            Number(stats?.guest_revenue) > 0
              ? `incl. ${formatNaira(stats.guest_revenue)} from guest renewals`
              : null
          }
          color="green"
          loading={!statsReady}
        />
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Total Orders"
          value={stats ? Number(stats.total_orders).toLocaleString() : '0'}
          hint={
            Number(stats?.guest_paid_orders) > 0
              ? `incl. ${Number(stats.guest_paid_orders).toLocaleString()} guest`
              : null
          }
          loading={!statsReady}
        />
        <StatCard
          icon={UsersIcon}
          label="Total Users"
          value={stats ? Number(stats.total_users).toLocaleString() : '0'}
          loading={!statsReady}
        />
        <StatCard
          icon={TruckIcon}
          label="Total Cars"
          value={stats ? Number(stats.total_cars).toLocaleString() : '0'}
          loading={!statsReady}
        />
        <Link
          to={
            stats?.expired_month
              ? `/admin/renewals?bucket=expired&month=${stats.expired_month}`
              : '/admin/renewals?bucket=expired'
          }
          className="block rounded-xl transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <StatCard
            icon={CalendarDaysIcon}
            label="Expired this month"
            value={stats ? Number(stats.expired_cars_this_month || 0).toLocaleString() : '0'}
            hint="View call list"
            color="amber"
            loading={!statsReady}
            className="h-full"
          />
        </Link>
      </div>

      {/* Renewals — who is expiring and who is already paid up */}
      <RenewalsSummary />

      {/* Payment gateway health — live ops signal during payment incidents */}
      <GatewayHealthPanel />

      {/* Chart and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue & Orders</h3>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { value: 'daily',     label: 'Daily' },
                { value: 'monthly',   label: 'Monthly' },
                { value: 'all_time',  label: 'All Time' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChartPeriod(opt.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    chartPeriod === opt.value ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="amount"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'Revenue' ? `₦${Number(value).toLocaleString()}` : value
                  }
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Bar yAxisId="amount" dataKey="amount" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="orders" dataKey="orders" name="Orders" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-gray-400">No chart data available</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-blue-600 text-sm font-medium hover:text-blue-700">See More</Link>
          </div>
          <div className="space-y-1">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order, index) => (
                <Link
                  key={index}
                  to={`/admin/orders/${order.slug}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.id} {formatOrderType(order.order_type)}
                    </p>
                    <p className="text-sm text-gray-500">{formatNaira(order.amount)}</p>
                  </div>
                  <StatusBadge tone={STATUS_TONE[formatOrderStatus(order.status)] || 'gray'}>
                    {formatOrderStatus(order.status)}
                  </StatusBadge>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link to="/admin/payments" className="text-blue-600 text-sm font-medium hover:text-blue-700">See More</Link>
        </div>
        <div className="space-y-1">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <Link
                key={index}
                to="/admin/payments"
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {transaction.gateway_reference || transaction.id} {formatOrderType(transaction.payment_type || 'Payment')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-gray-900">
                  {formatNaira(transaction.amount)}
                </p>
              </Link>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
