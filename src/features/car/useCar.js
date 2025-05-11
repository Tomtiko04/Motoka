import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addCar as addCarApi, getCars as getCarsApi } from "../../services/apiCar";

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
      };
      return addCarApi(transformedData);
    },
    onSuccess: (data) => {
      toast.dismiss();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success(data.message || "Car registered successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add car");
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
      toast.error(error.message || "Failed to fetch cars");
    },
  });

  return {cars, isLoading,  error}
}
