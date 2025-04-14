import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import AddCar from "./features/car/AddCar.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import RenewLicense from "./features/licenses/RenewLicense";
import Garage from "./features/garage/Garage.jsx";
import Licenses from "./features/licenses/Licenses.jsx";
import PaymentOptions from "./features/payment/PaymentOptions.jsx";
import VehiclePaper from "./features/licenses/VehiclePaper.jsx";
import ConfirmRequest from "./components/shared/ConfirmRequest.jsx";
import DriversLicense from "./features/licenses/DriversLicense.jsx";
import Settings from "./features/settings/Settings.jsx"
import PlateNumber from "./features/licenses/PlateNumber.jsx";

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
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BrowserRouter>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="dashboard/home" element={<Dashboard />} />
          <Route path="auth/login" element={<SignIn />}></Route>
          <Route path="auth/signup" element={<SignUp />}></Route>
          <Route path="auth/verify-account" element={<Verification />}></Route>
          <Route
            path="auth/verification-success"
            element={<VerificationSuccess />}
          ></Route>
          <Route path="add-car" element={<AddCar />}></Route>
          <Route path="licenses">
            <Route index element={<Licenses />} />
            <Route path="renew" element={<RenewLicense />} />
            <Route path="documents" element={<VehiclePaper />} />
            <Route path="drivers-license" element={<DriversLicense />} />
            <Route path="plate-number" element={<PlateNumber />}/>
            <Route path="confirm-request" element={<ConfirmRequest />} />
          </Route>
          <Route path="garage" element={<Garage />} />
          <Route
            path="payment"
            element={
              <PaymentOptions availableBalance={3000} renewalCost={1000} />
            }
          />
          <Route path="settings"> 
            <Route index element={<Settings />} />
            {/* <Route path="renew" element={<RenewLicense />} />
            <Route path="documents" element={<VehiclePaper />} />
            <Route path="confirm-request" element={<ConfirmRequest />} /> */}
          </Route>
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
