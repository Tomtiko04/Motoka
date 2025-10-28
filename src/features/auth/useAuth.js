import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  ForgotPassword as ForgotPasswordApi,
  login as loginApi,
  ResetPassword as ResetPasswordApi,
  verifyRestPass as verifyRestPassApi,
} from "../../services/apiAuth";
import { verifyLoginTwoFactor } from "../../services/apiTwoFactor";
import { signupRequest as signupApi } from "../../services/apiAuth";
import { verifyAccount as verifyApi } from "../../services/apiAuth";
import { resendVerificationCode as resendApi } from "../../services/apiAuth";
import { sendLoginOtp as sendLoginOtpApi, verifyLoginOtp as verifyLoginOtpApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const { mutate: verifyTwoFactor, isPending: isVerifyingTwoFactor } =
    useMutation({
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
        navigate("/dashboard");
      },
      onError: (err) => {
        toast.dismiss();
        toast.error(err.message || "Failed to verify 2FA code");
      },
      retry: false,
    });

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (formData) => loginApi(formData),
    onSuccess: (data) => {
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

        navigate("/dashboard");
      }
    },
    onError: (err) => {
      if (err.message === "Please verify your email before logging in.") {
        toast.error(err.message);
        navigate("/auth/verify-account");
      } else {
        toast.error(err.response.data.message || "An error occurred while logging in.");
      }
    },
    onSettled: () => {},
    retry: false,
  });

  // Send OTP for passwordless login (email)
  const { mutate: sendLoginOtp, isPending: isSendingLoginOtp } = useMutation({
    mutationFn: (email) => sendLoginOtpApi(email),
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent to your email");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to send OTP");
    },
    retry: false,
  });

  // Verify OTP for passwordless login
  const { mutate: verifyLoginOtp, isPending: isVerifyingLoginOtp } = useMutation({
    mutationFn: ({ email, otp }) => verifyLoginOtpApi({ email, otp }),
    onSuccess: (data) => {
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

      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Invalid OTP");
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
    cancelTwoFactor,
    sendLoginOtp,
    isSendingLoginOtp,
    verifyLoginOtp,
    isVerifyingLoginOtp,
  };
}

export function useSignup() {
  const navigate = useNavigate();
  const { mutate: signupUser, isPending: isSigningUp } = useMutation({
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
      toast.error(
        err.message || "An error occurred during signup.",
      );
    },
    retry: false,
  });
  return { signupUser, isSigningUp };
}

export function useVerifyAccount() {
  const navigate = useNavigate();
  const { mutate: verifyAccount, isPending: isVerifying } = useMutation({
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
      toast.error(
        err.message || "Verification failed. Please try again.",
      );
    },
    retry: false,
  });
  return { verifyAccount, isVerifying };
}

export function useResendVerification() {
  const { mutate: resendCode, isPending: isResending } = useMutation({
    mutationFn: resendApi,
    onSuccess: (data) => {
      toast.success(data.message || "Verification code resent!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to resend code.");
    },
    retry: false,
  });
  return { resendCode, isResending };
}

export function useForgotPassword(){
  const { mutate: isforgotPassword, mutateAsync: forgotPasswordAsync, isPending: isForgotPasswordLoading } = useMutation({
    mutationFn: ForgotPasswordApi,
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent to your email.");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Email does not exist. Failed to send OTP.");
    },
  });

  return { isforgotPassword, forgotPasswordAsync, isForgotPasswordLoading}
}

export function useVerifyResetPassword(){
  const {mutate: isVerifyReset, mutateAsync: verifyResetAsync, isPending: isVerifyingReset} = useMutation({
    mutationFn: verifyRestPassApi,
    onSuccess: (data) => {
      toast.success(data.message || "OTP verified");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to verify OTP.");
    },
  })
  
  return { isVerifyReset, verifyResetAsync, isVerifyingReset}
}

export function useResetPassword(){
  const {mutate: isResetPassword, mutateAsync: resetPasswordAsync, isPending: isResetingPassword} = useMutation({
    mutationFn: ResetPasswordApi,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successful! You can now log in with your new password.");
    },
    onError: (err) => {
      toast.error(
        err.response.data.message ||
          "Failed to reset password. Please try again.",
      );
    },
  })

  return { isResetPassword, resetPasswordAsync, isResetingPassword}
}
