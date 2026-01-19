import React from "react";
import { Link } from "react-router-dom";

export default function NotFound404() {
  return (
    <div className="flex h-screen justify-center">
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E1E6F4] text-[#2389E3]">
            404
          </div>
          <h1 className="text-2xl font-semibold text-[#05243F]">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-[#05243F]/70">
            The page you’re looking for doesn’t exist or may have been moved.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              type="button"
              to="/dashboard"
              className="rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1B6CB3]"
            >
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-full border border-[#E1E6F4] px-6 py-2 text-sm font-semibold text-[#05243F] hover:bg-[#F4F5FC]"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
