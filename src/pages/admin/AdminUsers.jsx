import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import config from '../../config/config';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 15,
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.status) {
        setUsers(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDeleteClick = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${deleteModal.user.userId}`,
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
        setDeleteModal({ isOpen: false, user: null });
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');

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

      if (data.status) {
        toast.success('User suspended successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');

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

      if (data.status) {
        toast.success('User activated successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to activate user');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (user) => {
    if (user.deleted_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Icon icon="mdi:delete" className="mr-1 h-3 w-3" />
          Deleted
        </span>
      );
    }
    if (user.is_suspended) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Icon icon="mdi:lock" className="mr-1 h-3 w-3" />
          Suspended
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Icon icon="mdi:check-circle" className="mr-1 h-3 w-3" />
        Active
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all registered users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-1 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <Icon icon="mdi:account-off" className="h-16 w-16 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user, index) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {(currentPage - 1) * 15 + (index + 1)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.phone || 'No phone'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Cars:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {user.cars_count || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Orders:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {user.orders_count || 0}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user.userId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <Icon icon="mdi:eye" className="h-5 w-5" />
                        </button>
                        {!user.deleted_at && (
                          <>
                            {user.is_suspended ? (
                              <button
                                onClick={() => handleActivateUser(user.userId)}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Activate user"
                              >
                                <Icon icon="mdi:lock-open" className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(user.userId)}
                                disabled={actionLoading}
                                className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                                title="Suspend user"
                              >
                                <Icon icon="mdi:lock" className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(user)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete user"
                            >
                              <Icon icon="mdi:delete" className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <Icon icon="mdi:alert" className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
              Delete User
            </h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-medium">{deleteModal.user?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
                disabled={actionLoading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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

export default AdminUsers;