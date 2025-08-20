import React from "react";
import Header from "../../components/Header";
import { Outlet } from "react-router-dom";


export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-grow flex-col w-full px-0 mt-8 sm:mt-0 sm:items-center sm:justify-center sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
