import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import ImageSlider from "../../components/ImageSlider";
import axios from "axios";
import toast from "react-hot-toast";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    let isValid = true;

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email/Phone number is required";
      isValid = false;
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);

    // if (isValid) {
    //   let loadingToast;
    //   try {
    //     // Show loading toast
    //     loadingToast = toast.loading('Signing in...');

    //     const response = await axios.post("https://backend.motoka.com.ng/api/login2", {
    //       email: formData.email,
    //       password: formData.password,
    //     });

    //     if (response.data && response.data.token) {
    //       // Store auth token securely
    //       localStorage.setItem("token", response.data.token);
          
    //       // Store user data if available
    //       if (response.data.user) {
    //         localStorage.setItem("user", JSON.stringify(response.data.user));
    //       }

    //       // Set up axios defaults for future requests
    //       axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
    //       // Dismiss loading and show success
    //       toast.dismiss(loadingToast);
    //       toast.success("Login successful!");
          
    //       // Redirect to dashboard
    //       navigate("/");
    //     } else {
    //       // Dismiss loading and show error
    //       toast.dismiss(loadingToast);
    //       toast.error("Something went wrong. Please try again.");
    //     }
    //   } catch (error) {
    //     // Always dismiss loading first
    //     toast.dismiss(loadingToast);

    //     // Handle different types of errors
    //     if (error.response) {
    //       // Server responded with error
    //       const errorMessage = error.response.data?.message || "Invalid credentials";
    //       toast.error(errorMessage);

    //       // Handle specific error cases
    //       if (error.response.status === 422) {
    //         // Validation errors
    //         const serverErrors = error.response.data?.errors;
    //         if (serverErrors) {
    //           setErrors(prev => ({
    //             ...prev,
    //             email: serverErrors.email?.[0] || "",
    //             password: serverErrors.password?.[0] || "",
    //           }));
    //         }
    //       } else if (error.response.status === 401) {
    //         // Unauthorized - clear any existing tokens
    //         localStorage.removeItem("token");
    //         localStorage.removeItem("user");
    //         setErrors(prev => ({
    //           ...prev,
    //           password: "Invalid email or password",
    //         }));
    //       } else if (error.response.status === 403) {
    //         // Account not verified
    //         toast.error("Please verify your email address first");
    //         localStorage.setItem("email", formData.email);
    //         navigate("/auth/verify-account");
    //         return;
    //       }
    //     } else if (error.request) {
    //       // Request made but no response
    //       toast.error("Unable to reach the server. Please check your internet connection.");
    //     } else {
    //       // Something else went wrong
    //       toast.error("An unexpected error occurred. Please try again.");
    //     }
    //     console.error("Signin Error:", error);
    //   }
    // }

     if (isValid) {
       let loadingToast;
       try {
         // Show loading toast
         loadingToast = toast.loading("Signing in...");

         const response = await axios.post(
           "https://backend.motoka.com.ng/api/login2",
           {
             email: formData.email,
             password: formData.password,
           },
         );

        //  if (response.data && response.data.token) {
        //    // Store auth token securely
        //    localStorage.setItem("token", response.data.token);

        //    // Store user data if available
        //    if (response.data.user) {
        //      localStorage.setItem("user", JSON.stringify(response.data.user));
        //    }

        //    // Set up axios defaults for future requests
        //    axios.defaults.headers.common["Authorization"] =
        //      `Bearer ${response.data.token}`;

           // Dismiss loading and show success
           toast.dismiss(loadingToast);
           toast.success("Login successful!");

           // Redirect to dashboard
           navigate("/");
       } catch (error) {
         // Always dismiss loading first
         toast.dismiss(loadingToast);

         // Handle different types of errors
         if (error.response) {
           // Server responded with error
           const errorMessage =
             error.response.data?.message || "Invalid credentials";
           toast.error(errorMessage);

           // Handle specific error cases
           if (error.response.status === 422) {
             // Validation errors
             const serverErrors = error.response.data?.errors;
             if (serverErrors) {
               setErrors((prev) => ({
                 ...prev,
                 email: serverErrors.email?.[0] || "",
                 password: serverErrors.password?.[0] || "",
               }));
             }
           } else if (error.response.status === 401) {
             // Unauthorized - clear any existing tokens
             localStorage.removeItem("token");
             localStorage.removeItem("user");
             setErrors((prev) => ({
               ...prev,
               password: "Invalid email or password",
             }));
           } else if (error.response.status === 403) {
             // Account not verified
             toast.error("Please verify your email address first");
             localStorage.setItem("email", formData.email);
             navigate("/auth/verify-account");
             return;
           }
         } else if (error.request) {
           // Request made but no response
           toast.error(
             "Unable to reach the server. Please check your internet connection.",
           );
         } else {
           // Something else went wrong
           toast.error("An unexpected error occurred. Please try again.");
         }
         console.error("Signin Error:", error);
       }
     }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="animate-fadeIn flex w-full max-w-4xl flex-col-reverse justify-between gap-8 rounded-[20px] bg-white p-4 shadow-lg sm:p-6 md:flex-row md:p-6">
        <div className="hidden w-full md:block md:w-1/2">
          <ImageSlider />
        </div>

        <div className="hidden w-[1px] bg-[#F2F2F2] md:block"></div>

        <div className="w-full md:w-1/2">
          <div className="animate-slideDown mb-6 flex flex-col items-center justify-between space-y-2 sm:mb-9 sm:flex-row sm:space-y-0 md:mt-6">
            <h2 className="text-xl font-bold text-[#05243F] sm:text-2xl">
              Login
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-[#a8b2bd]">
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#05243F] sm:mb-3"
              >
                Email/Phone no.
              </label>
              <input
                id="email"
                name="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                placeholder="sample@gmail.com"
                className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm font-semibold text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
              />
              {errors.email && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.email}
                </p>
              )}
            </div>

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
                  name="password"
                  type={!showPassword ? "password" : "text"}
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm font-semibold text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 transform cursor-pointer text-[#05243F] opacity-40 transition-opacity duration-300 hover:opacity-100 sm:right-5"
                >
                  {!showPassword ? (
                    <FaRegEye size={20} />
                  ) : (
                    <FaRegEyeSlash size={20} />
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="animate-shake mt-1 text-sm text-[#A73957]">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-[#F4F5FC] text-[#F4F5FC] focus:ring-[#F4F5FC]"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm text-[#05243F] opacity-40"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="text-[#A73957] opacity-70 transition-opacity duration-300 hover:opacity-100"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="mx-auto mt-8 flex w-full justify-center rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95 sm:mt-14 sm:w-36"
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-6">
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
                Login with socials
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
          </div>
        </div>
      </div>
    </div>
  );
}
