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

    // This page can be reached two ways:
    //   1. As a popup opened by PaymentOptions — window.opener exists, so we
    //      postMessage the result back and close the popup.
    //   2. As a full-tab redirect (popup blocked, or Paystack redirected the
    //      same tab) — window.opener is null, so we must navigate the user
    //      ourselves. Previously this case left the user stranded on the
    //      spinner forever.
    const hasOpener = !!window.opener;

    // Resolve the flow: message the opener + close, OR navigate this tab.
    const finish = (ok, ref) => {
      if (hasOpener) {
        window.opener.postMessage(
          ok
            ? { type: 'PAYMENT_SUCCESS', reference: ref, ordersCreated: true }
            : { type: 'PAYMENT_ERROR' },
          '*'
        );
        setTimeout(() => window.close(), 1500);
      } else {
        setTimeout(() => {
          navigate(ok ? '/dashboard' : '/payment', {
            replace: true,
            state: ok ? { paymentSuccess: true, reference: ref } : undefined,
          });
        }, 1500);
      }
    };

    if (!reference) {
      toast.error('No payment reference found');
      setIsProcessing(false);
      finish(false);
      return;
    }

    if (status === 'cancelled') {
      toast.error('Payment was cancelled');
      setIsProcessing(false);
      finish(false, reference);
      return;
    }

    // Verify the payment
    verifyPaystackPayment(reference)
      .then((response) => {
        const data = response.data || response;
        const responseData = data.data || data;

        if (responseData.status === 'success' || data.status === true) {
          setIsProcessing(false);
          toast.success('Payment verified successfully!');
          finish(true, reference);
        } else {
          setIsProcessing(false);
          toast.error('Payment verification failed');
          finish(false, reference);
        }
      })
      .catch((error) => {
        setIsProcessing(false);
        const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
        toast.error(errorMessage);
        finish(false, reference);
      });
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
