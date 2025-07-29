import { useMutation, useQuery } from "@tanstack/react-query";
import { initializePayment as initializePaymentApi, verifyPayment as verifyPaymentApi, getPaymentHistory as getPaymentHistoryApi, getCarPaymentReceipt } from "../../services/apiPayment";
import toast from "react-hot-toast";

export function useInitializePayment() {
  const { mutate: startPayment, isPending: isPaymentInitializing, error, data } = useMutation({
    mutationFn: initializePaymentApi,
    onSuccess: (data) => {
        console.log("payment data",data);
        toast.success(data.message);
      if (data.status && data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      }
    },
    onError: (error) => {
      console.error("Payment initialization failed:", error);
      toast.error(error?.message);
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
      console.error("Payment verification failed:", error);
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