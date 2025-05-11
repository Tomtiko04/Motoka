import React from "react";
import { useNavigate } from "react-router-dom";

import WelcomeSection from "../../components/WelcomeSection";
import NavigationTabs from "../../components/NavigationTabs";
import CarDetailsCard from "../../components/CarDetailsCard";
import AddCarCard from "../../components/AddCarCard";
import QuickActions from "./components/QuickActions";

export default function Dashboard() {
  const navigate = useNavigate();

  function handleRenewLicense() {
    navigate("/licenses/renew");
  }

  function handleGarage() {
    navigate("/garage");
  }

  function handleAddCar() {
    navigate("/add-car");
  }

  const userName = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).name
    : "";

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <WelcomeSection userName={userName} />
      <NavigationTabs onGarageClick={handleGarage} activeTab="license" />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CarDetailsCard onRenewClick={handleRenewLicense} />
        <AddCarCard onAddCarClick={handleAddCar} />
      </div>

      <QuickActions />
    </div>
  );
}
