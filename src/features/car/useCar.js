import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  addCar as addCarApi,
  getCars as getCarsApi,
  updateCarDocuments as updateCarDocumentsApi,
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

      console.log("Adding car with data:", transformedData);
      return addCarApi(transformedData);
    },
    onSuccess: (data) => {
      toast.dismiss();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success(data.message || "Car registered successfully!");

      // Only remove registration token if it was used for this operation
      const registrationToken = authStorage.getRegistrationToken();
      if (registrationToken) {
        console.log("Removing registration token after successful car creation");
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
        console.log("Token invalid, clearing and redirecting to login");
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
    error,
  } = useQuery({
    queryKey: ["cars"],
    queryFn: getCarsApi,
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Failed to fetch cars",
      );
    },
  });

  return { cars, isLoading, error };
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