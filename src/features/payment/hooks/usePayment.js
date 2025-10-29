import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PAYMENT_TYPES, PAYMENT_METHODS } from '../config/paymentTypes';

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeMethod, setActiveMethod] = useState(null);

  const validatePaymentData = (paymentType, paymentData) => {
    const config = PAYMENT_CONFIG[paymentType];
    if (!config) {
      throw new Error(`Invalid payment type: ${paymentType}`);
    }

    const missingFields = config.requiredFields.filter(
      field => !paymentData[field]
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return true;
  };

  const processPayment = async (paymentType, paymentData, method) => {
    try {
      setIsProcessing(true);
      setError(null);
      setActiveMethod(method);

      validatePaymentData(paymentType, paymentData);

      const paymentSession = {
        type: paymentType,
        method,
        data: paymentData,
        timestamp: Date.now(),
      };
      
      sessionStorage.setItem('currentPayment', JSON.stringify(paymentSession));

      window.location.href = `/payment?type=${paymentType}`;
      
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    activeMethod,
    processPayment,
  };
}