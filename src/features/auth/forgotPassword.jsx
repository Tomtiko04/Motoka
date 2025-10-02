import AuthLayout from "./AuthLayout";
import { useState } from "react";
function ForgotPassword() {
  const [stepcount, setStepcount] = useState(1);
  const nextStep = () => setStepcount((prev) => prev + 1);
  const prevStep = () => setStepcount((prev) => prev - 1);
  return (
    <>
      {stepcount === 1 && <StepOne nextStep={nextStep} />}
      {stepcount === 2 && <StepTwo nextStep={nextStep} prevStep={prevStep} />}
      {stepcount === 3 && <StepThree prevStep={prevStep} />}
    </>
  );
}

export default ForgotPassword;

const StepOne = ({ nextStep }) => {
  return (
    <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-fadeIn w-full max-w-[380px] rounded-[20px] bg-white p-4 shadow-lg sm:max-w-[420px] sm:p-6 md:max-w-[460px] md:p-8">
        <div className="text-center">
          <h2 className="my-2 text-lg font-medium text-[#05243F] sm:text-xl">
            Forgot your password?
          </h2>
          <p className="text-sm text-[#05243F]/40 sm:text-base">
            Please enter your email address to receive a verification code.
          </p>
        </div>
        <form className="mt-6 sm:mt-8 md:mt-9" action="#" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                // className="relative block  rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                className="placeholder`-[#05243F]/40 relative block h-12 w-full appearance-none rounded-lg bg-[#FFF4DD] px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-300 focus:z-10 focus:outline-none sm:text-base"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={nextStep}
              className="mx-auto mt-6 flex w-full justify-center rounded-3xl bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:mt-8 sm:w-fit sm:px-10 sm:py-3 sm:text-base md:mt-10"
            >
              Send Verification Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StepTwo = ({ nextStep, prevStep }) => {
  return (
    <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-fadeIn w-full max-w-[380px] rounded-[20px] bg-white p-4 shadow-lg sm:max-w-[420px] sm:p-6 md:max-w-[460px] md:p-8">
        <div className="text-center">
          <h2 className="my-2 text-lg font-medium text-[#05243F] sm:text-xl">
            Enter Verification Code
          </h2>
          <p className="text-sm text-[#05243F]/40 sm:text-base">
            We have sent a verification code to your email address. Please enter
            it below.
          </p>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="verification-code" className="sr-only">
                Verification Code
              </label>
              <input
                id="verification-code"
                name="code"
                type="text"
                autoComplete="one-time-code"
                required
                // className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                className="relative block h-12 w-full appearance-none rounded-lg bg-[#FFF4DD] px-3 py-2 text-sm font-medium text-gray-900 placeholder-[#05243F]/40 transition-colors duration-300 focus:z-10 focus:outline-none sm:text-base"
                placeholder="Verification Code"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                onClick={prevStep}
                className="font-medium text-[#2389E3] hover:text-[#05243F]"
                type="button"
              >
                Back
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={nextStep}
              className="mx-auto mt-6 flex w-full justify-center rounded-3xl bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:mt-8 sm:w-fit sm:px-10 sm:py-3 sm:text-base md:mt-10"
            >
              Verify Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StepThree = ({ prevStep }) => {
  return (
    <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-fadeIn w-full max-w-[380px] rounded-[20px] bg-white p-4 shadow-lg sm:max-w-[420px] sm:p-6 md:max-w-[460px] md:p-8">
        <div className="text-center">
          <h2 className="my-2 text-lg font-medium text-[#05243F] sm:text-xl">
            Reset Your Password
          </h2>
          <p className="text-sm text-[#05243F]/40 sm:text-base">
            Please enter your new password below.
          </p>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="-space-y-px rounded-md shadow-sm">
            <div className="mb-3">
              <label htmlFor="new-password" className="sr-only">
                New Password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block h-12 w-full appearance-none rounded-lg bg-[#FFF4DD] px-3 py-2 text-sm font-medium text-gray-900 placeholder-[#05243F]/40 transition-colors duration-300 focus:z-10 focus:outline-none sm:text-base"
                placeholder="New Password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block h-12 w-full appearance-none rounded-lg bg-[#FFF4DD] px-3 py-2 text-sm font-medium text-gray-900 placeholder-[#05243F]/40 transition-colors duration-300 focus:z-10 focus:outline-none sm:text-base"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                onClick={prevStep}
                className="font-medium text-[#2389E3] hover:text-[#05243F]"
                type="button"
              >
                Back
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="mx-auto mt-6 flex w-full justify-center rounded-3xl bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95 sm:mt-8 sm:w-fit sm:px-10 sm:py-3 sm:text-base md:mt-10"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
