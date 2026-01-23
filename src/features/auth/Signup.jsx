"use client"
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSignup } from "./useAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ImageSlider from "../../components/ImageSlider";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Username is required")
    .matches(
      /^[A-Za-z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^(0\d{10}|(\+234|234)\d{10})$/,
      "Enter a valid Nigerian phone number",
    ),
  // nin: yup.string().required("NIN is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Passwords do not match")
    .required("Please confirm your password"),
  terms: yup.boolean().oneOf([true], "You must accept the Terms & Conditions"),
});

export default function Signup() {
  const { signupUser, isSigningUp } = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = (data) => {
    const loadingToast = toast.loading("Creating your account...");
    try {
      signupUser(
        {
          name: data.name,
          email: data.email,
          phone_number: data.phone,
          password: data.password.trim(),
          password_confirmation: data.confirmPassword.trim(),
          // nin: data.nin,
        },
        {
          onSuccess: () => {
            toast.dismiss(loadingToast);
          },
          onError: () => {
            toast.dismiss(loadingToast);
          },
        },
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 flex-1 py-6">
      <div className="animate-fadeIn flex w-full max-w-4xl flex-col-reverse justify-between gap-8 rounded-[20px] bg-white p-4 sm:p-6 md:flex-row md:p-6">
        <div className="hidden w-full md:block md:w-1/2">
          <ImageSlider />
        </div>

        <div className="hidden w-[1px] bg-[#F2F2F2] md:block"></div>

        <div className="w-full md:w-1/2">
          <div className="animate-slideDown mb-6 flex flex-col items-center justify-between space-y-2 sm:mb-9 sm:flex-row sm:space-y-0 md:mt-6">
            <h2 className="text-xl font-bold text-[#05243F] sm:text-2xl">
              Signup
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-[#a8b2bd]">Have an account?</span>
              <Link
                to="/auth/login"
                className="ml-1 text-sm text-[#2389E3] transition-colors duration-300 hover:text-[#A73957]"
              >
                Login
              </Link>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#05243F] sm:mb-3"
              >
                Username
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                placeholder="Tomtiko"
                className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
              />
              {errors.name && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#05243F] sm:mb-3"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="sample@gmail.com"
                className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
              />
              {errors.email && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-[#05243F] sm:mb-3"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="08012345678"
                className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
              />
              {errors.phone && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* <div>
              <label
                htmlFor="nin"
                className="mb-2 block text-sm font-medium text-[#05243F] sm:mb-3"
              >
                NIN
              </label>
              <input
                id="nin"
                type="number"
                {...register("nin")}
                placeholder=""
                className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
              />
              {errors.nin && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.nin.message}
                </p>
              )}
            </div> */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#05243F] sm:mb-3"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
                />
                <div
                  className="absolute top-1/2 right-4 -translate-y-1/2 transform cursor-pointer text-[#05243F] opacity-40 transition-opacity duration-300 hover:opacity-100 sm:right-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#05243F] sm:mb-3"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
                />
                <div
                  className="absolute top-1/2 right-4 -translate-y-1/2 transform cursor-pointer text-[#05243F] opacity-40 transition-opacity duration-300 hover:opacity-100 sm:right-5"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="terms"
                  {...register("terms")}
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-[#F4F5FC] text-[#F4F5FC] focus:ring-[#F4F5FC]"
                />
                <label
                  htmlFor="terms"
                  className="ml-3 block text-sm text-[#05243F] opacity-40"
                >
                  I agree to the Terms & Conditions
                </label>
              </div>
              {errors.terms && (
                <p className="animate-shake mt-1 text-sm text-[#A73957] sm:mt-0">
                  {errors.terms.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSigningUp}
                className="mx-auto mt-8 flex w-full justify-center rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:mt-14 sm:w-36 mb-4"
              >
                Sign Up
              </button>
            </div>
          </form>

          {/* Social login */}
          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F2F2F2]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-[#D9D9D9]">or</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col space-y-4 sm:mt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <span className="text-center text-sm font-medium text-[#05243F] opacity-40 sm:text-sm">
                Signup with socials
              </span>
              <div className="flex justify-center gap-x-3">
                <button className="h-12 w-12 rounded-full bg-[#F4F5FC] transition-all duration-300 hover:bg-[#FFF4DD] active:scale-95 sm:h-14 sm:w-14">
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="mx-auto h-5 w-5"
                  />
                </button>
                <button className="h-12 w-12 rounded-full bg-[#F4F5FC] transition-all duration-300 hover:bg-[#FFF4DD] active:scale-95 sm:h-14 sm:w-14">
                  <img
                    src="https://www.svgrepo.com/show/448224/facebook.svg"
                    alt="Facebook"
                    className="mx-auto h-5 w-5"
                  />
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
