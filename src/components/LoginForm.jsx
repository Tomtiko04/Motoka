import React from "react";
import { Link } from "react-router-dom";
export default function LoginForm() {
  return (
    <div>
      <div className="w-full p-8 md:w-1/2">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500">
              Don't have an account?
            </span>
            <Link
              to="/signup"
              className="ml-1 text-sm text-blue-500 hover:text-blue-600"
            >
              Signup
            </Link>
          </div>
        </div>

        <form>
          <div className="mb-4">
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
              className="w-full rounded-md border border-gray-300 bg-yellow-50 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
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
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-500"
              >
                Remember me
              </label>
            </div>
            <div>
              <a href="#" className="text-sm text-rose-500 hover:text-rose-600">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        {/* Social login */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Login with socials
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button className="rounded-md border border-gray-300 p-2 hover:bg-gray-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
            </button>
            <button className="rounded-md border border-gray-300 p-2 hover:bg-gray-50">
              <svg
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
