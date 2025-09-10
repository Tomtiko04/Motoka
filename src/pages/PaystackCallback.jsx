import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPaystackPayment } from '../services/apiPaystack';
import { toast } from 'react-hot-toast';

export default function PaystackCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');

    if (!reference) {
      toast.error('No payment reference found');
      if (window.opener) {
        window.opener.postMessage({ type: 'PAYMENT_ERROR' }, '*');
        window.close();
      }
      return;
    }

    if (status === 'cancelled') {
      toast.error('Payment was cancelled');
      if (window.opener) {
        window.opener.postMessage({ type: 'PAYMENT_ERROR' }, '*');
        window.close();
      }
      return;
    }

    // Verify the payment
    if (reference) {
      verifyPaystackPayment(reference)
        .then((response) => {
          const data = response.data || response;
          const responseData = data.data || data;
          
          if (responseData.status === 'success' || data.status === true) {
            setIsProcessing(false);
            toast.success('Payment verified successfully!');
            
            // Send success message to parent window
            if (window.opener) {
              window.opener.postMessage({ type: 'PAYMENT_SUCCESS', reference }, '*');
            }
            
            // Close the window after a short delay
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            setIsProcessing(false);
            toast.error('Payment verification failed');
            
            // Send error message to parent window
            if (window.opener) {
              window.opener.postMessage({ type: 'PAYMENT_ERROR' }, '*');
            }
            
            // Close the window after a short delay
            setTimeout(() => {
              window.close();
            }, 2000);
          }
        })
        .catch((error) => {
          setIsProcessing(false);
          const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
          toast.error(errorMessage);
          
          // Send error message to parent window
          if (window.opener) {
            window.opener.postMessage({ type: 'PAYMENT_ERROR' }, '*');
          }
          
          // Close the window after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isProcessing ? 'Processing Payment...' : 'Payment Complete'}
        </h2>
        <p className="text-gray-600">
          {isProcessing 
            ? 'Please wait while we verify your payment' 
            : 'You will be redirected shortly'
          }
        </p>
      </div>
    </div>
  );
}
