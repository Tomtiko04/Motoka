import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPaymentReceipt } from "../services/apiPayment";
import { formatCurrency } from "../utils/formatCurrency";

export default function PaymentReceipt() {
  const { paymentType, identifier } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // If paymentType is not in URL, try to get from location state or fallback
  const finalPaymentType =
    paymentType || location.state?.paymentType || "vehicle_paper";
  const finalIdentifier = identifier || location.state?.identifier;

  const { data, isPending, error } = useQuery({
    queryKey: ["payment-receipt", finalPaymentType, finalIdentifier],
    queryFn: () => getPaymentReceipt(finalPaymentType, finalIdentifier),
    enabled: !!finalIdentifier,
  });

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-2xl font-bold text-blue-600">
            Processing Payment
          </div>
          <div className="mb-2 text-4xl font-bold text-blue-600">
            Loading...
          </div>
          <div className="mb-6 text-sm text-gray-500">
            Kindly hold on for a second
          </div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-xl font-bold text-red-600">
            Error loading receipt
          </div>
          <div className="mb-6 text-sm text-gray-600">{error.message}</div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
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
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-xl font-bold text-gray-600">
            No receipt found
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
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
      hour12: true,
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Parse meta data safely
  const metaData = payment.meta_data
    ? typeof payment.meta_data === "string"
      ? JSON.parse(payment.meta_data)
      : payment.meta_data
    : {};

  // Get payment schedules for bulk payments
  const paymentSchedules = metaData.payment_schedules || [];
  const isBulkPayment = metaData.is_bulk_payment || false;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Decorative curved band at top */}
        <div className="relative h-2 bg-gradient-to-r from-blue-600 to-green-500">
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-green-500"></div>
        </div>

        {/* Success indicator */}
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-800">
            Payment Receipt
          </h1>
          <div className="mb-2 text-3xl font-bold text-blue-600">
            {formatCurrency(payment.amount)}
          </div>
          <div className="mb-1 text-base font-semibold text-gray-800">
            Payment Successful
          </div>
          <div className="text-xs text-gray-500">Thanks for trusting us.</div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-4 px-8 pb-8">
          <div className="rounded-lg bg-gray-50 p-5">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Transaction ID:</span>
                <span className="text-sm font-medium text-gray-800">
                  {payment.transaction_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Status:</span>
                <span
                  className={`text-sm font-medium ${payment.status === "completed" ? "text-green-600" : payment.status === "pending" ? "text-yellow-600" : "text-red-600"} capitalize`}
                >
                  {payment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Payment Purpose:</span>
                <span className="text-sm font-medium text-gray-800">
                  {payment.payment_description}
                </span>
              </div>
              {paymentSchedules.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Items:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {paymentSchedules.length} item
                    {paymentSchedules.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Transaction Time:</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatTime(payment.created_at)}{" "}
                  {formatDate(payment.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium text-gray-800 capitalize">
                  {payment.payment_gateway || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Schedules for bulk payments */}
          {isBulkPayment && paymentSchedules.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-5">
              <h3 className="mb-2 text-xs font-semibold text-gray-800">
                Payment Items:
              </h3>
              <div className="space-y-1">
                {paymentSchedules.map((schedule, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {schedule.payment_head_name}:
                    </span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(schedule.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          {metaData.delivery_address && (
            <div className="rounded-lg bg-gray-50 p-5">
              <h3 className="mb-2 text-xs font-semibold text-gray-800">
                Delivery Information:
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Address:</span>
                  <span className="max-w-xs text-right text-sm font-medium text-gray-800">
                    {metaData.delivery_address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Contact:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {metaData.delivery_contact}
                  </span>
                </div>
                {metaData.delivery_fee && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Delivery Fee:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatCurrency(metaData.delivery_fee)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Method Details */}
          {monicreditResponse && (
            <div className="rounded-lg bg-gray-50 p-5">
              <h3 className="mb-2 text-xs font-semibold text-gray-800">
                Payment Details:
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Channel:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {monicreditResponse.data?.channel || "Bank Transfer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Date Paid:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(monicreditResponse.data?.date_paid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Order ID:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {monicreditResponse.orderid || payment.transaction_id}
                  </span>
                </div>
                {monicreditResponse.data?.customer && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">
                        Account Number:
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {monicreditResponse.data.customer.account_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Bank Name:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {monicreditResponse.data.customer.bank_name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 px-8 pb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="w-full rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
          >
            Print Receipt
          </button>
        </div>

        {/* Decorative curved band at bottom */}
        <div className="relative h-2 bg-gradient-to-r from-blue-600 to-green-500">
          <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-r from-blue-600 via-green-500 to-green-400"></div>
        </div>
      </div>
    </div>
  );
}
