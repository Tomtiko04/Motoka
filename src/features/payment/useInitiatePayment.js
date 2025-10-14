import { useMutation } from "@tanstack/react-query";
import { initiateDriversLicensePayment as initiateDriversLicensePaymentApi } from "../../services/apiPayment";
import toast from "react-hot-toast";

export default function useInitiateDriversLicensePayment(){
    const {mutate: initiateDriversLicensePayment, isPending: isInitiatingDriverLicensePayment} = useMutation({
        mutationFn: initiateDriversLicensePaymentApi, 
        onSuccess: (data) =>{
            toast.success(data.message || "Driver's license payment initiated successfully");
        },
        onError: (error) =>{
            toast.error(error.response.data.message || "Failed to initiate driver's license payment");
        }
    });

    return {initiateDriversLicensePayment, isInitiatingDriverLicensePayment};
}