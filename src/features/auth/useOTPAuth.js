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

  const { mutate: sendOTP, isPending: isSendingOTP } = useMutation({
    mutationFn: (email) => sendLoginOTP(email),
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent to your email! Please check your inbox.");
      setStep("otp");
      startTimer();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const { mutate: verifyOTP, isPending: isVerifyingOTP } = useMutation({
    mutationFn: ({ email, otp }) => verifyLoginOTP(email, otp),
    onSuccess: (data) => {
      // Node.js backend returns data.data.session.access_token
      const token = data?.data?.session?.access_token;
      const refreshToken = data?.data?.session?.refresh_token;
      const user = data?.data?.user;

      if (!token) {
        toast.error("No authentication token received. Please try again.");
        return;
      }

      // Store tokens securely
      authStorage.setToken(token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }

      // Update query cache
      queryClient.setQueryData(["user"], user);
      
      // Store user details in localStorage
      if (user) {
        const userDetails = {
          user_type_id: user.user_type_id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email,
          phone_number: user.phone_number,
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
