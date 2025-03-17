import React from "react";
import { Link } from "react-router-dom";
import ImageSlider from "../../components/ImageSlider";

export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Left side with image slider */}
        <div className="hidden flex-col items-center justify-center bg-yellow-50 p-12 text-center md:flex md:w-1/2">
          <ImageSlider />
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Super Fast
          </h2>
          <h2 className="text-xl font-bold text-gray-800">
            Turn Around Time
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            We Process your papers and within 24hrs your papers would be ready for pickup or delivery.
          </p>
        </div>

        {/* Right side with signup form */}
        <div className="w-full p-8 md:w-1/2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Sign up</h2>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">
                Already have an account?
              </span>
              <Link
                to="/signin"
                className="ml-1 text-sm text-blue-500 hover:text-blue-600"
              >
                Sign in
              </Link>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label
                htmlFor="emailOrPhone"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email/Phone no.
              </label>
              <input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                required
                placeholder="sample@gmail.com"
                className="mt-1 w-full rounded-md border border-gray-300 bg-yellow-50 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="********"
                className="mt-1 w-full rounded-md border border-gray-300 bg-yellow-50 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-500"
              >
                I agree to the Terms and Conditions
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign up
            </button>
          </form>

          {/* Social signup */}
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">
                  Sign up with socials
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button className="flex items-center justify-center rounded-md border border-gray-300 p-2 hover:bg-gray-50">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
              </button>
              <button className="flex items-center justify-center rounded-md border border-gray-300 p-2 hover:bg-gray-50">
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="Facebook"
                  className="h-5 w-5"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}