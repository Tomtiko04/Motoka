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
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';

const AdminPayments = () => {
  const [transactions, setTransactions] = useState([]);
  const [failedTransactions, setFailedTransactions] = useState([]);
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
  ];

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchTransactions();
    fetchFailedTransactions();
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
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFailedTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        per_page: 8,
        search: searchTerm,
      });

      const response = await fetch(`${config.getApiBaseUrl()}/admin/transactions/failed?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status) {
        setFailedTransactions(data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch failed transactions:', error);
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
      approved: { color: 'bg-green-100 text-green-800', label: 'Success' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      declined: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      // Fallback for old data
      success: { color: 'bg-green-100 text-green-800', label: 'Success' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
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
    } catch (error) {
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

        {/* Make Payment Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
            Make Payment
          </button>
        </div>
      </div>

      {/* Failed Payment Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Failed Payment</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            See More
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : failedTransactions.length > 0 ? (
            <div className="space-y-3">
              {failedTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`flex items-center space-x-4 p-3 rounded-lg ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="h-4 w-4 text-blue-600">
                    <DocumentTextIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.transaction_id}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {transaction.payment_description || 'Transaction'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No failed transactions found</p>
            </div>
          )}
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
                      <button
                        onClick={() => handleViewTransaction(transaction.transaction_id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </button>
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

                  {selectedTransaction.order && (
                    <div className="border-t pt-4">
                      <p className="text-gray-500 mb-1">Linked Order</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.order.order_number}</p>
                      <p className="text-gray-500">Status: {selectedTransaction.order.status}</p>
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
