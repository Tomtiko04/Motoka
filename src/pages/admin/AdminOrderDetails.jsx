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
  EnvelopeIcon,
  DocumentArrowUpIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';
import PaymentModal from '../../components/admin/PaymentModal';

const AdminOrderDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agents, setAgents] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sendingDocuments, setSendingDocuments] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState('');
  const [currentDocumentFile, setCurrentDocumentFile] = useState(null);
  const [uploadedDocumentTypes, setUploadedDocumentTypes] = useState([]);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAgentForPayment, setSelectedAgentForPayment] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    fetchAgents();
  }, [slug]);

  useEffect(() => {
    if (order?.order_type) {
      fetchDocumentTypes();
      fetchOrderDocuments();
    }
  }, [order?.order_type]);

  // Filter agents by order location
  const getAgentsForOrderLocation = () => {
    if (!order || !agents.length) return [];
    
    // Get the order's state (assuming order has state field)
    const orderState = order.state_name || order.state;
    if (!orderState) return [];
    
    // Filter agents by state
    return agents.filter(agent => agent.state === orderState);
  };

  const availableAgents = getAgentsForOrderLocation();

  // Auto-select agent if only one is available, or reset if not available
  useEffect(() => {
    if (availableAgents.length === 1 && !selectedAgent) {
      // Auto-select the only available agent
      setSelectedAgent(availableAgents[0].id.toString());
    } else if (selectedAgent && availableAgents.length > 0) {
      // Check if currently selected agent is still available
      const isSelectedAgentAvailable = availableAgents.some(agent => agent.id.toString() === selectedAgent);
      if (!isSelectedAgentAvailable) {
        setSelectedAgent('');
      }
    } else if (availableAgents.length === 0) {
      // No agents available, clear selection
      setSelectedAgent('');
    }
  }, [availableAgents, selectedAgent]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${slug}?v=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setOrder(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setAgents(data.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch agents');
    }
  };

  const handleProcessOrder = () => {
    if (!selectedAgent || availableAgents.length === 0) return;

    // Find the selected agent details from available agents
    const agent = availableAgents.find(a => a.id.toString() === selectedAgent);
    if (!agent) {
      toast.error('Selected agent not found or not available for this location');
      return;
    }

    // Set the selected agent and show payment modal
    setSelectedAgentForPayment(agent);
    setShowPaymentModal(true);
  };

  const handlePaymentInitiated = async (paymentData) => {
    // Close the payment modal
    setShowPaymentModal(false);
    setSelectedAgentForPayment(null);
    
    // Refresh the order details to get the updated status
    await fetchOrderDetails();
    
    toast.success('Order processed successfully! Agent has been notified.');
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
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
        setOrder(data.data);
        // Refetch all related data after status update
        await fetchOrderDetails();
        await fetchOrderDocuments();
        toast.success('Order status updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
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

  const fetchDocumentTypes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!order?.order_type) {
        return;
      }

      const apiUrl = `${config.getApiBaseUrl()}/admin/document-types?order_type=${order.order_type}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status && data.data) {
        setDocumentTypes(data.data);
      } else {
        setDocumentTypes([]);
      }
    } catch (error) {
      toast.error('Failed to fetch document types');
      setDocumentTypes([]);
    }
  };

  const fetchOrderDocuments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${slug}/documents?v=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setDocuments(data.data);
        // Update uploaded document types based on existing documents
        const uploadedTypes = data.data.map(doc => doc.document_type);
        setUploadedDocumentTypes(uploadedTypes);
      }
    } catch (error) {
      toast.error('Failed to fetch order documents');
    }
  };

  const handleDocumentUpload = async () => {
    if (uploadedDocuments.length === 0) {
      toast.error('Please select documents to upload');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      uploadedDocuments.forEach((doc, index) => {
        formData.append(`documents[${index}][file]`, doc.file);
        formData.append(`documents[${index}][document_type]`, doc.documentType);
      });

      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${slug}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.status) {
        toast.success('Documents uploaded successfully');
        setUploadedDocuments([]);
        fetchOrderDocuments();
      } else {
        toast.error(data.message || 'Failed to upload documents');
      }
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleSendDocuments = async () => {
    if (documents.length === 0) {
      toast.error('No documents to send');
      return;
    }

    setSendingDocuments(true);
    const loadingToast = toast.loading('Sending documents...');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${slug}/send-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `Your ${order.order_type?.replace('_', ' ').toUpperCase()} Documents - Motoka`,
          message: `Dear ${order.user?.first_name || 'Customer'},\n\nPlease find attached the documents for your ${order.order_type?.replace('_', ' ').toUpperCase()} order. These documents are required for your application and have been processed by our team.\n\nOrder Details:\n- Order ID: ${order.slug}\n- Order Type: ${order.order_type?.replace('_', ' ').toUpperCase()}\n- Amount: ₦${order.amount?.toLocaleString()}\n\nIf you have any questions about these documents, please contact our support team.\n\nBest regards,\nMotoka Team`
        })
      });

      const data = await response.json();
      
      if (data.status) {
        toast.dismiss(loadingToast);
        toast.success(`Documents sent successfully to ${data.data?.user_email || order.user?.email}`);
        // Refresh order data to update documents_sent_at
        await fetchOrderDetails();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || 'Failed to send documents');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error sending documents');
    } finally {
      setSendingDocuments(false);
    }
  };

  const addDocument = (documentType, file) => {
    setUploadedDocuments(prev => [...prev, { documentType, file }]);
  };

  const removeDocument = (index) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentTypeSelect = (docType) => {
    setCurrentDocumentType(docType);
    setCurrentDocumentFile(null);
    // Reset the file input by clearing its value
    const fileInput = document.getElementById('document-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFileSelect = (file) => {
    setCurrentDocumentFile(file);
  };

  const handleUploadCurrentDocument = async () => {
    if (!currentDocumentType || !currentDocumentFile) return;

    const loadingToast = toast.loading('Uploading document...');
    
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('documents[0][document_type]', currentDocumentType);
      formData.append('documents[0][file]', currentDocumentFile);

      const response = await fetch(`${config.getApiBaseUrl()}/admin/orders/${slug}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.status) {
        toast.dismiss(loadingToast);
        toast.success('Document uploaded successfully');
        
        // Add to uploaded document types
        setUploadedDocumentTypes(prev => [...prev, currentDocumentType]);
        
        // Reset current selection
        setCurrentDocumentType('');
        setCurrentDocumentFile(null);
        
        // Refresh documents list
        fetchOrderDocuments();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || 'Failed to upload document');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error uploading document');
    }
  };

  const getRemainingDocumentTypes = () => {
    const remaining = documentTypes.filter(docType => 
      !uploadedDocumentTypes.includes(docType.document_name)
    );
    return remaining;
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
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
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
            
            {order?.status === 'pending' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Agent
                  </label>
                  {availableAgents.length > 0 ? (
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select an agent for {order?.state_name || order?.state}</option>
                      {availableAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.first_name} {agent.last_name} - {agent.state}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-sm text-gray-500">
                      <select disabled className="w-full bg-transparent text-gray-500 cursor-not-allowed">
                        <option>No agents available for {order?.state_name || order?.state}</option>
                      </select>
                    </div>
                  )}
                  {availableAgents.length === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      No agents are available for this location ({order?.state_name || order?.state}). 
                      Please create an agent for this state first.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleProcessOrder}
                  disabled={!selectedAgent || processing || availableAgents.length === 0}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 
                   availableAgents.length === 0 ? 'No Agents Available' : 
                   'Process Order'}
                </button>
              </div>
            )}

            {order?.status === 'in_progress' && (
              <div className="space-y-4">
                {/* Document Upload Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Documents</h4>
                  
                  {/* Document Type Selection */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Select Document Type</label>
                    <select
                      value={currentDocumentType}
                      onChange={(e) => handleDocumentTypeSelect(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose document type...</option>
                      {getRemainingDocumentTypes().map((docType) => (
                        <option key={docType.id} value={docType.document_name}>
                          {docType.document_name}
                        </option>
                      ))}
                    </select>
                    {/* Debug info */}
                    <div className="text-xs text-gray-400 mt-1">
                      Debug: {documentTypes.length} document types loaded, {getRemainingDocumentTypes().length} remaining
                    </div>
                  </div>

                  {/* File Upload */}
                  {currentDocumentType && (
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">Upload File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          key={currentDocumentType} // Force reset when document type changes
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                          className="hidden"
                          id="document-upload"
                        />
                        <label htmlFor="document-upload" className="cursor-pointer">
                          <DocumentArrowUpIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {currentDocumentFile ? currentDocumentFile.name : 'Click to select file'}
                          </p>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {currentDocumentType && currentDocumentFile && (
                    <button
                      onClick={handleUploadCurrentDocument}
                      disabled={uploading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                  )}

                  {/* Uploaded Documents List */}
                  {uploadedDocumentTypes.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-xs font-medium text-gray-600 mb-2">Uploaded Documents:</h5>
                      <div className="space-y-1">
                        {uploadedDocumentTypes.map((docType, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded text-xs">
                            <span className="text-green-800">{docType}</span>
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Send Documents Button */}
                  {documents.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={handleSendDocuments}
                        disabled={sendingDocuments}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
                      >
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        {sendingDocuments ? 'Sending...' : 'Send to User'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Completion Buttons */}
                {documents.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-3">
                      {order.documents_sent_at 
                        ? "Documents have been sent to the user. You can now complete or decline this order."
                        : "Documents uploaded. You must send documents to the user before completing this order."
                      }
                    </div>
                    <div className="space-y-2">
                <button
                  onClick={() => handleStatusUpdate('completed')}
                        className={`w-full py-2 px-4 rounded-lg text-sm ${
                          order.documents_sent_at 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                        disabled={!order.documents_sent_at}
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => handleStatusUpdate('declined')}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm"
                >
                  Mark as Declined
                </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {order.agent && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Agent</h4>
                <div className="text-sm text-gray-600">
                  <p>{order.agent.first_name} {order.agent.last_name}</p>
                  <p>{order.agent.email}</p>
                  <p>{order.agent.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Gateway</span>
                <span className="text-sm text-gray-900">{order.payment?.payment_gateway?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-sm text-gray-900">{order.payment?.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm text-gray-900">{order.payment?.status?.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Documents Sent - Only show for completed orders with documents */}
          {order?.status === 'completed' && documents.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentArrowUpIcon className="h-5 w-5 mr-2 text-green-600" />
                Documents Sent to Customer
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  <p className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                    {documents.length} document{documents.length > 1 ? 's' : ''} sent to {order.user?.email}
                  </p>
                </div>
                
                <div className="grid gap-3">
                  {documents.map((document, index) => {
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentArrowUpIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {document.document_type?.replace('_', ' ').toUpperCase() || 'Document'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(document.created_at).toLocaleDateString('en-GB')} at {new Date(document.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Sent
                          </span>
                          <a
                            href={`${window.location.protocol}//${window.location.hostname}:8000/${document.file_path}?v=${Date.now()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            View
                          </a>
                        </div>
                      </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All documents have been sent to the customer's email address. 
                    The customer can download these documents from their email.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedAgentForPayment(null);
        }}
        order={order}
        agent={selectedAgentForPayment}
        onPaymentInitiated={handlePaymentInitiated}
      />
    </div>
  );
};

export default AdminOrderDetails;
