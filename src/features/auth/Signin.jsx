// "use client"
// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
// import ImageSlider from "../../components/ImageSlider";
// import LoginImage from "../../components/LoginImage"
// import toast from "react-hot-toast";
// import { useLogin } from "./useAuth";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import TwoFactorVerification from "../../components/TwoFA/TwoFactorVerification";

// const schema = yup.object().shape({
//   email: yup
//     .string()
//     .email("Invalid email format")
//     .required("Email is required"),
//   password: yup.string().required("Password is required"),
// });

// export default function Signin() {
//   const {
//     login,
//     isLoggingIn,
//     twoFactorRequired,
//     verifyTwoFactor,
//     isVerifyingTwoFactor,
//     cancelTwoFactor,
//     sendLoginOtp,
//     isSendingLoginOtp,
//     verifyLoginOtp,
//     isVerifyingLoginOtp,
//   } = useLogin();
//   const {
//     register,
//     handleSubmit,
//     getValues,
//     trigger,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [otpModalOpen, setOtpModalOpen] = useState(false);

//   const onSubmit = async (data) => {
//     const loadingToast = toast.loading("Logging in...");
//     try {
//       await login(
//         {
//           email: data.email,
//           password: data.password.trim(),
//         },
//         {
//           onSuccess: () => {
//             toast.dismiss(loadingToast);
//             // Store email in localStorage if remember me is checked
//             if (rememberMe) {
//               localStorage.setItem("rememberedEmail", data.email);
//             } else {
//               localStorage.removeItem("rememberedEmail");
//             }
//           },
//           onError: () => {
//             toast.dismiss(loadingToast);
//           },
//         },
//       );
//     } catch (error) {
//       toast.dismiss(loadingToast);
//       toast.error(error.message || "Login failed");
//     }
//   };

//   const handleVerifyTwoFactor = async (code) => {
//     try {
//       await verifyTwoFactor(code);
//     } catch (error) {
//       // Error handling is done in the mutation
//     }
//   };

//   // OTP passwordless login flow
//   const handleSendOtp = async () => {
//     const email = getValues("email");
//     if (!email) {
//       toast.error("Please enter your email to receive OTP");
//       return;
//     }
//     // Validate only the email field before sending OTP
//     const isEmailValid = await trigger("email");
//     if (!isEmailValid) return;

//     const loadingToast = toast.loading("Sending OTP...");
//     sendLoginOtp(email, {
//       onSuccess: () => {
//         toast.dismiss(loadingToast);
//         setOtpModalOpen(true);
//       },
//       onError: (err) => {
//         toast.dismiss(loadingToast);
//         toast.error(err.response.data.message || "Failed to send OTP");
//       },
//     });
//   };

//   const handleVerifyOtp = async (code) => {
//     const email = getValues("email");
//     if (!email) {
//       toast.error("Email missing. Please enter your email and resend OTP.");
//       return;
//     }
//     verifyLoginOtp(
//       { email, otp: code },
//       {
//         onSuccess: () => {
//           setOtpModalOpen(false);
//         },
//         onError: () => {
//           // toast handled in mutation
//         },
//       },
//     );
//   };

//   return (
//     <div className="flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
//       <div className="animate-fadeIn flex max-h-[80vh] w-full max-w-[864px] md:w-[864px] flex-col-reverse justify-between gap-0 overflow-hidden rounded-[20px] bg-white md:flex-row px-4 sm:px-0">
//         <div className="hidden w-full md:block md:w-1/2">
//           <LoginImage/>
//         </div>

//         <div className="hidden w-[1px] bg-[#F2F2F2] md:block"></div>

//         <div className="w-full overflow-hidden md:w-1/2 p-0 sm:p-4 h-fit self-center">
//           <div className="animate-slideDown mb-4 flex flex-col space-y-1 sm:mb-8 sm:space-y-1 md:mt-0">
//             <h2 className="text-2xl font-medium text-[#05243F] sm:text-xl">
//               Login
//             </h2>
//             <div className="flex items-center">
//               <span className="text-sm text-[#697B8C4A] font-normal">
//                 Don't have an account?
//               </span>
//               <Link
//                 to="/auth/signup"
//                 className="ml-1 text-sm text-[#2389E3] transition-colors duration-300 hover:text-[#A73957]"
//               >
//                 Signup
//               </Link>
//             </div>
//           </div>

//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="space-y-4 sm:space-y-4"
//           >
//             <div>
//               <label
//                 htmlFor="email"
//                 className="mb-1 block text-sm font-medium text-[#05243F] sm:mb-2 mt-6"
//               >
//                 Email
//               </label>
//               <input
//                 id="email"
//                 {...register("email")}
//                 placeholder="sample@gmail.com"
//                 disabled={isLoggingIn || isSendingLoginOtp}
//                 className={`mt-1 block w-full rounded-xl bg-[#F4F5FC] px-3 py-2 text-base sm:text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-4 sm:py-3 ${
//                   isLoggingIn || isSendingLoginOtp
//                     ? "cursor-not-allowed opacity-50"
//                     : ""
//                 }`}
//               />
//               {errors.email && (
//                 <p className="animate-shake mt-1 text-xs text-[#A73957]">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="mb-1 block text-sm font-medium text-[#05243F] sm:mb-2 mt-6"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   {...register("password")}
//                   type={!showPassword ? "password" : "text"}
//                   placeholder="••••••••••••"
//                   disabled={isLoggingIn}
//                   className={`mt-1 block w-full rounded-xl bg-[#F4F5FC] px-3 py-2 text-base sm:text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-4 sm:py-3 ${
//                     isLoggingIn ? "cursor-not-allowed opacity-50" : ""
//                   }`}
//                 />
//                 <div
//                   onClick={() => !isLoggingIn && setShowPassword(!showPassword)}
//                   className={`absolute top-1/2 right-3 -translate-y-1/2 transform text-[#05243F] opacity-40 transition-opacity duration-300 sm:right-4 ${
//                     isLoggingIn
//                       ? "cursor-not-allowed"
//                       : "cursor-pointer hover:opacity-100"
//                   }`}
//                 >
//                   {!showPassword ? (
//                     <FaRegEye size={18} />
//                   ) : (
//                     <FaRegEyeSlash size={18} />
//                   )}
//                 </div>
//               </div>
//               {errors.password && (
//                 <p className="animate-shake mt-1 text-xs text-[#A73957]">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             <div className="flex flex-row items-center justify-between space-y-2">
//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) =>
//                     !isLoggingIn && setRememberMe(e.target.checked)
//                   }
//                   disabled={isLoggingIn}
//                   className={`h-3 w-3 rounded border-[#F4F5FC] text-[#F4F5FC] focus:ring-[#F4F5FC] ${
//                     isLoggingIn
//                       ? "cursor-not-allowed opacity-50"
//                       : "cursor-pointer"
//                   }`}
//                 />
//                 <label
//                   htmlFor="remember-me"
//                   className={`ml-2 block text-xs text-[#05243F] opacity-40 ${
//                     isLoggingIn ? "cursor-not-allowed" : ""
//                   }`}
//                 >
//                   Remember me
//                 </label>
//               </div>

//               <div className="text-xs">
//                 <Link
//                   to="/auth/forgot-password"
//                   className={`text-[#A73957] opacity-70 transition-opacity duration-300 ${
//                     isLoggingIn
//                       ? "pointer-events-none cursor-not-allowed opacity-30"
//                       : "hover:opacity-100"
//                   }`}
//                 >
//                   Forgot Password?
//                 </Link>
//               </div>
//             </div>

//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <button
//                 type="submit"
//                 disabled={isLoggingIn}
//                 className={`flex-1 rounded-3xl bg-[#2389E3] px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:w-36 sm:py-2 ${
//                   isLoggingIn
//                     ? "transform-none cursor-not-allowed opacity-50 hover:bg-[#2389E3] hover:text-white"
//                     : ""
//                 }`}
//               >
//                 {isLoggingIn ? "Logging in..." : "Login"}
//               </button>
//             </div>
//           </form>

//           <div className="mt-0 sm:mt-3">
//             {/* OTP Login Link */}
//             <div className="mt-0 sm:mt-4 text-center">
//               <Link
//                 to="/auth/otp-login"
//                 className="text-sm text-[#2389E3] transition-colors duration-300 hover:text-[#2389E3]/70"
//               >
//                 Login using OTP instead
//               </Link>
//             </div>

//             {/* <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-[#F2F2F2]"></div>
//               </div>
//               <div className="relative flex justify-center text-xs">
//                 <span className="bg-white px-2 text-[#D9D9D9]">or</span>
//               </div>
//             </div> */}

//             {/* <div className="mt-2 flex flex-col space-y-2 sm:mt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
//               <span className="text-center text-xs font-medium text-[#05243F] opacity-40">
//                 Login with socials
//               </span>
//               <div className="flex justify-center gap-x-2">
//                 <button
//                   disabled={isLoggingIn}
//                   className={`h-10 w-10 rounded-full bg-[#F4F5FC] transition-all duration-300 sm:h-12 sm:w-12 ${
//                     isLoggingIn
//                       ? "cursor-not-allowed opacity-50"
//                       : "hover:bg-[#FFF4DD] active:scale-95"
//                   }`}
//                 >
//                   <img
//                     src="https://www.svgrepo.com/show/475656/google-color.svg"
//                     alt="Google"
//                     className="mx-auto h-4 w-4"
//                   />
//                 </button>
//                 <button
//                   disabled={isLoggingIn}
//                   className={`h-10 w-10 rounded-full bg-[#F4F5FC] transition-all duration-300 sm:h-12 sm:w-12 ${
//                     isLoggingIn
//                       ? "cursor-not-allowed opacity-50"
//                       : "hover:bg-[#FFF4DD] active:scale-95"
//                   }`}
//                 >
//                   <img
//                     src="https://www.svgrepo.com/show/448224/facebook.svg"
//                     alt="Facebook"
//                     className="mx-auto h-4 w-4"
//                   />
//                 </button>
//               </div>
//             </div> */}
//           </div>

//           {/* 2FA Verification Modal */}
//           {twoFactorRequired && (
//             <TwoFactorVerification
//               onVerify={handleVerifyTwoFactor}
//               onCancel={cancelTwoFactor}
//               isVerifying={isVerifyingTwoFactor}
//             />
//           )}

//           {/* OTP Login Verification Modal */}
//           {otpModalOpen && (
//             <TwoFactorVerification
//               onVerify={handleVerifyOtp}
//               onCancel={() => setOtpModalOpen(false)}
//               isVerifying={isVerifyingLoginOtp}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



"use client"
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import ImageSlider from "../../components/ImageSlider";
import LoginImage from "../../components/LoginImage"
import toast from "react-hot-toast";
import { useLogin } from "./useAuth";
import { useGoogleLogin } from "./useOAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TwoFactorVerification from "../../components/TwoFA/TwoFactorVerification";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Signin() {
  const {
    login,
    isLoggingIn,
    twoFactorRequired,
    verifyTwoFactor,
    isVerifyingTwoFactor,
    cancelTwoFactor,
    sendLoginOtp,
    isSendingLoginOtp,
    verifyLoginOtp,
    isVerifyingLoginOtp,
  } = useLogin();
  const { loginWithGoogle, isLoadingGoogle } = useGoogleLogin();
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Logging in...");
    try {
      await login(
        {
          email: data.email,
          password: data.password.trim(),
        },
        {
          onSuccess: () => {
            toast.dismiss(loadingToast);
            // Store email in localStorage if remember me is checked
            if (rememberMe) {
              localStorage.setItem("rememberedEmail", data.email);
            } else {
              localStorage.removeItem("rememberedEmail");
            }
          },
          onError: () => {
            toast.dismiss(loadingToast);
          },
        },
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Login failed");
    }
  };

  const handleVerifyTwoFactor = async (code) => {
    try {
      await verifyTwoFactor(code);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // OTP passwordless login flow
  const handleSendOtp = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Please enter your email to receive OTP");
      return;
    }
    // Validate only the email field before sending OTP
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    const loadingToast = toast.loading("Sending OTP...");
    sendLoginOtp(email, {
      onSuccess: () => {
        toast.dismiss(loadingToast);
        setOtpModalOpen(true);
      },
      onError: (err) => {
        toast.dismiss(loadingToast);
        toast.error(err.response.data.message || "Failed to send OTP");
      },
    });
  };

  const handleVerifyOtp = async (code) => {
    const email = getValues("email");
    if (!email) {
      toast.error("Email missing. Please enter your email and resend OTP.");
      return;
    }
    verifyLoginOtp(
      { email, otp: code },
      {
        onSuccess: () => {
          setOtpModalOpen(false);
        },
        onError: () => {
          // toast handled in mutation
        },
      },
    );
  };

  return (
    <div className="flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="animate-fadeIn flex max-h-[80vh] w-full max-w-[864px] md:w-[864px] flex-col-reverse justify-between gap-0 overflow-hidden rounded-[20px] bg-white md:flex-row px-4 sm:px-0 ">
        <div className="hidden w-full md:block md:w-1/2">
          <LoginImage />
        </div>

        <div className="hidden w-[1px] bg-[#F2F2F2] md:block"></div>

        <div className="w-full">
          <div className="w-full overflow-hidden p-0 sm:p-8 flex flex-col h-full flex-1">
            <div className="animate-slideDown mb-4 flex flex-col space-y-1 sm:mb-8 sm:space-y-1 md:mt-3">
              <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">
                Login
              </h2>
              <div className="flex items-center">
                <span className="text-sm text-[#697B8C4A] font-normal">
                  Don't have an account?
                </span>
                <Link
                  to="/auth/signup"
                  className="ml-1 text-sm text-[#2389E3] transition-colors duration-300 hover:text-[#A73957]"
                >
                  Signup
                </Link>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className=" flex flex-col flex-1"
            >
              <div className="space-y-4 sm:space-y-4 flex-1 flex items-center flex-col justify-center">
              <div className="w-full">
                <input
                  id="email"
                  {...register("email")}
                  placeholder="Enter your Email*"
                  disabled={isLoggingIn || isSendingLoginOtp}
                  className={`mt-1 block w-full rounded-[8px] bg-[#F4F5FC] px-3 py-3 sm:px-4 sm:py-4 text-base sm:text-sm text-[#05243F66] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none  ${isLoggingIn || isSendingLoginOtp
                    ? "cursor-not-allowed opacity-50"
                    : ""
                    }`}
                />
                {errors.email && (
                  <p className="animate-shake mt-1 text-xs text-[#A73957]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <div className="relative">
                  <input
                    id="password"
                    {...register("password")}
                    type={!showPassword ? "password" : "text"}
                    placeholder="Password*"
                    disabled={isLoggingIn}
                    className={`mt-1 block w-full rounded-[8px] bg-[#F4F5FC] px-3 py-3 sm:px-4 sm:py-4 text-base sm:text-sm text-[#05243F66] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none  ${isLoggingIn ? "cursor-not-allowed opacity-50" : ""
                      }`}
                  />
                  <div
                    onClick={() => !isLoggingIn && setShowPassword(!showPassword)}
                    className={`absolute top-1/2 right-3 -translate-y-1/2 transform text-[#05243F] opacity-40 transition-opacity duration-300 sm:right-4 ${isLoggingIn
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:opacity-100"
                      }`}
                  >
                    {!showPassword ? (
                      <FaRegEye size={18} />
                    ) : (
                      <FaRegEyeSlash size={18} />
                    )}
                  </div>
                </div>
                {errors.password && (
                  <p className="animate-shake mt-1 text-xs text-[#A73957]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-row items-center justify-between space-y-2 w-full">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      !isLoggingIn && setRememberMe(e.target.checked)
                    }
                    disabled={isLoggingIn}
                    className={`h-3 w-3 rounded border-[#F4F5FC] text-[#F4F5FC] focus:ring-[#F4F5FC] ${isLoggingIn
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                      }`}
                  />
                  <label
                    htmlFor="remember-me"
                    className={`ml-2 block text-xs text-[#05243F] opacity-40 ${isLoggingIn ? "cursor-not-allowed" : ""
                      }`}
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-xs">
                  <Link
                    to="/auth/forgot-password"
                    className={`text-[#A73957] opacity-70 transition-opacity duration-300 ${isLoggingIn
                      ? "pointer-events-none cursor-not-allowed opacity-30"
                      : "hover:opacity-100"
                      }`}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isLoggingIn}
                className={`flex-1 rounded-3xl bg-[#2389E3] px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:w-36 sm:py-2 ${isLoggingIn
                    ? "transform-none cursor-not-allowed opacity-50 hover:bg-[#2389E3] hover:text-white"
                    : ""
                  }`}
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </div> */}
            
 </div>
            <div className="mt-0 sm:mt-3 w-full">
              <div className="mt-2 flex flex-col space-y-2 sm:mt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className={`flex-1 rounded-3xl bg-[#2389E3] px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:w-36 sm:py-2 ${isLoggingIn
                      ? "transform-none cursor-not-allowed opacity-50 hover:bg-[#2389E3] hover:text-white"
                      : ""
                      }`}
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </button>
                </div>
                <div className="flex justify-center gap-x-3 items-center">
                  <span className="text-center text-sm font-normal text-[#05243F66] opacity-40">
                    or Login with
                  </span>
                  <button
                    disabled={isLoggingIn}
                    className={`h-10 w-10 rounded-full bg-[#F4F5FC] transition-all duration-300 sm:h-12 sm:w-12 ${isLoggingIn
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
                  {/* <button
                  disabled={isLoggingIn}
                  className={`h-10 w-10 rounded-full bg-[#F4F5FC] transition-all duration-300 sm:h-12 sm:w-12 ${
                    isLoggingIn
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-[#FFF4DD] active:scale-95"
                  }`}
                >
                  <img
                    src="https://www.svgrepo.com/show/448224/facebook.svg"
                    alt="Facebook"
                    className="mx-auto h-4 w-4"
                  />
                </button> */}
                </div>
              </div>
              <div className="mt-0 sm:mt-2 text-center">
                <Link
                  to="/auth/otp-login"
                  className="text-sm text-[#2389E3] transition-colors duration-300 hover:text-[#2389E3]/70"
                >
                  Login using OTP instead
                </Link>
              </div>
            </div>
           
</form>
            {/* 2FA Verification Modal */}
            {twoFactorRequired && (
              <TwoFactorVerification
                onVerify={handleVerifyTwoFactor}
                onCancel={cancelTwoFactor}
                isVerifying={isVerifyingTwoFactor}
              />
            )}

            {/* OTP Login Verification Modal */}
            {otpModalOpen && (
              <TwoFactorVerification
                onVerify={handleVerifyOtp}
                onCancel={() => setOtpModalOpen(false)}
                isVerifying={isVerifyingLoginOtp}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
