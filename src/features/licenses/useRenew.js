// hooks/useRenew.js
import { useMutation } from "@tanstack/react-query";
import { initializePayment as initializePaymentApi } from "../../services/apiRenew";
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
