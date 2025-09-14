import { useMutation } from "@tanstack/react-query";
import { initializePaystackPayment, verifyPaystackPayment } from "../../services/apiPaystack";
import { toast } from "react-hot-toast";

export function usePaystackPayment() {
  const { mutate: initializePayment, isPending: isInitializing, error: initError } = useMutation({
    mutationFn: (paymentData) => initializePaystackPayment(paymentData),
    onSuccess: (response) => {
      // Handle the nested response structure from backend
      const data = response.data || response;
      const authorizationUrl = data.data?.authorization_url || data.authorization_url;
      
      if (authorizationUrl) {
        toast.success("Redirecting to Paystack for payment...");
        // Open Paystack in a new window/tab
        const paystackWindow = window.open(authorizationUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        // Store window reference for later closing
        window.paystackWindow = paystackWindow;
        
        // Listen for payment success message from callback page
        window.addEventListener('message', (event) => {
          if (event.data.type === 'PAYMENT_SUCCESS') {
            // Payment was successful, close the Paystack window
            if (window.paystackWindow) {
              window.paystackWindow.close();
              window.paystackWindow = null;
            }
            // Verify the payment
            verifyPayment(event.data.reference);
          } else if (event.data.type === 'PAYMENT_ERROR') {
            // Payment failed, close the Paystack window
            if (window.paystackWindow) {
              window.paystackWindow.close();
              window.paystackWindow = null;
            }
          }
        });
        
        // Focus the new window
        if (paystackWindow) {
          paystackWindow.focus();
        }
      } else {
        toast.error("No payment URL received. Please try again.");
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to initialize payment. Please try again.";
      toast.error(errorMessage);
    },
  });

  const { mutate: verifyPayment, isPending: isVerifying, error: verifyError } = useMutation({
    mutationFn: (reference) => verifyPaystackPayment(reference),
    onSuccess: (response) => {
      // Handle the nested response structure from backend
      const data = response.data || response;
      const responseData = data.data || data;
      
      if (responseData.status === 'success' || data.status === true) {
        toast.success(responseData.message || data.message || "Payment verified successfully!");
        
        // Close any Paystack windows that might be open
        if (window.paystackWindow) {
          window.paystackWindow.close();
          window.paystackWindow = null;
        }
        
        // Redirect to success page or dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        toast.error(responseData.message || data.message || "Payment verification failed. Please contact support.");
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to verify payment. Please try again.";
      toast.error(errorMessage);
    },
  });

  return {
    initializePayment,
    verifyPayment,
    isInitializing,
    isVerifying,
    error: initError || verifyError,
  };
}
