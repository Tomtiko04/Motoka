import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createDriversLicense as createDriversLicenseApi } from "../../../services/apiDriversLicense";

export function useCreateDriverLicense() {
    const {
        mutate: createLicense,
        isPending: isCreating,
        error,
        data,
    } = useMutation({
        mutationFn: createDriversLicenseApi,
        onSuccess: (data) => {
            const message = data?.message || (data?.status === "success" ? "Driver's license request created" : "Success");
            toast.success(message);
        },
        onError: (error) => {
            const message = error.response.message || error?.response.data.message || "Failed to create driver's license";
            toast.error(message);
        },
    });

    return { createLicense, isCreating, error, data };
}