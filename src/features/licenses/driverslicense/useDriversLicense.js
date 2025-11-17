import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createDriversLicense as createDriversLicenseApi,
  getDriversLicensePaymentOptions as getDriversLicensePaymentOptionsApi,
} from "../../../services/apiDriversLicense";

export function useDriversLicensePaymentOptions(){
    const {data:isPaymentOptions, isLoading: isPaymentOptionsLoading, error} = useQuery({
        queryKey: ['drivers-license-payment-options'],
        queryFn: getDriversLicensePaymentOptionsApi
    })

    return { isPaymentOptions, isPaymentOptionsLoading, error };
}


export function useCreateDriverLicense() {
    const {
        mutate: createLicense,
        isPending: isCreating,
        error,
        data,
    } = useMutation({
        mutationFn: createDriversLicenseApi,
        onSuccess: () => {
            // const message = data?.message || (data?.status === "success" ? "Driver's license request created" : "Success");
            toast.success("Complete your licenses payment to proceed");
        },
        onError: (error) => {
            const message = error.message || error.response.message || error?.response.data.message || "Failed to create driver's license";
            toast.error(message);
        },
    });

    return { createLicense, isCreating, error, data };
}