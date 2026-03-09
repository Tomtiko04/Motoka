import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDriversLicense,
  getDriversLicensePaymentOptions,
} from "../../../services/apiDriversLicense";

export function useDriverLicensePrices() {
  const { data: prices, isLoading, error } = useQuery({
    queryKey: ["driver-license-prices"],
    queryFn: getDriversLicensePaymentOptions,
  });

  return { prices, isLoading, error };
}

export function useDriversLicensePaymentOptions() {
  const {
    data: isPaymentOptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["driver-license-prices"],
    queryFn: getDriversLicensePaymentOptions,
  });

  return { isPaymentOptions, isLoading, error };
}

export function useCreateDriverLicense() {
  const queryClient = useQueryClient();

  const { mutate: createLicense, isPending: isCreating } = useMutation({
    mutationFn: createDriversLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-license-application"] });
    },
  });

  return { createLicense, isCreating };
}
