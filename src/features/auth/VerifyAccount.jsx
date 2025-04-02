import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVerifyAccount } from "./useAuth";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function VerifyAccount() {
  const navigate = useNavigate();
  const { verifyAccount, isVerifying } = useVerifyAccount();
  const [email, setEmail] = useState(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minute countdown
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  if (!email) {
    return <Navigate to="/auth/signup" replace />;
  }

  // const handleChange = (index, value) => {
  //   // Only allow numbers
  //   if (!/^\d*$/.test(value)) return;

  //   const newCode = [...code];
  //   newCode[index] = value;
  //   setCode(newCode);

  //   // Auto-focus next input
  //   if (value && index < 5 && inputRefs.current[index + 1]) {
  //     inputRefs.current[index + 1].focus();
  //   }

  //   // If all fields are filled, automatically verify
  //   if (index === 5 && value) {
  //     const fullCode = [...newCode.slice(0, 5), value].join("");
  //     if (fullCode.length === 6) {
  //       handleVerify();
  //     }
  //   }
  // };

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input if not the last
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Check if the full code is entered
    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      handleVerify(fullCode); 
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    // Reset timer
    setTimeLeft(60);
    // TODO: Implement resend logic
  };

  const handleVerify = async (fullCode) => {
    if (fullCode.length !== 6) {
      toast.error("The code must be 6 characters long.");
      return;
    }

    const loadingToast = toast.loading("Verifying account...");

    try {
      await verifyAccount({ code: fullCode, email: email });
      toast.success("Account verified successfully!");
    } catch (error) {
      toast.error(error.message || "Verification failed. Please try again.");
    } finally {
      toast.dismiss(loadingToast); 
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:py-10 lg:px-8">
      <div className="animate-fadeIn w-full max-w-[380px] rounded-[20px] bg-white p-4 shadow-lg sm:max-w-[420px] sm:p-6 md:max-w-[460px] md:p-8">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-medium text-[#05243F] sm:text-xl">
            Verify Account
          </h2>
          <p className="text-sm text-[#05243F]/40 sm:text-base">
            Check your mail for the verification code
          </p>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-9">
          <label className="mb-3 block text-sm font-medium text-[#05243F] sm:mb-4">
            Input Code
          </label>
          <div className="flex gap-1.5 sm:gap-2 md:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-10 w-10 rounded-lg text-center text-sm font-medium text-[#05243F]/40 transition-colors duration-300 focus:outline-none sm:h-12 sm:w-12 sm:text-base md:h-14 md:w-14 ${
                  digit ? "bg-[#FFF4DD]" : "bg-[#F4F5FC]"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col space-y-2 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <p className="text-sm text-[#05243F]/40 sm:text-base">
              Code is valid for{" "}
              <span className="text-[#2389E3]">{formatTime(timeLeft)}</span>
            </p>
            <button
              onClick={handleResend}
              disabled={timeLeft > 0}
              className="text-sm text-[#2389E3] transition-colors duration-300 hover:text-[#A73957] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              Resend
            </button>
          </div>
        </div>

        <button
          onClick={() => handleVerify(code.join(""))}
          disabled={code.join("").length !== 6}
          type="submit"
          className="mx-auto mt-6 flex w-full justify-center rounded-3xl bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:mt-8 sm:w-36 sm:text-base md:mt-10"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
