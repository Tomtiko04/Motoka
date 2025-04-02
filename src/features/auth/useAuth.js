import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { login as loginApi } from "../../services/apiAuth";
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
      toast.error(err.message || "An error occurred while logging in.");
    },
    retry: false,
  });

  return { login, isLoggingIn };
}
