import React from "react";
import Header from "../../components/Header";
import { Outlet } from "react-router-dom";


export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-grow items-center justify-center py-4">
        <Outlet />
      </div>
    </div>
  );
}
