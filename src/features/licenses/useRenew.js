import { useMutation } from "@tanstack/react-query";
import { initializePayment as initializePaymentApi } from "../../services/apiRenew";

export function initializePayment() {
  const { mutate: isInitialize, isLoading: isInitializeLoading } = useMutation({
    mutationFn: initializePaymentApi,
  });

  return {
    isInitialize,
    isInitializeLoading,
  };
}
