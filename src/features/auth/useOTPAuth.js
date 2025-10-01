import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { sendLoginOTP, verifyLoginOTP } from "../../services/apiOTP";
import { authStorage } from "../../utils/authStorage";
import { toast } from "react-hot-toast";

export function useOTPLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState(null);

  const startTimer = () => {
    setOtpTimer(600); // 10 minutes
    setCanResend(false);
    
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const { mutate: sendOTP, isPending: isSendingOTP, error: sendError } = useMutation({
    mutationFn: (email) => sendLoginOTP(email),
    onSuccess: (data) => {
      toast.success("OTP sent to your email! Please check your inbox." || data.message);
      setStep("otp");
      startTimer();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const { mutate: verifyOTP, isPending: isVerifyingOTP, error: verifyError } = useMutation({
    mutationFn: ({ email, otp }) => verifyLoginOTP(email, otp),
    onSuccess: (data) => {
      // Store token securely
      if (data.authorization?.token) {
        authStorage.setToken(data.authorization.token);
      } else {
        toast.error("No authentication token received. Please try again.");
        return;
      }

      // Update query cache
      queryClient.setQueryData(["user"], data.user);
      
      // Store user details in localStorage
      if (data.user) {
        const userDetails = {
          user_type_id: data.user.user_type_id,
          name: data.user.name,
          email: data.user.email,
          phone_number: data.user.phone_number,
        };
        localStorage.setItem("userInfo", JSON.stringify(userDetails));
      }

      toast.success(data.message || "Login successful! Redirecting to dashboard...");
      
      // Force a small delay to ensure all state is updated
      setTimeout(() => {
        navigate("/dashboard");
      }, 200);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Invalid OTP code";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  return {
    sendOTP,
    verifyOTP,
    isSendingOTP,
    isVerifyingOTP,
    error,
    step,
    setStep,
    otpTimer,
    canResend,
    startTimer,
  };
}
