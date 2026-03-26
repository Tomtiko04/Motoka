/**
 * GuestRenewalSignup
 *
 * Post-payment account creation page. The guest provides a password and
 * a full Motoka account is created — their renewal order is automatically
 * linked to the new account.
 *
 * URL: /guest/renewal/signup?orderId=xxx&token=yyy
 */

import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { guestSignup } from "../../services/apiGuest";
import toast from "react-hot-toast";

export default function GuestRenewalSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const token   = searchParams.get("token");

  const [password, setPassword]             = useState("");
  const [confirmation, setConfirmation]     = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    if (!orderId || !token) {
      toast.error("Invalid signup link. Please use the link from your receipt page.");
      return;
    }

    setIsSubmitting(true);
    try {
      await guestSignup(orderId, {
        receipt_token: token,
        password,
        password_confirmation: confirmation,
      });
      toast.success("Account created! Please check your email to verify.");
      navigate("/auth/login");
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;
      if (status === 409) {
        toast.error(msg || "An account already exists with this email. Please log in.");
        navigate("/auth/login");
      } else {
        toast.error(msg || "Account creation failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-[#104675]">Motoka</span>
          <h2 className="text-xl font-semibold text-[#05243F] mt-4 mb-1">Create Your Account</h2>
          <p className="text-sm text-[#697C8C]">
            Set a password to save your renewal history and track future documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#05243F] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full rounded-[10px] bg-[#F4F5FC] px-4 py-3 pr-11 text-sm text-[#05243F] outline-none focus:bg-[#FFF4DD] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#697C8C] hover:text-[#05243F]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-[#05243F] mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full rounded-[10px] bg-[#F4F5FC] px-4 py-3 pr-11 text-sm text-[#05243F] outline-none focus:bg-[#FFF4DD] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#697C8C] hover:text-[#05243F]"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password || !confirmation}
            className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#697C8C]">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-[#2389E3] hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
