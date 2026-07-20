import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getPaymentMethods,
  getBanks,
  getPendingTokenizationSubscriptions,
} from "../../services/apiPaymentMethods";
import { initiateTokenization } from "../../services/apiSubscription";

export function useGetPaymentMethods() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: getPaymentMethods,
  });
  return {
    paymentMethods: data?.payment_methods || [],
    isLoading,
    error,
  };
}

export function useGetBanks() {
  const { data, isLoading } = useQuery({
    queryKey: ["banks"],
    queryFn: getBanks,
    staleTime: 60 * 60 * 1000, // 1 hour — matches server cache
  });
  return { banks: data?.banks || [], isLoading };
}

export function useGetPendingTokenizationSubscriptions() {
  const { data, isLoading } = useQuery({
    queryKey: ["pending-tokenization-subscriptions"],
    queryFn: getPendingTokenizationSubscriptions,
  });
  return { subscriptions: data?.subscriptions || [], isLoading };
}

export function useInitiateTokenization() {
  const { mutate, isLoading } = useMutation({
    mutationFn: (subscriptionId) => initiateTokenization(subscriptionId),
    onSuccess: (data) => {
      const url = data?.payment?.authorization_url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not start card setup. Try again.");
      }
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Failed to start card setup";
      toast.error(msg);
    },
  });
  return { initiateTokenization: mutate, isLoading };
}
