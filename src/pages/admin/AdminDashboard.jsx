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
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      const [statsResponse, ordersResponse, transactionsResponse] = await Promise.all([
        fetch(`${config.getApiBaseUrl()}/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`${config.getApiBaseUrl()}/admin/recent-orders`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`${config.getApiBaseUrl()}/admin/recent-transactions`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      ]);

      const [statsData, ordersData, transactionsData] = await Promise.all([
        statsResponse.json(),
        ordersResponse.json(),
        transactionsResponse.json(),
      ]);

      if (statsData.status) setStats(statsData.data);
      if (ordersData.status) setRecentOrders(ordersData.data);
      if (transactionsData.status) setRecentTransactions(transactionsData.data);
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

  useEffect(() => {
    // Immediately render from already-fetched recentOrders
    const quick = buildChartFromOrders(recentOrders, chartPeriod);
    if (quick.length > 0) setChartData(quick);

    // Then try to fetch full orders history
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const params = new URLSearchParams({ page: 1, per_page: 500 });
        const res = await fetch(
          `${config.getApiBaseUrl()}/admin/orders?${params}`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        const data = await res.json();
        if (!cancelled && data.status) {
          const allOrders = data.data?.data || data.data || [];
          const built = buildChartFromOrders(allOrders, chartPeriod);
          if (built.length > 0) setChartData(built);
        }
      } catch {
        // keep the quick data
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartPeriod, recentOrders]);

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
              <p className="text-2xl font-bold text-green-600">
                {stats ? stats.total_orders.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats ? stats.total_users.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Cars */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cars</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats ? stats.total_cars.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-orange-600" />
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
