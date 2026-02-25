import { useMutation, useQuery } from "@tanstack/react-query";
import { initializePayment as initializePaymentApi, verifyPayment as verifyPaymentApi, getPaymentHistory as getPaymentHistoryApi, getCarPaymentReceipt } from "../../services/apiPayment";
import { initializePaystackPayment } from "../../services/apiPaystack";
import toast from "react-hot-toast";

export function useInitializePayment() {
  const { mutate: startPayment, isPending: isPaymentInitializing, error, data } = useMutation({
    mutationFn: async (paymentData) => {
      try {
        // Try Monicredit first
        return await initializePaymentApi(paymentData);
      } catch (monicreditError) {
        console.warn("Primary payment gateway failed, falling back to Paystack:", monicreditError);

        try {
          const paystackResult = await initializePaystackPayment(paymentData);
          return {
            ...paystackResult,
            fallback_to_paystack: true,
            original_monicredit_error: monicreditError?.message,
          };
        } catch (paystackError) {
          console.error("Both payment gateways failed:", { monicreditError, paystackError });
          throw paystackError;
        }
      }
    },
    onSuccess: (data) => {
        console.log("payment data", data);
        // Do not redirect here. Let the caller (page component) handle navigation to /payment
        if (data?.fallback_to_paystack) {
          toast.success("Paystack initialized. Proceeding to payment page...");
        } else if (data?.status && data?.data?.authorization_url) {
          toast.success(data?.message || "Payment initialized successfully");
        }
    },
    onError: (error) => {
      console.error("Payment initialization failed:", error);
      toast.error(error.response?.data?.message || error.message || "Payment initialization failed. Please try again.");
    }
  });

  return {
    startPayment,
    isPaymentInitializing,
    error,
    data
  };
}

export function useVerifyPayment() {
  const { mutate: verifyPayment, isPending: isVerifying, error, data } = useMutation({
    mutationFn: verifyPaymentApi,
    onError: (error) => {
      // console.error("Payment verification failed:", error);
    }
  });

  return {
    verifyPayment,
    isVerifying,
    error,
    data
  };
}

export function useGetPaymentHistory() {
  const { data, isPending, error } = useQuery({
    queryKey: ["payment-history"],
    queryFn: getPaymentHistoryApi,
  });

  return { data, isPending, error };
}

export function useCarPaymentReceipt(carId) {
  const { data, isPending, error } = useQuery({
    queryKey: ["car-payment-receipt", carId],
    queryFn: () => getCarPaymentReceipt(carId),
    enabled: !!carId,
  });
  return { data, isPending, error };
}