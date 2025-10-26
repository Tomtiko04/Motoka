import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import { usePaystackPayment } from "./usePaystackPayment";
import toast from "react-hot-toast";

export default function PaystackPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state?.paymentData;
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    initializePayment,
    verifyPayment,
    isInitializing,
    isVerifying,
    error,
  } = usePaystackPayment();

  useEffect(() => {
    if (!paymentData) {
      toast.error("No payment data found");
      navigate("/dashboard");
      return;
    }

    // Auto-initialize payment when component mounts
    handleInitializePayment();
  }, [paymentData]);

  const handleInitializePayment = async () => {
    if (!paymentData) return;

    setIsProcessing(true);
    try {
      const result = await initializePayment(paymentData);
      
      if (result?.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = result.data.authorization_url;
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error) {
      toast.error(error.message || "Failed to initialize payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    try {
      const result = await verifyPayment(reference);
      
      if (result?.status) {
        toast.success("Payment successful!");
        navigate("/payment/success", { 
          state: { 
            paymentData: result.data,
            reference: reference 
          } 
        });
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      toast.error(error.message || "Payment verification failed");
    }
  };

  // Handle Paystack callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");
    const status = urlParams.get("status");

    if (reference && status === "success") {
      handlePaymentSuccess(reference);
    } else if (status === "cancelled") {
      toast.error("Payment was cancelled");
      navigate("/payment/cancelled");
    }
  }, []);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Paystack Payment</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Payment Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">₦{parseFloat(paymentData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="flex items-center">
                  <FaCreditCard className="mr-2 text-blue-600" />
                  Paystack
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-mono text-sm">{paymentData.reference || "Generating..."}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="text-center py-8">
            {isProcessing || isInitializing ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing payment...</p>
                <p className="text-sm text-gray-500 mt-2">You will be redirected to Paystack shortly</p>
              </div>
            ) : isVerifying ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Verifying payment...</p>
              </div>
            ) : error ? (
              <div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">✗</span>
                </div>
                <p className="text-red-600 mb-4">Payment failed</p>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                  onClick={handleInitializePayment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCreditCard className="text-blue-600 text-xl" />
                </div>
                <p className="text-gray-600">Redirecting to Paystack...</p>
                <p className="text-sm text-gray-500 mt-2">Please complete your payment on the next page</p>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You will be redirected to Paystack's secure payment page</li>
              <li>• Complete your payment using your preferred method</li>
              <li>• You will be redirected back after successful payment</li>
              <li>• Your payment is secure and encrypted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
