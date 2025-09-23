import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';

const AgentView = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNINImages, setShowNINImages] = useState({ front: false, back: false });
  const [currentPage, setCurrentPage] = useState({ payments: 1, orders: 1 });
  const [activeTab, setActiveTab] = useState('overview');

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    lga: '',
    account_number: '',
    bank_name: '',
    account_name: '',
    notes: '',
    agentProfile: null,
    ninFront: null,
    ninBack: null,
  });

  // States for dropdown
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    fetchAgentDetails();
    fetchStates();
  }, [uuid]);

  // Filter states based on search term
  useEffect(() => {
    if (stateSearchTerm) {
      const filtered = states.filter(state =>
        state.name.toLowerCase().includes(stateSearchTerm.toLowerCase())
      );
      setFilteredStates(filtered);
    } else {
      setFilteredStates(states);
    }
  }, [stateSearchTerm, states]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.state-dropdown')) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/states`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setStates(data.data);
        setFilteredStates(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch states');
    }
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setEditForm(prev => ({
      ...prev,
      state: state.name
    }));
    setIsStateDropdownOpen(false);
  };

  const handleFileUpload = (field, file) => {
    setEditForm(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/agents/uuid/${uuid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setAgent(data.data.agent);
        setPayments(data.data.payments.data || []);
        setOrders(data.data.orders.data || []);
        
        // Set edit form data
        setEditForm({
          first_name: data.data.agent.first_name || '',
          last_name: data.data.agent.last_name || '',
          email: data.data.agent.email || '',
          phone: data.data.agent.phone || '',
          address: data.data.agent.address || '',
          state: data.data.agent.state || '',
          lga: data.data.agent.lga || '',
          account_number: data.data.agent.account_number || '',
          bank_name: data.data.agent.bank_name || '',
          account_name: data.data.agent.account_name || '',
          notes: data.data.agent.notes || '',
          agentProfile: null,
          ninFront: null,
          ninBack: null,
        });

        // Set selected state if exists
        if (data.data.agent.state) {
          const stateObj = states.find(s => s.name === data.data.agent.state);
          if (stateObj) {
            setSelectedState(stateObj);
          }
        }
      } else {
        toast.error(data.message || 'Failed to fetch agent details');
        navigate('/admin/agents');
      }
    } catch (error) {
      toast.error('Failed to fetch agent details');
      navigate('/admin/agents');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/agents/uuid/${uuid}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.status) {
        setAgent(data.data);
        toast.success(data.message);
        setShowStatusModal(false);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      // Add text fields
      formData.append('first_name', editForm.first_name);
      formData.append('last_name', editForm.last_name);
      formData.append('email', editForm.email);
      formData.append('phone', editForm.phone);
      formData.append('address', editForm.address);
      formData.append('state', editForm.state);
      formData.append('lga', editForm.lga);
      formData.append('account_number', editForm.account_number);
      formData.append('bank_name', editForm.bank_name);
      formData.append('account_name', editForm.account_name);
      formData.append('notes', editForm.notes);

      // Add files if they exist
      if (editForm.agentProfile) {
        formData.append('profile_image', editForm.agentProfile);
      }
      if (editForm.ninFront) {
        formData.append('nin_front_image', editForm.ninFront);
      }
      if (editForm.ninBack) {
        formData.append('nin_back_image', editForm.ninBack);
      }

      const response = await fetch(`${config.getApiBaseUrl()}/admin/agents/uuid/${uuid}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.status) {
        setAgent(data.data);
        toast.success(data.message);
        setShowEditModal(false);
        // Refresh agent details
        fetchAgentDetails();
      } else {
        toast.error(data.message || 'Failed to update agent');
      }
    } catch (error) {
      toast.error('Failed to update agent');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'deleted': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckIcon className="h-4 w-4" />;
      case 'suspended': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'deleted': return <XMarkIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Agent not found</h3>
        <p className="text-gray-500">The agent you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/agents')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Agents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/agents')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{agent.first_name} {agent.last_name}</h1>
            <p className="text-sm text-gray-600">Agent Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agent.status)}`}>
            {getStatusIcon(agent.status)}
            <span className="ml-1 capitalize">{agent.status}</span>
          </span>
          
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </button>
          
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={agent.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="appearance-none bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="active" className="bg-white text-gray-900">Active</option>
              <option value="suspended" className="bg-white text-gray-900">Suspended</option>
              <option value="deleted" className="bg-white text-gray-900">Deleted</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ExclamationTriangleIcon className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'payments', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900">{agent.first_name} {agent.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {agent.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {agent.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {agent.state}, {agent.lga}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900">{agent.address}</p>
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Banking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Number</label>
                  <p className="text-sm text-gray-900">{agent.account_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank Name</label>
                  <p className="text-sm text-gray-900">{agent.bank_name || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Account Name</label>
                  <p className="text-sm text-gray-900">{agent.account_name || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* NIN Documents */}
            {(agent.nin_front_image || agent.nin_back_image) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">NIN Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agent.nin_front_image && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">NIN Front</label>
                      <div className="mt-2">
                        <img
                          src={`${config.getApiBaseUrl().replace('/api', '')}/${agent.nin_front_image}`}
                          alt="NIN Front"
                          className="w-full h-32 object-cover rounded-md cursor-pointer"
                          onClick={() => setShowNINImages(prev => ({ ...prev, front: !prev.front }))}
                        />
                      </div>
                    </div>
                  )}
                  {agent.nin_back_image && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">NIN Back</label>
                      <div className="mt-2">
                        <img
                          src={`${config.getApiBaseUrl().replace('/api', '')}/${agent.nin_back_image}`}
                          alt="NIN Back"
                          className="w-full h-32 object-cover rounded-md cursor-pointer"
                          onClick={() => setShowNINImages(prev => ({ ...prev, back: !prev.back }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {agent.notes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-sm text-gray-900">{agent.notes}</p>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {agent.profile_image ? (
                  <img
                    src={`${config.getApiBaseUrl().replace('/api', '')}/${agent.profile_image}`}
                    alt={agent.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-700">
                    {agent.first_name.charAt(0)}{agent.last_name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{agent.first_name} {agent.last_name}</h3>
              <p className="text-sm text-gray-600">{agent.email}</p>
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agent.status)}`}>
                  {getStatusIcon(agent.status)}
                  <span className="ml-1 capitalize">{agent.status}</span>
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="text-sm font-medium text-gray-900">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Payments</span>
                  <span className="text-sm font-medium text-gray-900">{payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium capitalize ${getStatusColor(agent.status).split(' ')[0]}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Payment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.order?.slug || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{parseFloat(payment.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{parseFloat(payment.commission_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Order History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.order_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{parseFloat(order.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <UserGroupIcon className="h-6 w-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Edit Agent</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - File Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Document Uploads</h3>
                    
                    {/* NIN Front Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Upload NIN Front</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('ninFront', e.target.files[0])}
                        className="hidden"
                        id="nin-front-edit"
                      />
                      <label htmlFor="nin-front-edit" className="cursor-pointer">
                        <span className="text-xs text-gray-500">Click to upload</span>
                      </label>
                      {editForm.ninFront && (
                        <p className="text-xs text-green-600 mt-1">File selected: {editForm.ninFront.name}</p>
                      )}
                    </div>

                    {/* NIN Back Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Upload NIN Back</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('ninBack', e.target.files[0])}
                        className="hidden"
                        id="nin-back-edit"
                      />
                      <label htmlFor="nin-back-edit" className="cursor-pointer">
                        <span className="text-xs text-gray-500">Click to upload</span>
                      </label>
                      {editForm.ninBack && (
                        <p className="text-xs text-green-600 mt-1">File selected: {editForm.ninBack.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Form Fields */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Personal Information</h3>
                    
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={editForm.first_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Enter first name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Enter last name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={editForm.lga}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lga: e.target.value }))}
                        placeholder="Enter location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Account Number */}
                    <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        id="accountNumber"
                        value={editForm.account_number}
                        onChange={(e) => setEditForm(prev => ({ ...prev, account_number: e.target.value }))}
                        placeholder="Enter account number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* State of Origin */}
                    <div className="relative state-dropdown">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State of Origin
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={stateSearchTerm || selectedState?.name || editForm.state || ''}
                          onChange={(e) => {
                            setStateSearchTerm(e.target.value);
                            setIsStateDropdownOpen(true);
                          }}
                          onFocus={() => setIsStateDropdownOpen(true)}
                          placeholder="Search and select state..."
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2"
                        >
                          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                      
                      {/* Dropdown */}
                      {isStateDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredStates.length > 0 ? (
                            filteredStates.map((state) => (
                              <button
                                key={state.id}
                                type="button"
                                onClick={() => handleStateSelect(state)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                {state.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No states found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        id="bankName"
                        value={editForm.bank_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bank_name: e.target.value }))}
                        placeholder="Enter bank name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Account Name */}
                    <div>
                      <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        id="accountName"
                        value={editForm.account_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, account_name: e.target.value }))}
                        placeholder="Enter account name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Agent Profile Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agent Profile Picture
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <ArrowUpTrayIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Upload Profile Picture</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('agentProfile', e.target.files[0])}
                          className="hidden"
                          id="agent-profile-edit"
                        />
                        <label htmlFor="agent-profile-edit" className="cursor-pointer">
                          <span className="text-xs text-gray-500">Click to upload</span>
                        </label>
                        {editForm.agentProfile && (
                          <p className="text-xs text-green-600 mt-1">File selected: {editForm.agentProfile.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        placeholder="Enter any additional notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Update Agent
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* NIN Image Modal */}
      {(showNINImages.front || showNINImages.back) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900">
                  {showNINImages.front ? 'NIN Front' : 'NIN Back'}
                </h3>
                <button
                  onClick={() => setShowNINImages({ front: false, back: false })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <img
                src={`${config.getApiBaseUrl().replace('/api', '')}/${showNINImages.front ? agent.nin_front_image : agent.nin_back_image}`}
                alt={showNINImages.front ? 'NIN Front' : 'NIN Back'}
                className="w-full h-auto rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentView;
