import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { login as loginApi } from "../../services/apiAuth";
import { verifyLoginTwoFactor } from "../../services/apiTwoFactor";
import { signupRequest as signupApi } from "../../services/apiAuth";
import { verifyAccount as verifyApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const { mutate: verifyTwoFactor, isLoading: isVerifyingTwoFactor } = useMutation({
    mutationFn: (code) => verifyLoginTwoFactor(twoFactorToken, code),
    onSuccess: (data) => {
      toast.dismiss();
      
      
      if (data.authorization?.token) {
       
      }
      
     
      queryClient.setQueryData(["user"], data.user);
      toast.success(data.message || "Login successful!");
      
     
      if (data.user) {
        const userDetails = {
          user_type_id: data.user.user_type_id,
          name: data.user.name,
          email: data.user.email,
          phone_number: data.user.phone_number,
        };
        localStorage.setItem("userInfo", JSON.stringify(userDetails));
      }
      
      setTwoFactorRequired(false);
      navigate("/");
    },
    onError: (err) => {
      toast.dismiss();
      toast.error(err.message || "Failed to verify 2FA code");
    },
    retry: false,
  });

  const { mutate: login, isLoading: isLoggingIn } = useMutation({
    mutationFn: (formData) => loginApi(formData),
    onSuccess: (data) => {
      toast.dismiss();
      
     
      if (data.status === "2fa_required") {
       
        setTwoFactorToken(data["2fa_token"]);
        
      
        setTwoFactorRequired(true);
        
        toast.success(data.message || "Please enter 2FA verification code");
      } else {
       
        queryClient.setQueryData(["user"], data.user);
        toast.success(data.message || "User logged in successfully!");
        
       
        if (data.user) {
          const userDetails = {
            user_type_id: data.user.user_type_id,
            name: data.user.name,
            email: data.user.email,
            phone_number: data.user.phone_number,
          };
          localStorage.setItem("userInfo", JSON.stringify(userDetails));
        }
        
        navigate("/");
      }
    },
    onError: (err) => {
      toast.dismiss(); 
      if (err.message === "Please verify your email before logging in.") {
        toast.error(err.message);
        navigate("/auth/verify-account");
      } else {
        toast.error(err.message || "An error occurred while logging in.");
      }
    },
    retry: false,
  });

  const cancelTwoFactor = () => {
    setTwoFactorRequired(false);
    setTwoFactorToken("");
  };

  return { 
    login, 
    isLoggingIn, 
    twoFactorRequired, 
    verifyTwoFactor, 
    isVerifyingTwoFactor,
    cancelTwoFactor
  };
}

export function useSignup() {
  const navigate = useNavigate();
  const { mutate: signupUser, isLoading: isSigningUp } = useMutation({
    mutationFn: signupApi,
    onSuccess: (data, variables) => {
      toast.dismiss(); 
      const userEmail = variables.email;
      localStorage.setItem("pendingVerificationEmail", userEmail);
      toast.success(
        data.message ||
          "User created successfully. Please check your email for the verification code.",
      );
      navigate("/auth/verify-account");
    },
    onError: (err) => {
      toast.dismiss(); 
      toast.error(err.message || "An error occurred during signup.");
    },
    retry: false,
  });
  return { signupUser, isSigningUp };
}

export function useVerifyAccount() {
  const navigate = useNavigate();
  const { mutate: verifyAccount, isLoading: isVerifying } = useMutation({
    mutationFn: verifyApi,
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(
        data.message || "Account verified successfully! You can now log in.",
      );
      navigate("/auth/verification-success");
      localStorage.removeItem("pendingVerificationEmail");
    },
    onError: (err) => {
      toast.dismiss();
      toast.error(err.message || "Verification failed. Please try again.");
    },
    retry: false,
  });
  return { verifyAccount, isVerifying };
}