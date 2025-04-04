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
          </Route>
          <Route path="garage" element={<Garage />} />
          <Route path="payment" element={<PaymentOptions availableBalance={3000} renewalCost={1000}/>}/>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            // backgroundColor: "bg-orange-500",
            // color: "text-white",
          },
        }}
      />
    </QueryClientProvider>
  );
}
