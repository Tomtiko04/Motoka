import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { initiateGoogleLogin, handleOAuthCallback } from "../../services/apiOAuth";
import { useNavigate } from "react-router-dom";

export function useGoogleLogin() {
  const { mutate: loginWithGoogle, isPending: isLoadingGoogle } = useMutation({
    mutationFn: initiateGoogleLogin,
    onSuccess: (data) => {
      // Redirect to Google OAuth URL
      if (data?.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast.error("Failed to get Google login URL");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to initiate Google login");
    },
    retry: false,
  });

  return { loginWithGoogle, isLoadingGoogle };
}

export function useOAuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: handleCallback, isPending: isHandlingCallback } = useMutation({
    mutationFn: handleOAuthCallback,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.data?.user);
      toast.success(data.message || "Login successful!");

      if (data.data?.user) {
        const userDetails = {
          user_type_id: data.data.user.user_type_id,
          name: data.data.user.name || `${data.data.user.first_name || ''} ${data.data.user.last_name || ''}`.trim() || data.data.user.email,
          email: data.data.user.email,
          phone_number: data.data.user.phone_number,
        };
        localStorage.setItem("userInfo", JSON.stringify(userDetails));
      }

      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "OAuth login failed");
      navigate("/auth/login");
    },
    retry: false,
  });

  return { handleCallback, isHandlingCallback };
}
