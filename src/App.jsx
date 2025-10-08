import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import toast, { Toaster } from "react-hot-toast";

import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Verification from "./pages/Verification.jsx";
import VerificationSuccess from "./features/auth/VerificationSuccess";
import OTPLogin from "./features/auth/OTPLogin.jsx";
import AddCar from "./features/car/AddCar.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import RenewLicense from "./features/licenses/RenewLicense";
import Garage from "./features/garage/Garage.jsx";
import Licenses from "./features/licenses/Licenses.jsx";
import PaymentOptions from "./features/payment/PaymentOptions.jsx";
import PaystackPayment from "./features/payment/PaystackPayment.jsx";
import PaystackCallback from "./pages/PaystackCallback.jsx";
import VehiclePaper from "./features/licenses/VehiclePaper.jsx";
import ConfirmRequest from "./components/shared/ConfirmRequest.jsx";
import DriversLicense from "./features/licenses/DriversLicense.jsx";
import Settings from "./features/settings/Settings.jsx";
import PlateNumber from "./features/licenses/PlateNumber.jsx";
import PlateDetails from "./features/licenses/platenumber/PlateDetails.jsx";
import LocalGovPaper from "./features/licenses/LocalGovPaper.jsx";
import TintPermit from "./features/licenses/TintPermit.jsx";
import IntlDriverLicense from "./features/licenses/IntlDriverLicense.jsx";
import TrafficRules from "./features/trafficrules/TrafficRules.jsx";
import AuthLayout from "./features/auth/AuthLayout.jsx";
import AppLayout from "./components/AppLayout";
import GuestRoute from "./components/GuestRoute";
import ScrollToTop from "./components/scrollToTop.jsx";
import AddCarRoute from "./components/AddCarRoute";
import useModalStore from "./store/modalStore.js";
import CarDetailsModal from "./components/CarDetailsModal.jsx";
import CartPage from "./features/ladipo/CartPage.jsx";
import Ladipo from "./features/ladipo/Ladipo.jsx";
import ProductModal from "./features/ladipo/components/modal.jsx";
import CarReceipt from "./pages/CarReceipt.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import CarDocuments from "./pages/CarDocuments.jsx";
import Notification from "./pages/notification.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import ForgotPassword from "./features/auth/forgotPassword.jsx";
import NotFound404 from "./components/NotFound404.jsx";
import LandingPage from "./Landing/Landing.jsx";

export default function App() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 0,
      },
    },
  });
  const { isOpen } = useModalStore();
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BrowserRouter>
        <ScrollToTop />
        {isOpen && <CarDetailsModal />}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="landing" element={<LandingPage />} />
          {/* Auth Routes */}
          <Route path="auth" element={<AuthLayout />}>
            <Route
              path="login"
              element={
                <GuestRoute>
                  <SignIn />
                </GuestRoute>
              }
            />
            <Route
              path="otp-login"
              element={
                <GuestRoute>
                  <OTPLogin />
                </GuestRoute>
              }
            />
            <Route
              path="signup"
              element={
                <GuestRoute>
                  <SignUp />
                </GuestRoute>
              }
            />
            <Route
              path="verify-account"
              element={
                <GuestRoute>
                  <Verification />
                </GuestRoute>
              }
            />
            {/* Remove GuestRoute from verification-success */}
            <Route
              path="verification-success"
              element={<VerificationSuccess />}
            />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Add Car Route - Special case outside AppLayout */}
          <Route
            path="add-car"
            element={
              <AddCarRoute>
                <AddCar />
              </AddCarRoute>
            }
          />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="successful" element={<SuccessPage />} />
            <Route path="documents" element={<CarDocuments />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="notifications" element={<Notification />} />
            <Route path="licenses">
              <Route index element={<Licenses />} />
              <Route path="renew" element={<RenewLicense />} />
              <Route path="documents" element={<VehiclePaper />} />
              <Route path="drivers-license" element={<DriversLicense />} />
              <Route path="plate-number" element={<PlateNumber />} />
              <Route path="plate-number/:type" element={<PlateDetails />} />
              <Route
                path="local-government-papers"
                element={<LocalGovPaper />}
              />
              <Route path="tint-permit" element={<TintPermit />} />
              <Route
                path="international-driver's-license"
                element={<IntlDriverLicense />}
              />
              <Route path="confirm-request" element={<ConfirmRequest />} />
            </Route>
            <Route path="documents" element={<CarDocuments />} />
            <Route path="notification" element={<Notification />} />
            <Route path="garage" element={<Garage />} />
            <Route path="traffic-rules" element={<TrafficRules />} />
            <Route
              path="payment"
              element={
                <PaymentOptions availableBalance={3000} renewalCost={1000} />
              }
            />
            <Route path="payment/paystack" element={<PaystackPayment />} />
            <Route
              path="payment/paystack/callback"
              element={<PaystackCallback />}
            />
            <Route path="settings">
              <Route index element={<Settings />} />
            </Route>
            <Route path="ladipo">
              <Route index element={<Ladipo />} />
              <Route path=":slug" element={<ProductModal />} />
              <Route path="cart-page" element={<CartPage />} />
            </Route>
            <Route path="payment-success" element={<SuccessPage />} />
            <Route path="payment/car-receipt/:carId" element={<CarReceipt />} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin/*" element={<AdminRoutes />} />
          {/* Not Found */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ margin: "16px" }}
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: "#F9FAFC",
              border: "1px solid #E1E6F4",
              color: "#05243F",
            },
            iconTheme: {
              primary: "#2389E3",
              secondary: "#FFFFFF",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#FDF6E8",
              border: "1px solid #FDB022",
              color: "#05243F",
            },
            iconTheme: {
              primary: "#FDB022",
              secondary: "#FFFFFF",
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: "#F9FAFC",
              border: "1px solid #2389E3",
              color: "#05243F",
            },
            iconTheme: {
              primary: "#2389E3",
              secondary: "#F9FAFC",
            },
          },
          style: {
            fontSize: "14px",
            maxWidth: "400px",
            padding: "12px 16px",
            borderRadius: "12px",
            boxShadow:
              "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
