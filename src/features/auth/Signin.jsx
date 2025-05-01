import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import ImageSlider from "../../components/ImageSlider";
import toast from "react-hot-toast";
import { useLogin } from "./useAuth";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoggingIn } = useLogin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Retrieve stored email from localStorage
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
      setRememberMe(true);
    }
  }, []);

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
    if (isValid) {
      const loadingToast = toast.loading("Logging in...");

      try {
        await login(formData, {
          onSuccess: () => {
            toast.dismiss(loadingToast);
            // Store email in localStorage if remember me is checked
            if (rememberMe) {
              localStorage.setItem("rememberedEmail", formData.email);
            } else {
              localStorage.removeItem("rememberedEmail");
            }
          },
          onError: () => {
            toast.dismiss(loadingToast);
          },
        });
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error(error.message || "Login failed");
        throw newErrors(error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="animate-fadeIn flex max-h-[80vh] w-full max-w-4xl flex-col-reverse justify-between gap-4 overflow-hidden rounded-[20px] bg-white p-3 shadow-lg sm:p-4 md:flex-row md:p-5">
        <div className="hidden w-full md:block md:w-1/2">
          <ImageSlider />
        </div>

        <div className="hidden w-[1px] bg-[#F2F2F2] md:block"></div>

        <div className="w-full overflow-hidden md:w-1/2">
          <div className="animate-slideDown mb-4 flex flex-col items-center justify-between space-y-1 sm:mb-6 sm:flex-row sm:space-y-0 md:mt-3">
            <h2 className="text-lg font-bold text-[#05243F] sm:text-xl">
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

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[#05243F] sm:mb-2"
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
                className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-3 py-2 text-sm font-semibold text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-4 sm:py-3"
              />
              {errors.email && (
                <p className="animate-shake mt-1 text-xs text-[#A73957]">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-[#05243F] sm:mb-2"
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
                  className="mt-1 block w-full rounded-xl bg-[#F4F5FC] px-3 py-2 text-sm font-semibold text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-4 sm:py-3"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform cursor-pointer text-[#05243F] opacity-40 transition-opacity duration-300 hover:opacity-100 sm:right-4"
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
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3 w-3 cursor-pointer rounded border-[#F4F5FC] text-[#F4F5FC] focus:ring-[#F4F5FC]"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs text-[#05243F] opacity-40"
                >
                  Remember me
                </label>
              </div>

              <div className="text-xs">
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
                disabled={isLoggingIn}
                className={`mx-auto mt-3 flex w-full justify-center rounded-3xl bg-[#2389E3] px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:mt-6 sm:w-36 sm:py-2 ${isLoggingIn ? "cursor-not-allowed opacity-50" : ""}`}
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F2F2F2]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-[#D9D9D9]">or</span>
              </div>
            </div>

            <div className="mt-2 flex flex-col space-y-2 sm:mt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <span className="text-center text-xs font-medium text-[#05243F] opacity-40">
                Login with socials
              </span>
              <div className="flex justify-center gap-x-2">
                <button className="h-10 w-10 rounded-full bg-[#F4F5FC] transition-all duration-300 hover:bg-[#FFF4DD] active:scale-95 sm:h-12 sm:w-12">
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="mx-auto h-4 w-4"
                  />
                </button>
                <button className="h-10 w-10 rounded-full bg-[#F4F5FC] transition-all duration-300 hover:bg-[#FFF4DD] active:scale-95 sm:h-12 sm:w-12">
                  <img
                    src="https://www.svgrepo.com/show/448224/facebook.svg"
                    alt="Facebook"
                    className="mx-auto h-4 w-4"
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