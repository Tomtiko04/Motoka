import React, { useState, useEffect, useRef } from 'react';
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
  DocumentArrowUpIcon,
  DocumentIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';

const DOC_CATEGORIES = [
  { value: 'registration_certificate', label: 'Registration Certificate' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'roadworthiness', label: 'Roadworthiness' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'proof_of_ownership', label: 'Proof of Ownership' },
  { value: 'other', label: 'Other' },
];

const AdminOrderDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Document upload state
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('registration_certificate');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [slug]);

  // Filter agents by order location
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
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
        if (data.data?.car?.id) fetchCarDocuments(data.data.car.id);
      }
    } catch {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCarDocuments = async (carId) => {
    if (!carId) return;
    try {
      setDocsLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${config.getApiBaseUrl()}/admin/documents?car_id=${carId}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) setDocuments(data.data || []);
    } catch {
      // non-blocking
    } finally {
      setDocsLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error('Please select a file');
    if (!order?.car?.slug) return toast.error('No car associated with this order');
    try {
      setUploading(true);
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('car_slug', order.car.slug);
      formData.append('document_type', 'car');
      formData.append('document_category', uploadCategory);
      const res = await fetch(`${config.getApiBaseUrl()}/admin/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.status) {
        toast.success('Document uploaded successfully');
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchCarDocuments(order.car.id);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdating(true);
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
        await fetchOrderDetails();
        toast.success('Order status updated');
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const printOrderPDF = () => {
    const fmt = (v) => v || 'N/A';
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const fmtAmt = (n) => n ? `₦${parseFloat(n).toLocaleString()}` : 'N/A';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Order ${fmt(order?.order_number)}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; color: #111; margin: 0; padding: 24px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
      .logo { font-size: 22px; font-weight: 700; color: #2563eb; }
      .badge { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 12px; font-size: 12px; color: #1d4ed8; font-weight: 600; }
      h2 { font-size: 15px; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin: 20px 0 12px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
      .item label { display: block; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
      .item p { font-weight: 600; color: #111827; margin: 0; }
      .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 11px; color: #9ca3af; text-align: center; }
      @media print { body { padding: 16px; } }
    </style></head><body>
    <div class="header">
      <div class="logo">Motoka</div>
      <div>
        <div class="badge">Order ${fmt(order?.order_number)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:4px;text-align:right">Generated ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
      </div>
    </div>

    <h2>Order Information</h2>
    <div class="grid">
      <div class="item"><label>Order Type</label><p>${fmt(order?.order_type?.replace(/_/g,' ').toUpperCase())}</p></div>
      <div class="item"><label>Amount</label><p>${fmtAmt(order?.amount)}</p></div>
      <div class="item"><label>Status</label><p>${fmt(order?.status?.replace(/_/g,' ').toUpperCase())}</p></div>
      <div class="item"><label>Date</label><p>${fmtDate(order?.created_at)}</p></div>
    </div>

    <h2>Customer Information</h2>
    <div class="grid">
      <div class="item"><label>Name</label><p>${fmt(order?.user?.name)}</p></div>
      <div class="item"><label>Email</label><p>${fmt(order?.user?.email)}</p></div>
      <div class="item"><label>Phone</label><p>${fmt(order?.user?.phone_number)}</p></div>
    </div>

    <h2>Vehicle Information</h2>
    <div class="grid">
      <div class="item"><label>Vehicle</label><p>${fmt(order?.car?.vehicle_make)} ${fmt(order?.car?.vehicle_model)}</p></div>
      <div class="item"><label>Year</label><p>${fmt(order?.car?.vehicle_year)}</p></div>
      <div class="item"><label>Plate Number</label><p>${fmt(order?.car?.registration_no || order?.car?.plate_number)}</p></div>
      <div class="item"><label>Color</label><p>${fmt(order?.car?.vehicle_color)}</p></div>
      <div class="item"><label>Chassis No.</label><p>${fmt(order?.car?.chasis_no)}</p></div>
      <div class="item"><label>Engine No.</label><p>${fmt(order?.car?.engine_no)}</p></div>
      <div class="item"><label>Expiry Date</label><p>${fmtDate(order?.car?.expiry_date)}</p></div>
      <div class="item"><label>Registration Status</label><p>${fmt(order?.car?.registration_status?.toUpperCase())}</p></div>
    </div>

    ${order?.delivery_address ? `
    <h2>Delivery Information</h2>
    <div class="grid">
      <div class="item"><label>Address</label><p>${fmt(order?.delivery_address)}</p></div>
      <div class="item"><label>State / LGA</label><p>${fmt(order?.state_name || order?.state)}, ${fmt(order?.lga_name || order?.lga)}</p></div>
      ${order?.delivery_contact ? `<div class="item"><label>Contact</label><p>${fmt(order?.delivery_contact)}</p></div>` : ''}
    </div>` : ''}

    <h2>Payment Information</h2>
    <div class="grid">
      <div class="item"><label>Gateway</label><p>${fmt(order?.payment?.payment_gateway?.toUpperCase())}</p></div>
      <div class="item"><label>Transaction ID</label><p>${fmt(order?.payment?.transaction_id)}</p></div>
      <div class="item"><label>Payment Status</label><p>${fmt(order?.payment?.status?.toUpperCase())}</p></div>
    </div>

    <div class="footer">Motoka &bull; Generated for internal use only</div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
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
            <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              Order #{order.slug?.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={printOrderPDF}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download PDF
          </button>
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
              {order.selected_items?.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Documents Requested</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {order.selected_items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {String(item).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Plate / License Information */}
          {(order.plate_type || order.plate_sub_type || order.car?.preferred_name || order.license_type) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {order.order_type === 'driver_license' ? 'License Details' : 'Plate Details'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.plate_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plate Type</label>
                    <p className="text-sm text-gray-900">
                      {order.plate_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                )}
                {order.plate_sub_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sub Type</label>
                    <p className="text-sm text-gray-900">
                      {order.plate_sub_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                )}
                {order.car?.preferred_name && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Preferred Plate Name</label>
                    <p className="text-sm font-semibold text-gray-900">{order.car.preferred_name}</p>
                  </div>
                )}
                {order.license_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Type</label>
                    <p className="text-sm text-gray-900">
                      {order.license_type.charAt(0).toUpperCase() + order.license_type.slice(1)}
                    </p>
                  </div>
                )}
                {order.license_duration && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-sm text-gray-900">{order.license_duration}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          {order.delivery_address && (
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
              {order.delivery_contact && (
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <p className="text-sm text-gray-900">{order.delivery_contact}</p>
              </div>
              )}
            </div>
          </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Actions</h3>

            <div className="space-y-3">
              {order?.status === 'pending' && (
                <>
                  <p className="text-sm text-gray-500">
                    Mark this order as In Progress when you start processing it.
                  </p>
                  <button
                    onClick={() => handleStatusUpdate('in_progress')}
                    disabled={statusUpdating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
                  >
                    {statusUpdating ? 'Updating...' : 'Mark In Progress'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('declined')}
                    disabled={statusUpdating}
                    className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium text-sm"
                  >
                    Decline Order
                  </button>
                </>
              )}

              {order?.status === 'in_progress' && (
                <>
                  {/* Inline document upload */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <DocumentArrowUpIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Upload Document</span>
                      {documents.length > 0 && (
                        <span className="ml-auto text-xs text-gray-400">{documents.length} uploaded</span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {DOC_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => setUploadFile(e.target.files[0] || null)}
                        className="w-full text-sm text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <button
                        onClick={handleDocumentUpload}
                        disabled={uploading || !uploadFile}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {uploading ? 'Uploading…' : 'Upload'}
                      </button>
                    </div>
                    {/* Uploaded docs list */}
                    {docsLoading ? (
                      <div className="flex justify-center py-3 border-t border-gray-100">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      </div>
                    ) : documents.length > 0 && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 px-3 py-2">
                            <DocumentIcon className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="text-xs text-gray-700 flex-1 truncate">
                              {DOC_CATEGORIES.find((c) => c.value === doc.document_category)?.label || 'Document'}
                            </span>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={statusUpdating}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm"
                  >
                    {statusUpdating ? 'Updating...' : 'Mark as Completed'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('declined')}
                    disabled={statusUpdating}
                    className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium text-sm"
                  >
                    Decline Order
                  </button>
                </>
              )}

              {(order?.status === 'completed' || order?.status === 'declined') && (
                <div className={`text-center py-3 rounded-lg text-sm font-medium ${
                  order.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  Order {order.status === 'completed' ? 'Completed' : 'Declined'}
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Gateway</span>
                <span className="text-sm font-medium text-gray-900">{order.payment?.payment_gateway?.toUpperCase() || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-sm font-medium text-gray-900 break-all text-right ml-2">{order.payment?.transaction_id || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium ${order.payment?.status === 'successful' || order.payment?.status === 'SUCCESSFUL' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment?.status?.toUpperCase() || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
