import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  TruckIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  UsersIcon,
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
  LineChart,
  Line,
} from 'recharts';
import config from '../../config/config';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [expiryReminderState, setExpiryReminderState] = useState('idle');
  const [expiryReminderResult, setExpiryReminderResult] = useState(null);
  const [addCarReminderState, setAddCarReminderState] = useState('idle');
  const [addCarReminderResult, setAddCarReminderResult] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      // All 4 fetches in parallel — stats, recent orders, transactions, full orders for chart
      const [statsRes, ordersRes, txRes, allOrdersRes] = await Promise.all([
        fetch(`${config.getApiBaseUrl()}/admin/dashboard/stats`, { headers }),
        fetch(`${config.getApiBaseUrl()}/admin/recent-orders`, { headers }),
        fetch(`${config.getApiBaseUrl()}/admin/recent-transactions`, { headers }),
        fetch(`${config.getApiBaseUrl()}/admin/orders?page=1&per_page=200`, { headers }),
      ]);

      const [statsData, ordersData, txData, allOrdersData] = await Promise.all([
        statsRes.json(), ordersRes.json(), txRes.json(), allOrdersRes.json(),
      ]);

      if (statsData.status) setStats(statsData.data);
      if (ordersData.status) setRecentOrders(ordersData.data);
      if (txData.status) setRecentTransactions(txData.data);

      const orders = allOrdersData.status
        ? (allOrdersData.data?.data || allOrdersData.data || [])
        : (ordersData.data || []);
      setAllOrders(orders);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
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
    const built = buildChartFromOrders(source, chartPeriod);
    if (built.length > 0) setChartData(built);
  }, [chartPeriod, allOrders, recentOrders]);

  // Helper function to format order status
  const formatOrderStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Done';
      case 'declined':
        return 'Declined';
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

  const handleTriggerExpiryReminders = async (dryRun = false) => {
    setExpiryReminderState('loading');
    setExpiryReminderResult(null);
    try {
      const token = localStorage.getItem('adminToken');
      const url = `${config.getApiBaseUrl()}/admin/notifications/expiry-reminders${dryRun ? '?dry_run=true' : ''}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed');
      setExpiryReminderResult({ success: true, data: json.data });
      setExpiryReminderState('done');
      toast.success(json.data?.message || 'Done');
    } catch (err) {
      setExpiryReminderResult({ success: false, error: err.message });
      setExpiryReminderState('error');
      toast.error(err.message || 'Request failed');
    }
  };

  const handleTriggerAddCarReminder = async (dryRun = false) => {
    setAddCarReminderState('loading');
    setAddCarReminderResult(null);
    try {
      const token = localStorage.getItem('adminToken');
      const url = `${config.getApiBaseUrl()}/admin/notifications/add-car-reminder${dryRun ? '?dry_run=true' : ''}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed');
      setAddCarReminderResult({ success: true, data: json.data });
      setAddCarReminderState('done');
      toast.success(json.data?.message || 'Done');
    } catch (err) {
      setAddCarReminderResult({ success: false, error: err.message });
      setAddCarReminderState('error');
      toast.error(err.message || 'Request failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'text-blue-600';
      case 'Done':
        return 'text-blue-600';
      case 'Declined':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center">
        <DocumentTextIcon className="h-6 w-6 text-gray-600 mr-2" />
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                ₦{stats ? parseFloat(stats.total_amount).toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCardIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats ? stats.total_orders.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats ? stats.total_users.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Cars */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cars</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats ? stats.total_cars.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Orders */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats ? stats.pending_orders.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm font-bold">!</span>
            </div>
          </div>
        </div> */}

        {/* In Progress Orders */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats ? stats.in_progress_orders.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">→</span>
            </div>
          </div>
        </div> */}

        {/* Completed Orders */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats ? stats.completed_orders.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">✓</span>
            </div>
          </div>
        </div> */}

        {/* Declined Orders */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Declined</p>
              <p className="text-2xl font-bold text-red-600">
                {stats ? stats.declined_orders.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm font-bold">✗</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* WhatsApp Communications */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-green-600" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.524 5.843L.057 23.272a.75.75 0 00.916.916l5.43-1.467A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.504-5.25-1.385l-.376-.214-3.892 1.052 1.053-3.892-.214-.376A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">WhatsApp Communications</p>
            <p className="text-xs text-gray-400">Trigger or preview WhatsApp messages to users</p>
          </div>
        </div>

        {/* Command list — add new commands here */}
        <div className="divide-y divide-gray-100">

          {/* ── Expiry Reminders ── */}
          <div className="px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Expiry Reminders</p>
                  <p className="text-xs text-gray-400 mt-0.5">Message users whose cars expire in 1, 7, 14, or 30 days.</p>
                  {expiryReminderResult && (
                    <div className={`mt-2 rounded-md px-3 py-2 text-xs ${expiryReminderResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {expiryReminderResult.success ? (
                        <>
                          <p className="font-medium">{expiryReminderResult.data?.message}</p>
                          {expiryReminderResult.data?.windows?.map(w => (
                            <p key={w.days}>{w.days}d window: {w.count} car(s)</p>
                          ))}
                        </>
                      ) : (
                        <p>{expiryReminderResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:ml-4">
                <button
                  onClick={() => handleTriggerExpiryReminders(true)}
                  disabled={expiryReminderState === 'loading'}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {expiryReminderState === 'loading' ? 'Checking…' : 'Dry Run'}
                </button>
                <button
                  onClick={() => handleTriggerExpiryReminders(false)}
                  disabled={expiryReminderState === 'loading'}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {expiryReminderState === 'loading' ? 'Sending…' : 'Send Now'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Add Car Reminder ── */}
          <div className="px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Add Car Reminder</p>
                  <p className="text-xs text-gray-400 mt-0.5">Nudge users who haven't added a vehicle to their account yet.</p>
                  {addCarReminderResult && (
                    <div className={`mt-2 rounded-md px-3 py-2 text-xs ${addCarReminderResult.success ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      {addCarReminderResult.success ? (
                        <p className="font-medium">{addCarReminderResult.data?.message}</p>
                      ) : (
                        <p>{addCarReminderResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:ml-4">
                <button
                  onClick={() => handleTriggerAddCarReminder(true)}
                  disabled={addCarReminderState === 'loading'}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {addCarReminderState === 'loading' ? 'Checking…' : 'Dry Run'}
                </button>
                <button
                  onClick={() => handleTriggerAddCarReminder(false)}
                  disabled={addCarReminderState === 'loading'}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {addCarReminderState === 'loading' ? 'Sending…' : 'Send Now'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Chart and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
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
                <Bar yAxisId="amount" dataKey="amount" name="Revenue" fill="#2284DB" radius={[4, 4, 0, 0]} />
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <a href="/admin/orders" className="text-blue-600 text-sm font-medium">See More</a>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/admin/orders/${order.slug}`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.id} {formatOrderType(order.order_type)}
                    </p>
                    <p className="text-sm text-gray-600">₦{parseFloat(order.amount).toLocaleString()}</p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(formatOrderStatus(order.status))}`}>
                    {formatOrderStatus(order.status)}
                  </span>
                </div>
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transaction</h3>
          <a href="/admin/payments" className="text-blue-600 text-sm font-medium">See More</a>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => window.location.href = '/admin/payments'}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.gateway_reference || transaction.id} {formatOrderType(transaction.payment_type || 'Payment')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <p className="text-sm font-medium text-blue-600">
                  ₦{parseFloat(transaction.amount).toLocaleString()}
                </p>
              </div>
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
