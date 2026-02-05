import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOAuthCallback } from "./useOAuth";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback, isHandlingCallback } = useOAuthCallback();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth error:", error, errorDescription);
      navigate("/auth/login");
      return;
    }

    if (code) {
      handleCallback(code);
    } else {
      navigate("/auth/login");
    }
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-gray-600">
          {isHandlingCallback ? "Completing sign in..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
