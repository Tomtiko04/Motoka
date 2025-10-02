import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useCarPaymentReceipt } from "../features/licenses/usePayment";
import { formatCurrency } from "../utils/formatCurrency";

export default function CarReceipt() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { data, isPending, error } = useCarPaymentReceipt(carId);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">Processing Payment</div>
          <div className="text-4xl font-bold text-blue-600 mb-2">Loading...</div>
          <div className="text-sm text-gray-500 mb-6">Kindly hold on for a second</div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-xl font-bold text-red-600 mb-4">Error loading receipt</div>
          <div className="text-sm text-gray-600 mb-6">{error.message}</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const payment = data?.payment;
  const monicreditResponse = data?.monicredit_response;

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-xl font-bold text-gray-600 mb-4">No receipt found</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Parse meta data safely
  const metaData = payment.meta_data ? 
    (typeof payment.meta_data === 'string' ? JSON.parse(payment.meta_data) : payment.meta_data) : 
    {};

  // Get payment schedules for bulk payments
  const paymentSchedules = metaData.payment_schedules || [];
  const isBulkPayment = metaData.is_bulk_payment || false;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Decorative curved band at top */}
        <div className="relative h-2 bg-gradient-to-r from-blue-600 to-green-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 rounded-t-2xl"></div>
        </div>

        {/* Success indicator */}
        <div className="text-center p-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Payment Receipt</h1>
          <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(payment.amount)}</div>
          <div className="text-base font-semibold text-gray-800 mb-1">Payment Successful</div>
          <div className="text-xs text-gray-500">Thanks for trusting us.</div>
        </div>

        {/* Transaction Details */}
        <div className="px-8 pb-8 space-y-4">
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Transaction ID:</span>
                <span className="text-sm font-medium text-gray-800">{payment.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${payment.status === "success" ? "text-green-600" : "text-red-600"} capitalize`}>{payment.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Payment Purpose:</span>
                <span className="text-sm font-medium text-gray-800">{payment.payment_description}</span>
              </div>
              {paymentSchedules.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Items:</span>
                  <span className="text-sm font-medium text-gray-800">{paymentSchedules.length} item{paymentSchedules.length > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Transaction Time:</span>
                <span className="text-sm font-medium text-gray-800">{formatTime(payment.created_at)} {formatDate(payment.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{payment.payment_gateway}</span>
              </div>
            </div>
          </div>

          {/* Payment Schedules for bulk payments */}
          {isBulkPayment && paymentSchedules.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-gray-800 mb-2">Payment Items:</h3>
              <div className="space-y-1">
                {paymentSchedules.map((schedule, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-600">{schedule.payment_head_name}:</span>
                    <span className="font-medium text-gray-800">{formatCurrency(schedule.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          {metaData.delivery_address && (
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-gray-800 mb-2">Delivery Information:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Address:</span>
                  <span className="text-sm font-medium text-gray-800 text-right max-w-xs">{metaData.delivery_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Contact:</span>
                  <span className="text-sm font-medium text-gray-800">{metaData.delivery_contact}</span>
                </div>
                {metaData.delivery_fee && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Delivery Fee:</span>
                    <span className="text-sm font-medium text-gray-800">{formatCurrency(metaData.delivery_fee)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Method Details */}
          {monicreditResponse && (
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-gray-800 mb-2">Payment Details:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Channel:</span>
                  <span className="text-sm font-medium text-gray-800">{monicreditResponse.data?.channel || 'card'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Date Paid:</span>
                  <span className="text-sm font-medium text-gray-800">{formatDate(monicreditResponse.data?.date_paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Order ID:</span>
                  <span className="text-sm font-medium text-gray-800">{monicreditResponse.orderid || payment.transaction_id}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-8 space-y-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors"
          >
            Print Receipt
          </button>
        </div>

        {/* Decorative curved band at bottom */}
        <div className="relative h-2 bg-gradient-to-r from-blue-600 to-green-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-green-500 to-green-400 rounded-b-2xl"></div>
        </div>
      </div>
    </div>
  );
}