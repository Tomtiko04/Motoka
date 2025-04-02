import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { login as loginApi } from "../../services/apiAuth";
import { signupRequest as signupApi } from "../../services/apiAuth";
import { verifyAccount as verifyApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isLoading: isLoggingIn } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      toast.success("User logged in successfully!");
      navigate("/");
    },
    onError: (err) => {
      if (err.message === "Please verify your email before logging in.") {
        toast.error(err.message);
        navigate("/auth/verify-account");
      } else {
        toast.error(err.message || "An error occurred while logging in.");
      }
    },
    retry: false,
  });

  return { login, isLoggingIn };
}

export function useSignup() {
  const navigate = useNavigate();

  const { mutate: signupUser, isLoading: isSigningUp } = useMutation({
    mutationFn: signupApi,
    onSuccess: (data, variables) => {
      const userEmail = variables.email;
      localStorage.setItem("pendingVerificationEmail", userEmail);
      toast.success(
        data.message ||
          "User created successfully. Please check your email for verification code. ",
      );
      navigate("/auth/verify-account");
    },
    onError: (err) => {
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
      toast.success(
        data.message || "Account verified successfully! You can now log in.",
      );
      navigate("/auth/verification-success");
      localStorage.removeItem("pendingVerificationEmail");
    },
    onError: (err) => {
      toast.error(err.message || "Verification failed. Please try again.");
    },
    retry: false,
  });

  return { verifyAccount, isVerifying };
}
