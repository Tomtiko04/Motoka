import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import config from '../../config/config';
import AddUserModal from '../../components/admin/AddUserModal';
import {
  PageHeader,
  Card,
  StatusBadge,
  PageLoader,
  EmptyState,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
  TH,
} from '../../components/admin/ui';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('recently_added');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, sortFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/admin/login');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        per_page: 15,
        search: searchTerm,
        status: statusFilter,
        sort: sortFilter,
      });

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
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
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${deleteModal.user.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
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
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${userId}/suspend`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.status ?? data.success) {
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
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${config.getApiBaseUrl()}/admin/users/${userId}/activate`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.status ?? data.success) {
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
        <StatusBadge tone="gray">
          <TrashIcon className="mr-1 h-3 w-3" />
          Deleted
        </StatusBadge>
      );
    }
    if (user.is_suspended) {
      return (
        <StatusBadge tone="red">
          <LockClosedIcon className="mr-1 h-3 w-3" />
          Suspended
        </StatusBadge>
      );
    }
    return (
      <StatusBadge tone="green">
        <CheckCircleIcon className="mr-1 h-3 w-3" />
        Active
      </StatusBadge>
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
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={UsersIcon}
        title="Users"
        subtitle="Manage all registered users"
        actions={
          <button onClick={() => setShowAddUser(true)} className={BTN_PRIMARY}>
            <UserPlusIcon className="h-4 w-4" />
            Add User
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
        <select
          value={sortFilter}
          onChange={(e) => {
            setSortFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="recently_added">Recently Added</option>
          <option value="a_z">A - Z</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            body={
              searchTerm || statusFilter !== 'all'
                ? 'No users match your search or filters. Try adjusting them.'
                : 'Users will appear here once they register.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className={TH}>User</th>
                  <th className={TH}>Contact</th>
                  <th className={TH}>Plate No.</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Cars</th>
                  <th className={TH}>Joined</th>
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.phone || 'No phone'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.plates.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.plates.slice(0, 2).map((p) => (
                            <span key={p} className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-mono font-medium text-gray-700">
                              {p}
                            </span>
                          ))}
                          {user.plates.length > 2 && (
                            <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              +{user.plates.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {getStatusBadge(user)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="font-medium tabular-nums text-gray-900">{user.cars_count || 0}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                          aria-label="View details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {!user.deleted_at && (
                          <>
                            {user.is_suspended ? (
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Activate user"
                                aria-label="Activate user"
                              >
                                <LockOpenIcon className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                disabled={actionLoading}
                                className="text-amber-600 hover:text-amber-800 disabled:opacity-50"
                                title="Suspend user"
                                aria-label="Suspend user"
                              >
                                <LockClosedIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(user)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete user"
                              aria-label="Delete user"
                            >
                              <TrashIcon className="h-5 w-5" />
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
      </Card>

      {/* Pagination */}
      {!loading && users.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={BTN_SECONDARY}
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
            className={BTN_SECONDARY}
          >
            Next
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSuccess={() => fetchUsers()}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
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
                className={`${BTN_SECONDARY} flex-1`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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

export default AdminUsers;
