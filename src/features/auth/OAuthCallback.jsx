import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useOAuthCallback } from "./useOAuth";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback, isHandlingCallback } = useOAuthCallback();

  useEffect(() => {
    const processCallback = async () => {
      // Get the authorization code from the URL query parameters
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        console.error("OAuth error:", error, errorDescription);
        toast.error(errorDescription || "Google sign in failed");
        navigate("/auth/login");
        return;
      }

      if (code) {
        // Exchange the code for session via backend
        handleCallback(code);
      } else {
        toast.error("No authorization code received");
        navigate("/auth/login");
      }
    };

    processCallback();
  }, [searchParams, navigate, handleCallback]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
