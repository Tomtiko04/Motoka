import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createDriverLicense as createDriverLicenseApi,
  getDriverLicenses as getDriverLicensesApi,
  getDriverLicenseById as getDriverLicenseByIdApi,
  updateDriverLicense as updateDriverLicenseApi,
  deleteDriverLicense as deleteDriverLicenseApi,
} from "../../services/apiLicense";
import toast from "react-hot-toast";

export function useCreateDriverLicense() {
  const {
    mutate: createLicense,
    isPending: isCreating,
    error,
  } = useMutation({
    mutationFn: createDriverLicenseApi,
    onSuccess: (data) => {
      console.log("License creation successful:", data);
      toast.success(data.message || "Driver license created successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to create driver license",
      );
    },
  });

  return {
    createLicense,
    isCreating,
    error,
  };
}

export function useGetDriverLicenses() {
  const { data, isPending, error } = useQuery({
    queryKey: ["driver-licenses"],
    queryFn: getDriverLicensesApi,
  });

  return { data, isPending, error };
}

export function useGetDriverLicenseById(id) {
  const { data, isPending, error } = useQuery({
    queryKey: ["driver-license", id],
    queryFn: () => getDriverLicenseByIdApi(id),
    enabled: !!id,
  });

  return { data, isPending, error };
}

export function useUpdateDriverLicense() {
  const {
    mutate: updateLicense,
    isPending: isUpdating,
    error,
    data,
  } = useMutation({
    mutationFn: ({ id, formData }) => updateDriverLicenseApi(id, formData),
    onSuccess: (data) => {
      console.log("License update successful:", data);
      toast.success(data.message || "Driver license updated successfully");
    },
    onError: (error) => {
      console.error("License update failed:", error);
      toast.error(error.response.data.message || "Failed to update driver license");
    },
  });

  return {
    updateLicense,
    isUpdating,
    error,
    data,
  };
}

export function useDeleteDriverLicense() {
  const {
    mutate: deleteLicense,
    isPending: isDeleting,
    error,
    data,
  } = useMutation({
    mutationFn: deleteDriverLicenseApi,
    onSuccess: (data) => {
      console.log("License deletion successful:", data);
      toast.success(data.message || "Driver license deleted successfully");
    },
    onError: (error) => {
      console.error("License deletion failed:", error);
      toast.error(
        error.response.data.message || "Failed to delete driver license",
      );
    },
  });

  return {
    deleteLicense,
    isDeleting,
    error,
    data,
  };
}
