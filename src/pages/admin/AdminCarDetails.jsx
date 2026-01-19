import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  ArrowLeftIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import config from '../../config/config';

const AdminCarDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchCarDetails();
  }, [slug]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/cars/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setCar(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch car details');
        navigate('/admin/cars');
      }
    } catch (error) {
      toast.error('Failed to fetch car details');
      navigate('/admin/cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/cars/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        toast.success('Car deleted successfully');
        navigate('/admin/cars');
      } else {
        toast.error(data.message || 'Failed to delete car');
      }
    } catch (error) {
      toast.error('Failed to delete car');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      unpaid: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      expired: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-1.5" />
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Car not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/cars')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Car Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              View complete information about this vehicle
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Delete Car
        </button>
      </div>

      {/* Vehicle Information Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-lg bg-white/20 flex items-center justify-center">
                <TruckIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {car.vehicle_make} {car.vehicle_model}
                </h2>
                <p className="text-blue-100">
                  {car.vehicle_year} • {car.vehicle_color}
                </p>
              </div>
            </div>
            {getStatusBadge(car.status)}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{car.registration_no || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Registration Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    car.registration_status === 'registered' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {car.registration_status?.toUpperCase()}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Car Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{car.car_type?.toUpperCase()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Chassis Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{car.chasis_no || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Engine Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{car.engine_no || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {/* Date Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
            <dl className="space-y-3">
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500">Date Issued</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(car.date_issued)}</dd>
                </div>
              </div>
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(car.expiry_date)}</dd>
                </div>
              </div>
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500">Registered On</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(car.created_at)}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Owner Information Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <UserIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Owner Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{car.name_of_owner}</dd>
            </div>
            <div className="flex items-start">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{car.phone_number || 'N/A'}</dd>
              </div>
            </div>
          </dl>
          <dl className="space-y-3">
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{car.address}</dd>
              </div>
            </div>
            {car.user && (
              <div>
                <dt className="text-sm font-medium text-gray-500">User Account</dt>
                <dd className="mt-1 text-sm text-gray-900">{car.user.email}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Documents Card */}
      {car.document_images && car.document_images.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {car.document_images.map((doc, index) => (
              <a
                key={index}
                href={`${config.getApiBaseUrl()}/${doc}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Document {index + 1}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Orders History */}
      {car.orders && car.orders.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
          <div className="space-y-3">
            {car.orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.order_no}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Delete Car
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this car? This action cannot be undone and will remove all associated data including reminders and documents.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCar}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarDetails;