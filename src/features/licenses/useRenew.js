import { useMutation, useQuery } from "@tanstack/react-query";
import { initializePayment as initializePaymentApi } from "../../services/apiRenew";
import {
  getAllLocalGovernment as getAllLocalGovernmentApi,
  getAllState as getAllStateApi,
} from "../../services/apiAddress";
// import { initializePayment as initializePaymentApi} from "../services/apiRenew";

export function useInitializePayment() {
  const { mutate: startPayment, isPending: isPaymentInitializing } =
    useMutation({
      mutationFn: initializePaymentApi,
      onSuccess: (data) => {
        if (data.status && data.data.authorization_url) {
          // Redirect to Paystack checkout page
          window.location.href = data.data.authorization_url;
        }
      },
    });

  return {
    startPayment,
    isPaymentInitializing,
  };
}

export function useGetState() {
  const { data, isPending } = useQuery({
    queryKey: ["states"],
    queryFn: getAllStateApi,
  });

  return { data, isPending };
}

export function useGetLocalGovernment() {
  const { data, isPending } = useQuery({
    queryKey: ["LG"],
    queryFn: getAllLocalGovernmentApi,
  });

  return { data, isPending };
}
