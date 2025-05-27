import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export default function TwoFactorVerification({ onVerify, onCancel, isVerifying }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); 
  const inputRefs = useRef([]);

  useEffect(() => {
    
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

   
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

  const handleChange = (index, value) => {
    
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

   
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
   
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
   
    toast.success("Verification code resent!");
    setTimeLeft(600); 
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      await onVerify(fullCode);
    } catch (error) {
    
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="animate-fadeIn fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full m-4">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-medium text-[#05243F] sm:text-xl">
            Two-Factor Authentication
          </h2>
          <p className="text-sm text-[#05243F]/40 sm:text-base">
            Please enter the verification code to continue
          </p>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-9">
          <label className="mb-3 block text-sm font-medium text-[#05243F] sm:mb-4">
            Input Code
          </label>
          <div className="flex gap-1.5 sm:gap-2 md:gap-3 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-10 w-10 rounded-lg text-center text-sm font-medium text-[#05243F] transition-colors duration-300 focus:outline-none sm:h-12 sm:w-12 sm:text-base md:h-14 md:w-14 ${
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

        <div className="flex justify-between mt-6 sm:mt-8 md:mt-10">
          <button
            onClick={onCancel}
            className="w-full sm:w-36 justify-center rounded-3xl border border-[#2389E3] px-4 py-2 text-sm font-semibold text-[#2389E3] transition-all duration-300 hover:bg-[#f0f9ff] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95 sm:text-base mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={code.join("").length !== 6 || isVerifying}
            className="w-full sm:w-36 justify-center rounded-3xl bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1a7acf] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95 sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}