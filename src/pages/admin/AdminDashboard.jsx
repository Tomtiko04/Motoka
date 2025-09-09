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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for recent orders and transactions
  const recentOrders = [
    { id: '#123567', type: 'License Renewal', amount: 'N50,000', status: 'New' },
    { id: '#123568', type: 'License Renewal', amount: 'N50,000', status: 'New' },
    { id: '#123569', type: 'License Renewal', amount: 'N50,000', status: 'New' },
    { id: '#123570', type: 'License Renewal', amount: 'N50,000', status: 'Done' },
    { id: '#123571', type: 'License Renewal', amount: 'N50,000', status: 'Done' },
    { id: '#123572', type: 'License Renewal', amount: 'N50,000', status: 'Declined' },
    { id: '#123573', type: 'License Renewal', amount: 'N50,000', status: 'Declined' },
    { id: '#123574', type: 'License Renewal', amount: 'N50,000', status: 'Declined' },
    { id: '#123575', type: 'License Renewal', amount: 'N50,000', status: 'Declined' },
  ];

  const recentTransactions = [
    { id: 'ABC-1234', type: 'License Renewal', date: '2025/01/15', amount: 'N150,000' },
    { id: 'ABC-1235', type: 'License Renewal', date: '2025/01/15', amount: 'N150,000' },
    { id: 'ABC-1236', type: 'License Renewal', date: '2025/01/15', amount: 'N150,000' },
    { id: 'ABC-1237', type: 'License Renewal', date: '2025/01/15', amount: 'N150,000' },
    { id: 'ABC-1238', type: 'License Renewal', date: '2025/01/15', amount: 'N150,000' },
  ];

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
      <div className="flex items-center">
        <DocumentTextIcon className="h-6 w-6 text-gray-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ₦{stats ? parseFloat(stats.total_payments).toLocaleString() : '0'}
              </p>
            </div>
            <ArrowUpIcon className="h-5 w-5 text-green-500" />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600">
                ₦{stats ? parseFloat(stats.pending_payments).toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm font-bold">⏳</span>
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
            {recentOrders.slice(0, 5).map((order, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id} {order.type}</p>
                  <p className="text-sm text-gray-600">{order.amount}</p>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            ))}
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
          {recentTransactions.map((transaction, index) => (
            <div key={index} className="flex items-center space-x-3 py-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{transaction.id} {transaction.type}</p>
                <p className="text-sm text-gray-600">{transaction.date}</p>
              </div>
              <p className="text-sm font-medium text-blue-600">{transaction.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
