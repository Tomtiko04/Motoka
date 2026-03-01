import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  addCar as addCarApi,
  getCars as getCarsApi,
  updateCarDocuments as updateCarDocumentsApi,
  getPlateNumberPrices as getPlateNumberPricesApi,
} from "../../services/apiCar";
import { authStorage } from "../../utils/authStorage";

export function useAddCar() {
  const queryClient = useQueryClient();
  const { mutate: addCar, isLoading: isAdding } = useMutation({
    mutationFn: (formData) => {
      const transformedData = {
        name_of_owner: formData.ownerName || null,
        phone_number: formData.phoneNo || null,
        address: formData.address || null,
        vehicle_make: formData.vehicleMake || null,
        vehicle_model: formData.vehicleModel || null,
        registration_status: formData.isRegistered
          ? "registered"
          : "unregistered",
        chasis_no: formData.chassisNo || null,
        engine_no: formData.engineNo || null,
        vehicle_year: formData.vehicleYear || null,
        vehicle_color: formData.vehicleColor || null,
        status: "active",
        registration_no: formData.registrationNo || null,
        date_issued: formData.dateIssued || null,
        expiry_date: formData.expiryDate || null,
        car_type: formData.carType || null,
      };

      return addCarApi(transformedData);
    },
    onSuccess: (data) => {
      toast.dismiss();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success(data.message || "Car registered successfully!");

      // Only remove registration token if it was used for this operation
      const registrationToken = authStorage.getRegistrationToken();
      if (registrationToken) {
        authStorage.removeRegistrationToken();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to add car";
      toast.error(errorMessage);

      // Only redirect to login if not using registration token
      const registrationToken = authStorage.getRegistrationToken();
      if (error.response?.status === 401 && !registrationToken) {
        authStorage.clearAll();
        window.location.href = "/auth/login";
      }
    },
  });

  return { addCar, isAdding };
}

export function useGetCars() {
  const {
    data: cars,
    isLoading,
    isPending,
    error,
  } = useQuery({
    queryKey: ["cars"],
    queryFn: getCarsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Failed to fetch cars",
      );
    },
  });

  return { cars, isLoading: isLoading || isPending, error };
}

/**
 * Fetches all active plate number prices from the backend.
 * Returns a helper `getPrice(plateType, subType)` for easy lookup.
 */
export function usePlateNumberPrices() {
  const { data: prices = [], isLoading } = useQuery({
    queryKey: ["plate-number-prices"],
    queryFn: getPlateNumberPricesApi,
    staleTime: 10 * 60 * 1000, // prices rarely change – cache for 10 min
    onError: () => {
      // Silently fail; the UI will fall back to showing "—"
    },
  });

  const getPrice = (plateType, subType = null) => {
    const row = prices.find(
      (p) =>
        p.plate_type === plateType &&
        (subType ? p.sub_type === subType : p.sub_type === null),
    );
    return row ? row.price : null;
  };

  return { prices, isLoading, getPrice };
}

export function useUpdateCarDocuments() {
  const queryClient = useQueryClient();
  const { mutate: updateCarDocuments, isLoading: isUpdating } = useMutation({
    mutationFn: ({ carSlug, formData: carData }) =>
      updateCarDocumentsApi(carSlug, carData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success(data.message || "Documents updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update documents";
      toast.error(errorMessage);
    },
  });

  return { updateCarDocuments, isUpdating };
}