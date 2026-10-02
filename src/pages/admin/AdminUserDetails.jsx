import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BanknotesIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import config from '../../config/config';
import AddCarModal from '../../components/admin/AddCarModal';
import {
  Card,
  StatCard,
  StatusBadge,
  PageLoader,
  EmptyState,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
} from '../../components/admin/ui';

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return null;
    }
    return session.access_token;
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.status) {
        setUser(data.data.user);
        setStats(data.data.stats || {
          pending_orders: 0,
          total_spent: 0,
          last_activity: data.data.user?.updated_at,
        });
      } else {
        toast.error(data.message || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleBack = () => navigate('/admin/users');

  const handleSuspend = async () => {
    try {
      setActionLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${userId}/suspend`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.status ?? data.success) {
        toast.success('User suspended successfully');
        fetchUserDetails();
      } else {
        toast.error(data.message || 'Failed to suspend user');
      }
    } catch {
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setActionLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${userId}/activate`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.status ?? data.success) {
        toast.success('User activated successfully');
        fetchUserDetails();
      } else {
        toast.error(data.message || 'Failed to activate user');
      }
    } catch {
      toast.error('Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.status) {
        toast.success('User deleted successfully');
        setDeleteModal(false);
        setTimeout(() => navigate('/admin/users'), 1000);
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <EmptyState
        icon={UserIcon}
        title="User not found"
        body="This user may have been removed, or the link is out of date."
        action={
          <button onClick={handleBack} className={BTN_PRIMARY}>
            Back to Users
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Users</span>
        </button>
        {!user.deleted_at && (
          <div className="flex gap-2">
            {user.is_suspended ? (
              <button
                onClick={handleActivate}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                <LockOpenIcon className="h-4 w-4" />
                <span>Activate</span>
              </button>
            ) : (
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                <LockClosedIcon className="h-4 w-4" />
                <span>Suspend</span>
              </button>
            )}
            <button
              onClick={() => setDeleteModal(true)}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* User Info Card */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-blue-600">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-gray-900 truncate">{user.name}</h1>
                <p className="text-xs text-gray-500 mt-0.5">User ID: {user.userId}</p>
              </div>
              <div className="flex-shrink-0">
                {user.deleted_at ? (
                  <StatusBadge tone="gray">
                    <TrashIcon className="mr-1 h-3.5 w-3.5" />
                    Deleted
                  </StatusBadge>
                ) : user.is_suspended ? (
                  <StatusBadge tone="red">
                    <LockClosedIcon className="mr-1 h-3.5 w-3.5" />
                    Suspended
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="green">
                    <CheckCircleIcon className="mr-1 h-3.5 w-3.5" />
                    Active
                  </StatusBadge>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Joined</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">User Type</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{user.user_type || 'user'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Activity</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(stats?.last_activity)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Verified</p>
                <p className="text-sm font-medium text-gray-900">{user.email_verified_at ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TruckIcon}
          label="Total Cars"
          value={user.cars_count || 0}
          color="blue"
        />
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Total Orders"
          value={user.orders_count || 0}
          color="green"
        />
        <StatCard
          icon={ClockIcon}
          label="Pending Orders"
          value={stats?.pending_orders || 0}
          color="amber"
        />
        <StatCard
          icon={BanknotesIcon}
          label="Total Spent"
          value={formatCurrency(stats?.total_spent)}
          color="gray"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Cars */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Recent Cars</h2>
            <button
              onClick={() => setShowAddCarModal(true)}
              className={BTN_PRIMARY}
            >
              <PlusIcon className="h-4 w-4" />
              Add Car
            </button>
          </div>
          {user.cars && user.cars.length > 0 ? (
            <div className="space-y-2">
              {user.cars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => window.location.href = `/admin/cars/${car.slug}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {car.vehicle_make} {car.vehicle_model}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {car.registration_no || 'No reg number'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/cars/${car.slug}`)}
                    className="ml-3 text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label="View car"
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TruckIcon}
              title="No cars registered"
              body="Use Add Car to register a vehicle for this user."
            />
          )}
        </Card>

        {/* Recent Orders */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Orders</h2>
          {user.orders && user.orders.length > 0 ? (
            <div className="space-y-2">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate capitalize">
                      {order.order_type?.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      Status: {order.status}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/orders/${order.slug}`)}
                    className="ml-3 text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label="View order"
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardDocumentListIcon}
              title="No orders found"
              body="Orders this user places will appear here."
            />
          )}
        </Card>
      </div>

      {/* Add Car Modal */}
      {showAddCarModal && (
        <AddCarModal
          preselectedUser={{
            id: userId,
            name: user.name,
            email: user.email,
            phone_number: user.phone,
          }}
          onClose={() => setShowAddCarModal(false)}
          onSuccess={() => {
            setShowAddCarModal(false);
            fetchUserDetails();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-2.5">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <h3 className="mb-2 text-center text-base font-semibold text-gray-900">Delete User</h3>
            <p className="mb-5 text-center text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">{user.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={actionLoading}
                className={`${BTN_SECONDARY} flex-1`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className={`${BTN_DANGER} flex-1`}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetails;
