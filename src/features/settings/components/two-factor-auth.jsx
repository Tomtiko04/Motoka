"use client"

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { enableTwoFactorEmail, verifyTwoFactorEmail, enableTwoFactorApp, verifyTwoFactorApp } from '../../../services/apiTwoFactor';
import VerifyTwoFactor from './ui/VerifyTwoFactor';
import toast from "react-hot-toast";

export default function TwoFactorAuth({ onNavigate }) {
  const [selectedMethod, setSelectedMethod] = useState("email"); // Set email as default to match the design
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [email] = useState(localStorage.getItem('userEmail')); // Assuming you have the user's email stored
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifying(true); // Set loading state to true immediately

    try {
      let response;
      
      if (selectedMethod === "email") {
        response = await enableTwoFactorEmail();
      } else if (selectedMethod === "mobile-app") {
        response = await enableTwoFactorApp();
      }
      
      if (response.success) {
        toast.success(`2FA enabled via ${selectedMethod === "email" ? "email" : "mobile app"}!`);
        if (selectedMethod === "email") {
          toast.success("Please check your email for the verification code.");
        }
        setShowVerification(true); // Show the verification component
      } else {
        toast.error(response.message || `Failed to enable 2FA via ${selectedMethod === "email" ? "email" : "mobile app"}`);
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsVerifying(false); // Reset loading state after the API call
    }
  };

  const handleVerify = async (code) => {
    setIsVerifying(true);

    try {
      let response;
      
      if (selectedMethod === "email") {
        response = await verifyTwoFactorEmail(code);
      } else if (selectedMethod === "mobile-app") {
        response = await verifyTwoFactorApp(code);
      }
      
      if (response.success) {
        toast.success("2FA has been successfully enabled!");
        setShowVerification(false); // Hide the verification modal after success
      } else {
        toast.error(response.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="">
      <div>
        <div className="flex items-center mb-6">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Two Factor Authenticator</h2>
        </div>

        <div className="flex justify-center items-center w-full h-full text-center my-6">
          <p className="text-sm text-[#05243F]/40 w-80">
            Motoka requires you to protect your account with 2FA. How would you like to receive one-time password (OTP)
          </p>
        </div>

        <div className="space-y-6 w-full max-w-md">
          <div 
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md cursor-pointer"
            onClick={() => setSelectedMethod("mobile-app")}
          >
            <div className="ml-3">
              <label htmlFor="mobile-app" className="font-medium text-sm md:text-base">
                Mobile App Authenticator
              </label>
              <p className="text-sm text-gray-500">
                Use a mobile app like Google Authenticator to generate verification codes.
              </p>
            </div>
            <input
              type="radio"
              id="mobile-app"
              name="2fa-method"
              className="h-4 w-4 text-sky-500 focus:ring-sky-400 cursor-pointer"
              checked={selectedMethod === "mobile-app"}
              onChange={() => setSelectedMethod("mobile-app")}
            />
          </div>

          <div 
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md cursor-pointer"
            onClick={() => setSelectedMethod("email")}
          >
            <div className="ml-3">
              <label htmlFor="email" className="font-medium text-sm md:text-base">
                Email
              </label>
              <p className="text-sm text-gray-500">Receive verification codes via email.</p>
            </div>
            <input
              type="radio"
              id="email"
              name="2fa-method"
              className="h-4 w-4 text-sky-500 focus:ring-sky-400 cursor-pointer"
              checked={selectedMethod === "email"}
              onChange={() => setSelectedMethod("email")}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 pb-3">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isVerifying}
          className={`w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95 ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isVerifying ? "Enabling..." : "Enable 2FA"}
        </button>
      </div>

      {/* Modal overlay for verification */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full m-4">
            <VerifyTwoFactor 
              onVerify={handleVerify} 
              email={email} 
              onClose={() => setShowVerification(false)}
              isVerifying={isVerifying}
            />
          </div>
        </div>
      )}
    </div>
  );
}