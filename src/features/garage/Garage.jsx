import React from "react";
import { FaRegEye, FaCarAlt, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import MercedesLogo from "../../assets/images/mercedes-logo.png";
import WelcomeSection from "../../components/WelcomeSection";
import NavigationTabs from "../../components/NavigationTabs";
import AddCarCard from "../../components/AddCarCard";
import { useGetCars } from "../car/useCar";
import LoadingSpinner from "../../components/LoadingSpinner";
import CarDetailsCard from "../../components/CarDetailsCard";

export default function Garage() {
  const { cars, isLoading } = useGetCars();

  console.log(cars);

  const navigate = useNavigate();
  function handleLicence() {
    navigate("/");
  }

  function handleRenewLicense() {
    navigate("licenses/renew");
  }

  function handleAddCar() {
    navigate("/add-car");
  }

  const userName = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).name
    : "";

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <WelcomeSection userName={userName} />

      {/* Navigation Tabs */}
      <NavigationTabs onLicenseClick={handleLicence} activeTab="garage" />

      {/* Car Details Card */}
      {isLoading ? (
        <div className="flex justify-center items-center py-5">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.isArray(cars?.cars) &&
            cars?.cars.map((car, index) => (
              <CarDetailsCard
                key={index}
                carDetail={car}
                onRenewClick={handleRenewLicense}
              />
            ))}
          <AddCarCard onAddCarClick={handleAddCar} />
        </div>
      )}
    </div>
  );
}

  /* First car */

  /* <div className="rounded-2xl bg-white px-4 py-5">
          <div className="mb-6">
            <div className="text-sm font-light text-[#05243F]/60">
              Car Model
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="">
                  <img src={MercedesLogo} alt="Mercedes" className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#05243F]">
                  Mercedes Benz
                </h3>
              </div>
              <div>
                <FaCarAlt className="text-3xl text-[#2389E3]" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <div>
              <div className="text-sm text-[#05243F]/60">Plate No:</div>
              <div className="text-base font-semibold text-[#05243F]">
                LSD1234
              </div>
            </div>
            <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
            <div>
              <div className="text-sm text-[#05243F]/60">Exp. Date</div>
              <div className="text-base font-semibold text-[#05243F]">
                04-05-25
              </div>
            </div>
            <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
            <div>
              <div className="text-sm text-[#05243F]/60">Car Type</div>
              <div className="text-base font-semibold text-[#05243F]">
                Saloon
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full bg-[#FFE8E8] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#DB8888]"></span>
              <span className="text-sm font-medium text-[#05243F]">
                License Expired
              </span>
            </div>
            <button
              onClick={handleRenewLicense}
              className="rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
            >
              Renew Now
            </button>
          </div>
        </div> */

  /* second car */

  /* <div className="rounded-2xl bg-white px-4 py-5">
          <div className="mb-6">
            <div className="text-sm font-light text-[#05243F]/60">
              Car Model
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="">
                  <img src={MercedesLogo} alt="Mercedes" className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#05243F]">
                  Mercedes Benz
                </h3>
              </div>
              <div>
                <FaCarAlt className="text-3xl text-[#2389E3]" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <div>
              <div className="text-sm text-[#05243F]/60">Plate No:</div>
              <div className="text-base font-semibold text-[#05243F]">
                LSD1234
              </div>
            </div>
            <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
            <div>
              <div className="text-sm text-[#05243F]/60">Exp. Date</div>
              <div className="text-base font-semibold text-[#05243F]">
                04-05-25
              </div>
            </div>
            <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
            <div>
              <div className="text-sm text-[#05243F]/60">Car Type</div>
              <div className="text-base font-semibold text-[#05243F]">
                Saloon
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full bg-[#FFEFCE] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FDB022]"></span>
              <span className="text-sm font-medium text-[#05243F]">
                Expires in 3 days
              </span>
            </div>
            <button
              onClick={handleRenewLicense}
              className="rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
            >
              Renew Now
            </button>
          </div>
        </div> */