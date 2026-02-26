import { useMutation, useQuery } from "@tanstack/react-query";
import { initializePayment as initializePaymentApi, verifyPayment as verifyPaymentApi, getPaymentHistory as getPaymentHistoryApi, getCarPaymentReceipt } from "../../services/apiPayment";
import toast from "react-hot-toast";

export function useInitializePayment() {
  const { mutate: startPayment, isPending: isPaymentInitializing, error, data, reset } = useMutation({
    mutationFn: (paymentData) => initializePaymentApi(paymentData),
    onError: (error) => {
      console.error("Payment initialization failed:", error);
      const msg = error.response?.data?.message || error.message || "";
      // Only show toast for non-phone errors; phone errors are handled inline in the UI
      if (!msg.toLowerCase().includes("phone")) {
        toast.error(msg || "Failed to initialize payment. Please try again.");
      }
    }
  });

  return {
    startPayment,
    isPaymentInitializing,
    error,
    data,
    reset
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