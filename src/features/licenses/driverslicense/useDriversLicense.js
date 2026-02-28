import { useQuery } from "@tanstack/react-query";
import { getDriverLicensePrices } from "../../../services/apiDriversLicense";

export function useDriverLicensePrices() {
  const { data: prices, isLoading, error } = useQuery({
    queryKey: ["driver-license-prices"],
    queryFn: getDriverLicensePrices,
  });

  return { prices, isLoading, error };
}
