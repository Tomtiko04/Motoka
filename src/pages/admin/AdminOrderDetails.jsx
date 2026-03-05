import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';

const AdminOrderDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [slug]);

  // Filter agents by order location
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${slug}?v=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status) setOrder(data.data);
    } catch {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${slug}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.status) {
        await fetchOrderDetails();
        toast.success('Order status updated');
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined or null status
    if (!status) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <ClockIcon className="w-4 h-4 mr-2" />
          UNKNOWN
        </span>
      );
    }

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      declined: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
        <p className="text-gray-500 mt-2">The order you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/orders')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              Order #{order.slug?.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(order?.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Order Type</label>
                <p className="text-sm text-gray-900">{order.order_type?.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-sm text-gray-900">₦{parseFloat(order.amount).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm text-gray-900">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-sm text-gray-900">{order.status?.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Documents Status</label>
                <p className={`text-sm ${order.documents_sent_at ? 'text-green-600' : 'text-red-600'}`}>
                  {order.documents_sent_at ? 'Sent to User' : 'Not Sent'}
                </p>
              </div>
              {order.selected_items?.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Documents Requested</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {order.selected_items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {String(item).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                </div>
              </div>
              {order.user?.phone_number && (
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-900">{order.user.phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.car?.vehicle_make} {order.car?.vehicle_model}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.car?.registration_no} • {order.car?.vehicle_year}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Chassis Number</label>
                  <p className="text-sm text-gray-900">{order.car?.chasis_no}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Engine Number</label>
                  <p className="text-sm text-gray-900">{order.car?.engine_no}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.delivery_address}</p>
                  <p className="text-sm text-gray-500">{order.state_name || order.state}, {order.lga_name || order.lga}</p>
                </div>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <p className="text-sm text-gray-900">{order.delivery_contact}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Actions</h3>

            <div className="space-y-3">
              {order?.status === 'pending' && (
                <>
                  <p className="text-sm text-gray-500">
                    Mark this order as In Progress when you start processing it.
                  </p>
                  <button
                    onClick={() => handleStatusUpdate('in_progress')}
                    disabled={statusUpdating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
                  >
                    {statusUpdating ? 'Updating...' : 'Mark In Progress'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('declined')}
                    disabled={statusUpdating}
                    className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium text-sm"
                  >
                    Decline Order
                  </button>
                </>
              )}

              {order?.status === 'in_progress' && (
                <>
                  <p className="text-sm text-gray-500">
                    Upload the processed documents to the car record in the Cars section, then mark this order as Completed.
                  </p>
                  <button
                    onClick={() => navigate('/admin/cars')}
                    className="w-full border border-blue-300 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 font-medium text-sm"
                  >
                    Go to Cars → Upload Documents
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={statusUpdating}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm"
                  >
                    {statusUpdating ? 'Updating...' : 'Mark as Completed'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('declined')}
                    disabled={statusUpdating}
                    className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium text-sm"
                  >
                    Decline Order
                  </button>
                </>
              )}

              {(order?.status === 'completed' || order?.status === 'declined') && (
                <div className={`text-center py-3 rounded-lg text-sm font-medium ${
                  order.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  Order {order.status === 'completed' ? 'Completed' : 'Declined'}
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Gateway</span>
                <span className="text-sm font-medium text-gray-900">{order.payment?.payment_gateway?.toUpperCase() || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-sm font-medium text-gray-900 break-all text-right ml-2">{order.payment?.transaction_id || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium ${order.payment?.status === 'successful' || order.payment?.status === 'SUCCESSFUL' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment?.status?.toUpperCase() || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
