import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
// import ImageSlider from "../../components/ImageSlider";
import SignupImage from "../components/DirectRenewalImage"
import toast from "react-hot-toast";
import { useSignup } from "../features/auth/useAuth";
import { useGoogleLogin } from "../features/auth/useOAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import TwoFactorVerification from "../../components/TwoFA/TwoFactorVerification";

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

function CardRenewImage() {
  const { signupUser, isSigningUp } = useSignup();
  const { loginWithGoogle, isLoadingGoogle } = useGoogleLogin();
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
    <div className="flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="animate-fadeIn flex max-h-[80vh] w-full max-w-[864px] md:w-[864px] flex-col-reverse justify-between gap-0 overflow-hidden rounded-[20px] bg-white md:flex-row px-4 sm:px-0 ">
        <div className="hidden w-full md:block md:w-1/2">
          <SignupImage />
        </div>

        <div className="hidden w-[1px] bg-[#F2F2F2] md:block"></div>

        <div className="w-full md:w-1/2">
          <div className="w-full overflow-hidden p-1 pb-4 pt-6 sm:p-8 flex flex-col h-full flex-1 justify-center">
            <div className="animate-slideDown mb-4 flex flex-col space-y-1 sm:mb-2 sm:space-y-1 md:mt-3">
              <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">
                Just a sec
              </h2>
              <div className="flex items-center">
                <span className="text-sm text-[#697B8C4A] font-normal">
                  Kindly fill in your details. This is a one-time setup
                </span>
              </div>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className=" flex flex-col  flex-1 overflow-auto"
            >
              <div className="space-y-3 sm:space-y-3 flex-1 flex items-center flex-col justify-center">


                <div className="w-full">
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Username*"
                    className="mt-1 block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 !text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
                  />
                  {errors.name && (
                    <p className="animate-shake mt-1 text-xs text-[#A73957]">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <div className="w-full">
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="Enter your Email*"
                      className={`mt-1 block w-full rounded-[8px] bg-[#F4F5FC] px-3 py-3 sm:px-4 sm:py-4 !text-sm sm:text-sm text-[05243F] placeholder:text-[#05243F66] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none `}
                    />
                    {errors.email && (
                      <p className="animate-shake mt-1 text-xs text-[#A73957]">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder="Phone Number*"
                      className={`mt-1 block w-full rounded-[8px] bg-[#F4F5FC] px-3 py-3 sm:px-4 sm:py-4 !text-sm sm:text-sm text-[#05243F] placeholder:text-[#05243F66] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none`} />
                    {errors.phone && (
                      <p className="animate-shake mt-1 text-xs text-[#A73957]">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <div className="relative">
                    <input id="password"
                      {...register("password")} type={showPassword ? "text" : "password"}
                      placeholder="Password*"
                      className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 !text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
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
                    <p className="animate-shake mt-1 text-xs text-[#A73957]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password*"
                      className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 !text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
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
                    <p className="animate-shake mt-1 text-xs text-[#A73957]">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start w-full mt-2">
                  <input
                    id="terms"
                    {...register("terms")}
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-[#F4F5FC] text-[#F4F5FC] focus:ring-[#F4F5FC]"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-3 block text-[10px] text-[#2C3037]"
                  >
                    I confirm that i have entered the correct information and agree with the terms and conditions.
                  </label>
                </div>
                {errors.terms && (
                  <p className="animate-shake mt-1 !text-xs text-[#A73957]">
                    {errors.terms.message}
                  </p>
                )}

              </div>
              <div className="mt-4 w-full">
                <div className="">

                  <div className=" w-full lex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={isSigningUp}
                      className="mx-auto flex w-full sm:w-full justify-center rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95"
                    >
                      Proceed
                    </button>
                  </div>
                  {/* <div className="flex justify-center gap-x-3 items-center">
                    <span className="text-center text-sm font-normal text-[#05243F66] opacity-40">
                      or Signup with
                    </span>
                    <button
                      type="button"
                      onClick={() => loginWithGoogle()}
                      disabled={isSigningUp || isLoadingGoogle}
                      className={`h-10 w-10 rounded-full bg-[#F4F5FC] transition-all duration-300 sm:h-12 sm:w-12 ${isSigningUp || isLoadingGoogle
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-[#FFF4DD] active:scale-95"
                        }`}
                    >
                      <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="mx-auto h-4 w-4"
                      />
                    </button>
                  </div> */}
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}




export default function DirectRenewal() {
  return (
    <div className="flex min-h-dvh flex-col bg-black/50 backdrop-blur-md">
      <div className="flex flex-grow flex-col w-full px-0 mt-6 sm:mt-0 sm:items-center sm:justify-center sm:px-6">
        <CardRenewImage />
      </div>
    </div>
  );
}
