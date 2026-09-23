import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';
import {
  StatusBadge,
  PageLoader,
  EmptyState,
  CARD,
  TH,
  INPUT,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '../../components/admin/ui';

// Canonical status values mirror the DB enum. Display labels (incl. "New"
// for pending) live only here; the API never sees the labels and the UI
// never sees the raw status without going through this map.
const STATUS_FILTERS = [
  { value: 'all',        label: 'All' },
  { value: 'pending',    label: 'New' },
  { value: 'processing', label: 'In Progress' },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
];
const STATUS_LABEL = {
  pending:    'New',
  processing: 'In Progress',
  completed:  'Completed',
  cancelled:  'Cancelled',
};
const STATUS_TONE = {
  pending:    'blue',
  processing: 'amber',
  completed:  'green',
  cancelled:  'gray',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [perPage, setPerPage] = useState(15);

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchOrders();
  }, [activeFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const params = new URLSearchParams({
        status: activeFilter,
        page: currentPage,
        per_page: perPage,
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
        setCurrentPage(data.data.current_page || 1);
        setTotalPages(data.data.last_page || 1);
        setTotalOrders(data.data.total || 0);
        setPerPage(data.data.per_page || 15);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Build a human-readable purpose label from order_type + plate/license specifics
  const getPurpose = (order) => {
    const type = order.order_type || '';
    if (type === 'plate_number') {
      const parts = ['Plate Number'];
      if (order.plate_type) parts.push(order.plate_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      if (order.plate_sub_type) parts.push(`(${order.plate_sub_type.replace(/_/g, ' ')})`);
      return parts.join(' — ');
    }
    if (type === 'driver_license') {
      const parts = ["Driver's License"];
      if (order.license_type) parts.push(order.license_type.charAt(0).toUpperCase() + order.license_type.slice(1));
      if (order.license_duration) parts.push(`(${order.license_duration})`);
      return parts.join(' — ');
    }
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Service';
  };

  // Transform orders data for display. `status` stays canonical (DB shape);
  // the table cell looks up STATUS_LABEL when rendering.
  const transformedOrders = orders.map(order => ({
    id: `#${order.slug?.substring(0, 8) || order.id}`,
    name: order.user?.name || 'Unknown User',
    purpose: getPurpose(order),
    amount: `N${parseFloat(order.amount || 0).toLocaleString()}`,
    location: order.state_name ? `${order.state_name}${order.lga_name ? ', ' + order.lga_name : ''}` : (order.order_type === 'plate_number' || order.order_type === 'driver_license' ? '—' : 'Unknown'),
    renewalState: order.renewal_state || null,
    status: order.status,
    originalOrder: order
  }));

  const handleViewOrder = (order) => {
    window.location.href = `/admin/orders/${order.originalOrder.slug}`;
  };

  
  const filteredOrders = transformedOrders.filter(order => {
    const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Hub provides the page header; keep only the count */}
      <div className="text-right text-sm text-gray-500">
        {totalOrders} total orders
      </div>

      {/* Search and Filter Bar */}
      <div className={`${CARD} p-4`}>
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
                className={`${INPUT} pl-10`}
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={activeFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.value === 'all' ? 'All Orders' : f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.value === 'all' ? 'All' : f.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={TH}>Order ID</th>
                <th className={TH}>Name</th>
                <th className={TH}>Purpose</th>
                <th className={TH}>Amount</th>
                <th className={TH}>Location</th>
                <th className={TH}>Renewal State</th>
                <th className={TH}>Status</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="text-blue-600 hover:text-blue-800 hover:underline">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.purpose}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.renewalState ? (
                        <span className="flex items-center gap-1.5">
                          {order.renewalState}
                          {order.renewalState === "Lagos" && (
                            <StatusBadge tone="amber">Inspection</StatusBadge>
                          )}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge tone={STATUS_TONE[order.status] || 'gray'}>
                        {STATUS_LABEL[order.status] || order.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrder(order);
                        }}
                        className={BTN_PRIMARY}
                      >
                        Check Order
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title="No orders found"
          body={
            searchTerm || activeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No orders have been placed yet.'
          }
        />
      )}

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && totalPages > 1 && (
        <div className={`${CARD} p-4`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Showing X to Y of Z results */}
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((currentPage - 1) * perPage) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * perPage, totalOrders)}
              </span>{' '}
              of <span className="font-medium">{totalOrders}</span> results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${BTN_SECONDARY} !px-3`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              {/* Mobile: Current Page Indicator */}
              <div className="sm:hidden text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${BTN_SECONDARY} !px-3`}
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;