// hooks/useRenew.js
import { useMutation } from "@tanstack/react-query";
import { initializePayment as initializePaymentApi } from "../../services/apiRenew";
// import { initializePayment as initializePaymentApi} from "../services/apiRenew";

export function useInitializePayment() {
  const {
    mutate: startPayment,
    isPending: isPaymentInitializing,
  } = useMutation({
    mutationFn: initializePaymentApi,
  });

  return {
    startPayment,
    isPaymentInitializing,
  };
}
