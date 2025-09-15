import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  TruckIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import config from '../../config/config';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch all dashboard data in parallel
      const [statsResponse, ordersResponse, transactionsResponse] = await Promise.all([
        fetch(`${config.getApiBaseUrl()}/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${config.getApiBaseUrl()}/admin/recent-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${config.getApiBaseUrl()}/admin/recent-transactions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      const [statsData, ordersData, transactionsData] = await Promise.all([
        statsResponse.json(),
        ordersResponse.json(),
        transactionsResponse.json()
      ]);

      if (statsData.status) {
        setStats(statsData.data);
      }
      
      if (ordersData.status) {
        setRecentOrders(ordersData.data);
      }
      
      if (transactionsData.status) {
        setRecentTransactions(transactionsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return 'text-green-600';
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        {/* Total Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ₦{stats ? parseFloat(stats.total_amount).toLocaleString() : '0'}
              </p>
            </div>
            <ArrowUpIcon className="h-5 w-5 text-green-500" />
          </div>
        </div>

        {/* Completed Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₦{stats ? parseFloat(stats.completed_amount).toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-600">
                ₦{stats ? parseFloat(stats.pending_amount).toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm font-bold">⏳</span>
            </div>
          </div>
        </div>

        {/* Declined Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Declined Amount</p>
              <p className="text-2xl font-bold text-red-600">
                ₦{stats ? parseFloat(stats.declined_amount).toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm font-bold">✗</span>
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
            <ArrowUpIcon className="h-5 w-5 text-green-500" />
          </div>
        </div>

        {/* Total Agents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats ? stats.total_agents.toLocaleString() : '0'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">+</span>
              </div>
              <ArrowDownIcon className="h-5 w-5 text-red-500" />
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
            <ArrowDownIcon className="h-5 w-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
        </div>

        {/* In Progress Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {stats ? stats.completed_orders.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
          </div>
        </div>

        {/* Declined Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
        </div>
      </div>

      {/* Chart and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Data</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md">Monthly</button>
              <button className="px-3 py-1 text-gray-600 text-sm rounded-md">Daily</button>
            </div>
          </div>
          
          {/* Mock Chart */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </div>
              <p className="text-gray-600">Chart visualization would go here</p>
            </div>
          </div>
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
                <div key={index} className="flex items-center justify-between py-2">
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
          <a href="/admin/transactions" className="text-blue-600 text-sm font-medium">See More</a>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center space-x-3 py-2">
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
