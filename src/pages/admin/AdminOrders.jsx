import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';
import PaymentModal from '../../components/admin/PaymentModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    order: null,
    agent: null
  });

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchOrders();
  }, [activeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        status: activeFilter === 'All' ? 'all' : activeFilter.toLowerCase().replace(' ', '_'),
      });

      const url = `${config.getApiBaseUrl()}/admin/orders?${params}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status) {
        setOrders(data.data.data || []);
      } else {
        // toast.error('Failed to fetch orders');
      }
    } catch (error) {
      // toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Transform orders data to match Figma design
  const transformedOrders = orders.map(order => ({
    id: `#${order.slug?.substring(0, 8) || order.id}`,
    name: order.user?.name || 'Unknown User',
    purpose: order.order_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Service',
    amount: `N${parseFloat(order.amount || 0).toLocaleString()}`,
    location: order.state_name ? `${order.state_name}${order.lga_name ? ', ' + order.lga_name : ''}` : 'Unknown',
    status: order.status === 'pending' ? 'New' : 
            order.status === 'in_progress' ? 'Inprogress' : 
            order.status === 'completed' ? 'Completed' : 
            order.status === 'declined' ? 'Declined' : 'New',
    originalOrder: order
  }));

  const filters = ['All', 'New', 'In Progress', 'Completed', 'Declined'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'text-blue-600';
      case 'Completed':
        return 'text-green-600';
      case 'Inprogress':
        return 'text-orange-600';
      case 'Declined':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleProcessOrder = async (order) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${order.originalOrder.slug}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        // Show payment modal with order and agent details
        setPaymentModal({
          isOpen: true,
          order: data.data.order,
          agent: data.data.agent
        });
      } else {
        toast.error(data.message || 'Failed to process order');
      }
    } catch (error) {
      toast.error('Failed to process order. Please try again.');
    }
  };

  const handlePaymentInitiated = (paymentData) => {
    // Refresh orders after payment is initiated
    fetchOrders();
    setPaymentModal({
      isOpen: false,
      order: null,
      agent: null
    });
  };

  const handleClosePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      order: null,
      agent: null
    });
  };

  const getActionButton = (status) => {
    switch (status) {
      case 'New':
        return { text: 'Process Order', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'Inprogress':
        return { text: 'Check Order', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'Completed':
        return { text: 'Process Order', color: 'bg-blue-300 cursor-not-allowed' };
      case 'Declined':
        return { text: 'Process Order', color: 'bg-blue-600 hover:bg-blue-700' };
      default:
        return { text: 'Process Order', color: 'bg-blue-600 hover:bg-blue-700' };
    }
  };

  const filteredOrders = transformedOrders.filter(order => {
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">Loading orders...</p>
          <p className="text-xs text-gray-500">Check browser console for debug info</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center">
          <ClipboardDocumentListIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        </div>
        {/* <div className="text-sm text-gray-500">
          {orders.length} orders found
        </div> */}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter === 'All' ? 'All Orders' : filter}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider underline">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order, index) => {
                const actionButton = getActionButton(order.status);
                return (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if clicking on the action button
                      if (!e.target.closest('button')) {
                        window.location.href = `/admin/orders/${order.originalOrder.slug}`;
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="text-blue-600 hover:text-blue-800 hover:underline">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{order.purpose}</span>
                        {order.originalOrder?.notes?.includes('Bulk payment') && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Bulk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleProcessOrder(order);
                        }}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${actionButton.color}`}
                        disabled={order.status === 'Completed'}
                      >
                        {actionButton.text}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {searchTerm || activeFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No orders have been placed yet.'
            }
          </p>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={handleClosePaymentModal}
        order={paymentModal.order}
        agent={paymentModal.agent}
        onPaymentInitiated={handlePaymentInitiated}
      />
    </div>
  );
};

export default AdminOrders;