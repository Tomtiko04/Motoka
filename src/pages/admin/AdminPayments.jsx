import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';
import { markTransactionPaid, markTransactionFailed } from '../../services/apiAdminDocument';

const AdminPayments = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_amount: 0,
    total_transactions: 0,
    successful_transactions: 0,
    failed_transactions: 0,
    pending_transactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [txDetailLoading, setTxDetailLoading] = useState(false);

  const statusOptions = [
    { value: 'All', label: 'All Transactions', color: 'gray' },
    { value: 'success', label: 'Successful', color: 'green' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'abandoned', label: 'Abandoned', color: 'gray' },
  ];

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchTransactions();
  }, [activeFilter, currentPage, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 15,
        status: activeFilter === 'All' ? 'all' : activeFilter.toLowerCase(),
        search: searchTerm,
      });

      const response = await fetch(`${config.getApiBaseUrl()}/admin/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status) {
        setTransactions(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        toast.error('Failed to fetch transactions');
      }
    } catch {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      successful: { color: 'bg-green-100 text-green-800', label: 'Success' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Success' },
      success: { color: 'bg-green-100 text-green-800', label: 'Success' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      declined: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      abandoned: { color: 'bg-gray-100 text-gray-700', label: 'Abandoned' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleMarkPaid = async (reference) => {
    if (!window.confirm(`Process transaction ${reference}? This will create an order and notify the user.`)) return;
    try {
      const result = await markTransactionPaid(reference);
      if (result?.data?.alreadyProcessed) {
        toast.error('This transaction already has an order.');
      } else {
        toast.success('Order created — user notified');
      }
      fetchTransactions();
      if (selectedTransaction?.reference === reference) setSelectedTransaction(null);
    } catch (err) {
      toast.error(err.message || 'Failed to process transaction');
    }
  };

  const handleMarkFailed = async (reference) => {
    if (!window.confirm(`Mark transaction ${reference} as FAILED? This means no money was received. This cannot be undone.`)) return;
    try {
      await markTransactionFailed(reference);
      toast.success('Transaction marked as failed');
      fetchTransactions();
      if (selectedTransaction?.reference === reference) setSelectedTransaction(null);
    } catch (err) {
      toast.error(err.message || 'Failed to mark transaction as failed');
    }
  };

  const handleViewTransaction = async (reference) => {
    try {
      setTxDetailLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/transactions/${reference}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status) {
        setSelectedTransaction(data.data);
      } else {
        toast.error('Failed to load transaction details');
      }
    } catch {
      toast.error('Failed to load transaction details');
    } finally {
      setTxDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <CreditCardIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Transaction</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Amount Entered */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amount Entered</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.total_amount)}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowUpIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Amount Spent */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amount Spent</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.successful_transactions > 0 ? summary.total_amount : 0)}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowDownIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Failed Transactions count */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed / Abandoned</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.failed_transactions}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowDownIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* All Transactions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Filter */}
              <div className="flex space-x-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeFilter === option.value
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
                    </td>
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{transaction.user?.name || 'N/A'}</div>
                        <div className="text-gray-500">{transaction.user?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.payment_description || 'Transaction'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewTransaction(transaction.transaction_id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                        {(transaction.status === 'pending' || transaction.status === 'approved' || transaction.status === 'abandoned') && (
                          <>
                            <button
                              onClick={() => handleMarkPaid(transaction.transaction_id)}
                              className={`flex items-center gap-1 text-xs font-medium border rounded px-2 py-1 ${
                                transaction.status === 'abandoned'
                                  ? 'text-orange-600 hover:text-orange-800 border-orange-300'
                                  : transaction.status === 'pending'
                                  ? 'text-green-600 hover:text-green-800 border-green-300'
                                  : 'text-blue-600 hover:text-blue-800 border-blue-300'
                              }`}
                              title={
                                transaction.status === 'abandoned'
                                  ? 'User paid on this abandoned transaction — recover and create order'
                                  : transaction.status === 'pending'
                                  ? 'Manually mark this payment as received'
                                  : 'Create missing order for this payment'
                              }
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              {transaction.status === 'abandoned' ? 'Recover & Create Order' : transaction.status === 'pending' ? 'Mark Paid' : 'Create Order'}
                            </button>
                            <button
                              onClick={() => handleMarkFailed(transaction.transaction_id)}
                              className="flex items-center gap-1 text-xs font-medium border rounded px-2 py-1 text-red-600 hover:text-red-800 border-red-300"
                              title="No money received — mark this transaction as failed"
                            >
                              Mark Failed
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {(selectedTransaction || txDetailLoading) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSelectedTransaction(null)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
                <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {txDetailLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              ) : selectedTransaction && (
                <div className="space-y-4 text-sm">
                  {/* Core transaction fields */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Reference', selectedTransaction.reference],
                      ['Gateway', selectedTransaction.payment_gateway?.toUpperCase()],
                      ['Amount', formatCurrency(selectedTransaction.amount)],
                      ['Status', selectedTransaction.status],
                      ['Type', selectedTransaction.payment_description],
                      ['Channel', selectedTransaction.channel || '—'],
                      ['Date', selectedTransaction.created_at ? formatDate(selectedTransaction.created_at) : '—'],
                      ['Paid At', selectedTransaction.paid_at ? formatDate(selectedTransaction.paid_at) : '—'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-gray-500">{label}</p>
                        <p className="font-medium text-gray-900 break-all">{value || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Form details the user filled in */}
                  {(selectedTransaction.plate_type || selectedTransaction.license_type || selectedTransaction.renewal_months) && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">What the customer ordered</p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTransaction.plate_type && (
                          <>
                            <div>
                              <p className="text-gray-500">Plate Type</p>
                              <p className="font-medium text-gray-900 capitalize">{selectedTransaction.plate_type.replace(/_/g, ' ')}</p>
                            </div>
                            {selectedTransaction.plate_sub_type && (
                              <div>
                                <p className="text-gray-500">Sub-Type</p>
                                <p className="font-medium text-gray-900 capitalize">{selectedTransaction.plate_sub_type.replace(/_/g, ' ')}</p>
                              </div>
                            )}
                          </>
                        )}
                        {selectedTransaction.license_type && (
                          <>
                            <div>
                              <p className="text-gray-500">License Type</p>
                              <p className="font-medium text-gray-900 capitalize">{selectedTransaction.license_type}</p>
                            </div>
                            {selectedTransaction.license_duration && (
                              <div>
                                <p className="text-gray-500">Duration</p>
                                <p className="font-medium text-gray-900">{selectedTransaction.license_duration}</p>
                              </div>
                            )}
                          </>
                        )}
                        {selectedTransaction.renewal_months && (
                          <div>
                            <p className="text-gray-500">Renewal Period</p>
                            <p className="font-medium text-gray-900">{selectedTransaction.renewal_months} month(s)</p>
                          </div>
                        )}
                      </div>
                      {selectedTransaction.delivery_details && (
                        <div className="mt-3">
                          <p className="text-gray-500">Delivery Address</p>
                          <p className="font-medium text-gray-900">{selectedTransaction.delivery_details.address || '—'}</p>
                          <p className="text-gray-500">{selectedTransaction.delivery_details.state}{selectedTransaction.delivery_details.lga ? `, ${selectedTransaction.delivery_details.lga}` : ''}</p>
                          {selectedTransaction.delivery_details.contact && (
                            <p className="text-gray-500">Contact: {selectedTransaction.delivery_details.contact}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTransaction.user && (
                    <div className="border-t pt-4">
                      <p className="text-gray-500 mb-1">Customer</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.user.name}</p>
                      <p className="text-gray-500">{selectedTransaction.user.email}</p>
                      {selectedTransaction.user.phone_number && (
                        <p className="text-gray-500">{selectedTransaction.user.phone_number}</p>
                      )}
                    </div>
                  )}

                  {selectedTransaction.car && (
                    <div className="border-t pt-4">
                      <p className="text-gray-500 mb-1">Vehicle</p>
                      <p className="font-medium text-gray-900">
                        {selectedTransaction.car.vehicle_make} {selectedTransaction.car.vehicle_model}
                      </p>
                      <p className="text-gray-500">Plate: {selectedTransaction.car.registration_no || '—'}</p>
                    </div>
                  )}

                  {selectedTransaction.order ? (
                    <div className="border-t pt-4">
                      <p className="text-gray-500 mb-1">Linked Order</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.order.order_number}</p>
                      <p className="text-gray-500">Status: {selectedTransaction.order.status}</p>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <p className="text-xs text-orange-600 font-medium mb-3">⚠ No order linked to this transaction yet.</p>
                    </div>
                  )}

                  {/* Modal action buttons for pending/abandoned transactions */}
                  {(selectedTransaction.status === 'pending' || selectedTransaction.status === 'abandoned') && (
                    <div className="border-t pt-4 flex gap-3">
                      <button
                        onClick={() => handleMarkPaid(selectedTransaction.reference)}
                        className="flex-1 py-2 px-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
                      >
                        {selectedTransaction.status === 'abandoned' ? 'Recover & Create Order' : 'Mark Paid'}
                      </button>
                      <button
                        onClick={() => handleMarkFailed(selectedTransaction.reference)}
                        className="flex-1 py-2 px-3 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded-lg"
                      >
                        Mark Failed
                      </button>
                    </div>
                  )}
                  {/* Mark Paid for successful-but-no-order case */}
                  {selectedTransaction.status === 'successful' && !selectedTransaction.order && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => handleMarkPaid(selectedTransaction.reference)}
                        className="w-full py-2 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        Create Missing Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
