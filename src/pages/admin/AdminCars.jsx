import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import config from '../../config/config';
import AddCarModal from '../../components/admin/AddCarModal';
import BulkImportModal from '../../components/admin/BulkImportModal';

const AdminCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [carTypeFilter, setCarTypeFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('recently_added');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAddCar, setShowAddCar] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Registered' },
    { value: 'unpaid', label: 'Renewal Due' },
    { value: 'expired', label: 'Expired' },
  ];

  const carTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'private', label: 'Private' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'government', label: 'Government' },
  ];

  useEffect(() => {
    fetchCars();
  }, [currentPage, statusFilter, carTypeFilter, searchTerm, sortFilter]);

  const fetchCars = async () => {
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
        status: statusFilter,
        car_type: carTypeFilter,
        search: searchTerm,
        sort: sortFilter,
      });

      const response = await fetch(`${config.getApiBaseUrl()}/admin/cars?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setCars(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
      } else {
        toast.error(data.message || 'Failed to fetch cars');
      }
    } catch (error) {
      console.error('Fetch cars error:', error);
      toast.error('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_MAP = {
    active:   { color: 'bg-green-100 text-green-800',  label: 'Registered' },
    approved: { color: 'bg-green-100 text-green-800',  label: 'Approved' },
    unpaid:   { color: 'bg-yellow-100 text-yellow-800', label: 'Renewal Due' },
    expired:  { color: 'bg-red-100 text-red-800',       label: 'Expired' },
  };

  const getStatusBadge = (status) => {
    const cfg = STATUS_MAP[status] || { color: 'bg-gray-100 text-gray-700', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchInput);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Cars</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage all registered vehicles</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Bulk Import
          </button>
          <button
            onClick={() => setShowAddCar(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Car
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by make, model, reg number, or owner..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={carTypeFilter}
              onChange={(e) => { setCarTypeFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {carTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortFilter}
              onChange={(e) => { setSortFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="recently_added">Recently Added</option>
              <option value="a_z">A - Z</option>
            </select>
          </div>

          {(statusFilter !== 'all' || carTypeFilter !== 'all' || sortFilter !== 'recently_added' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setCarTypeFilter('all');
                setSortFilter('recently_added');
                setSearchInput('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Cars Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <TruckIcon className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium">No cars found</p>
            {(searchTerm || statusFilter !== 'all' || carTypeFilter !== 'all') && (
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            )}
          </div>
        ) : null}
        <div className={`overflow-x-auto${cars.length === 0 || loading ? ' hidden' : ''}`}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <TruckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {car.vehicle_make} {car.vehicle_model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.vehicle_year} • {car.vehicle_color}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {car.name_of_owner}
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {car.registration_no}
                    </div>
                    <div className="text-sm text-gray-500">
                      {car.car_type?.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(car.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {car.created_at ? formatDate(car.created_at) : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {car.expiry_date ? formatDate(car.expiry_date) : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <a
                      href={`/admin/cars/${car.slug}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {showAddCar && (
        <AddCarModal
          onClose={() => setShowAddCar(false)}
          onSuccess={() => { setCurrentPage(1); fetchCars(); }}
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => { setCurrentPage(1); fetchCars(); }}
        />
      )}
    </div>
  );
};

export default AdminCars;
