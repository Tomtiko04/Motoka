import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { FaArrowLeft, FaEnvelope, FaKey } from "react-icons/fa";
import { useOTPLogin } from "./useOTPAuth";
import LoginImage from "../../components/LoginImage";
const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
});

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^[0-9]{6}$/, "OTP must be 6 digits"),
});

export default function OTPLogin() {
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simple loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error) => {
      console.error("OTP Login Error:", error);
      const errorMessage = error?.message || error?.toString() || "An unknown error occurred";
      setError(errorMessage);
      toast.error("An error occurred. Please refresh the page and try again.");
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  let hookData;
  try {
    hookData = useOTPLogin();
  } catch (error) {
    console.error("Error in useOTPLogin hook:", error);
    const errorMessage = error?.message || error?.toString() || "An unknown error occurred";
    setError(errorMessage);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading OTP Login</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const {
    sendOTP,
    verifyOTP,
    isSendingOTP,
    isVerifyingOTP,
    error: authError,
    step,
    setStep,
    otpTimer,
    canResend,
    startTimer,
  } = hookData;


  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: yupResolver(otpSchema),
  });

  // Timer countdown

  const handleSendOTP = async (data) => {
    setEmail(data.email);
    sendOTP(data.email);
  };

  const handleVerifyOTP = async (data) => {
    verifyOTP({ email, otp: data.otp });
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    sendOTP(email);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };



  // Simple test render first
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OTP Login...</p>
        </div>
      </div>
    );
  }

  // Test basic render
  if (!step) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Step not defined</h2>
          <p className="text-gray-600 mb-4">Step value: {String(step)}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="animate-fadeIn flex max-h-[80vh] w-full max-w-[864px] md:w-[864px] flex-col-reverse justify-between gap-0 overflow-hidden rounded-[20px] bg-white md:flex-row p-4 sm:p-0 sm:px-0">
        <div className="hidden w-full md:block sm:w-1/2 shrink-0 border-r border-[#F2F2F2] " >
                  <LoginImage />
                </div>

      {/* Right side - Login Form */}
      <div className="w-full flex items-center justify-center lg:px-8 p-3 py-6 pt-10 px-4 sm:px-9 sm:py-8 sm:p-4 sm:pt-12">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="">
            <h2 className="text-2xl font-medium text-gray-900">
              {step === "email" ? "Login with OTP" : "Enter OTP Code"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === "email"
                ? "Enter your email to receive a one-time password"
                : `We've sent a 6-digit code to ${email}`}
            </p>
            
          </div>

          {/* Back Button */}
          {step === "otp" && (
            <button
              onClick={() => setStep("email")}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to email
            </button>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit(handleSendOTP)} className="space-y-6">
              <div>
                
                {/* <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerEmail("email")}
                    type="email"
                    autoComplete="email"
                    // className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    className={`appearance-none block w-full relative rounded-md sm:rounded-xl bg-[#F4F5FC] px-3 py-2 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none pl-10 pr-3 sm:py-3 -z-0 focus:z-5 ${
                  isVerifyingOTP || isSendingOTP
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}

                    placeholder="Enter your email address"
                  />
                </div>
                {emailErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{emailErrors.email.message}</p>
                    )} */}
                    
                <div className="w-full">
                  <input
                    
                        {...registerEmail("email")}
                        type="email"
                    placeholder="Enter your Email*"
                    disabled={isVerifyingOTP || isSendingOTP}
                    className={`mt-1 block w-full rounded-[8px] bg-[#F4F5FC] px-3 py-3 sm:px-4 sm:py-5 !text-sm sm:text-sm placeholder:text-[#05243F66] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none  ${isVerifyingOTP || isSendingOTP
                      ? "cursor-not-allowed opacity-50"
                      : ""
                      }`}
                  />
                  {emailErrors.email && (
                    <p className="animate-shake mt-1 text-xs text-[#A73957]">
                      {emailErrors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOTP}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-lg font-medium rounded-3xl text-white bg-[#2389E3] hover:bg-[#3795e7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingOTP ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <form onSubmit={handleOTPSubmit(handleVerifyOTP)} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP Code
                </label>
                <div className="mt-1">
                  <input
                    {...registerOTP("otp")}
                    type="text"
                    maxLength="6"
                    autoComplete="one-time-code"
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setOtp(value);
                      e.target.value = value;
                    }}
                  />
                </div>
                {otpErrors.otp && (
                  <p className="mt-2 text-sm text-red-600">{otpErrors.otp.message}</p>
                )}
              </div>

              {/* Timer */}
              {otpTimer > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Code expires in: <span className="font-semibold text-red-600">{formatTime(otpTimer)}</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingOTP || otp.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingOTP ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  className="text-sm text-[#2389E3] hover:text-[#45a0ee] disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {canResend ? "Resend OTP" : `Resend in ${formatTime(otpTimer)}`}
                </button>
              </div>
            </form>
          )}

          {/* Error Display */}
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Or?{" "}
              <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in with password
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
  } catch (renderError) {
    console.error("Error rendering OTP Login:", renderError);
    const errorMessage = renderError?.message || renderError?.toString() || "An unknown rendering error occurred";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Rendering Error</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
