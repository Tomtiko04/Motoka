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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-semibold text-[#2284DB]">Loading receipt...</div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2284DB] border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold text-red-600">Error loading receipt</div>
          <div className="text-sm text-gray-600">{error.message}</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-full bg-[#2284DB] px-6 py-2 text-white hover:bg-[#1B6CB3]"
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold text-gray-600">No receipt found</div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full bg-[#2284DB] px-6 py-2 text-white hover:bg-[#1B6CB3]"
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mt-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-1/2 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
          >
            <IoIosArrowBack className="h-5 w-5" />
          </button>
          <h1 className="text-center text-2xl font-medium text-[#05243F]">
            Payment Receipt
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl rounded-[20px] bg-[#F9FAFC] p-8 shadow-sm">
        {/* Success Status */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-600">Payment Successful!</h2>
          <p className="text-sm text-gray-600">Your payment has been processed successfully</p>
        </div>

        {/* Receipt Details */}
        <div className="space-y-6">
          {/* Transaction Info */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#05243F]">Transaction Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transaction ID:</span>
                <span className="font-medium text-[#05243F]">{payment.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold text-[#2284DB]">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="font-medium text-green-600 capitalize">{payment.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="font-medium text-[#05243F]">{payment.payment_description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="font-medium text-[#05243F]">{formatDate(payment.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          {monicreditResponse && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-[#05243F]">Payment Method</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Channel:</span>
                  <span className="font-medium text-[#05243F]">{monicreditResponse.data?.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date Paid:</span>
                  <span className="font-medium text-[#05243F]">{formatDate(monicreditResponse.data?.date_paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order ID:</span>
                  <span className="font-medium text-[#05243F]">{monicreditResponse.orderid}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Information */}
          {payment.meta_data && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-[#05243F]">Delivery Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="font-medium text-[#05243F] text-right max-w-xs">
                    {JSON.parse(payment.meta_data).delivery_address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Contact:</span>
                  <span className="font-medium text-[#05243F]">{JSON.parse(payment.meta_data).delivery_contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivery Fee:</span>
                  <span className="font-medium text-[#05243F]">{formatCurrency(JSON.parse(payment.meta_data).delivery_fee)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 rounded-full bg-[#2284DB] py-3 text-center text-white font-semibold hover:bg-[#1B6CB3] transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-full border border-[#2284DB] py-3 text-center text-[#2284DB] font-semibold hover:bg-[#2284DB] hover:text-white transition-colors"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </>
  );
} 