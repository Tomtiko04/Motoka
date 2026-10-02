import { useMutation } from '@tanstack/react-query';
import { verifyPaystackPayment } from '../../../services/apiPayment';
import { toast } from 'react-hot-toast';

export function usePaymentVerification() {
  const verifyPaystack = useMutation({
    mutationFn: async (reference) => {
      const response = await verifyPaystackPayment(reference);
      return response;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to verify payment');
    }
  });

  return {
    verifyPaystack
  };
}