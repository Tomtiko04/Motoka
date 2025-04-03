import React from "react";
import AppLayout from "../../components/AppLayout";
import { FaRegEye, FaCarAlt, FaPlus } from "react-icons/fa";
import { PiHandWavingFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import MercedesLogo from "../../assets/images/mercedes-logo.png";

export default function Garage() {
  const navigate = useNavigate();
  function handleLicence() {
    navigate("/");
  }

  function handleRenewLicense() {
    navigate("licenses/renew");
  }

  function handleAddCar(){
    navigate("/add-car");
  }

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mt-4 flex flex-col gap-1">
              <h1 className="text-base font-medium text-[#05243F]/40 sm:text-lg">
                Welcome
              </h1>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-medium text-[#05243F] sm:text-3xl">
                  Anjola
                </h1>
                <span role="img" aria-label="wave">
                  <PiHandWavingFill color="#EBB850" size={30} />
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm font-normal text-[#05243F]/44 sm:text-base">
              Transaction History
            </span>
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 sm:gap-3 sm:px-4 sm:py-2">
              <span>
                <FaRegEye color="#697C8C" size={24} />
              </span>
              <span className="text-lg font-semibold text-[#2389E3] sm:text-xl">
                ₦234,098
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-5 flex flex-wrap gap-3 sm:gap-4">
          <button
            onClick={handleLicence}
            className="rounded-full bg-[#E1E5EE] px-4 py-2 text-sm font-semibold text-[#697C8C] transition-all hover:bg-[#d1d6e0] hover:shadow-md sm:text-base"
          >
            Licence Status
          </button>
          <button className="rounded-full bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1b6dbd] hover:shadow-md sm:text-base">
            Garage
          </button>

          <button className="relative rounded-full bg-[#E1E5EE] px-4 py-2 text-sm font-semibold text-[#697C8C] transition-all hover:bg-[#d1d6e0] hover:shadow-md sm:text-base">
            Ladipo
            <span className="absolute -top-2 -right-8 flex h-[17px] items-center justify-center rounded-full bg-[#FFEFCE] px-2.5 text-[8px] whitespace-nowrap text-[#BA8823]">
              Coming Soon
            </span>
          </button>
        </div>

        {/* Car Details Card */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* First car */}
          <div className="rounded-2xl bg-white px-4 py-5">
            <div className="mb-6">
              <div className="text-sm font-light text-[#05243F]/60">
                Car Model
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="">
                    <img
                      src={MercedesLogo}
                      alt="Mercedes"
                      className="h-6 w-6"
                    />
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
                className="rounded-full bg-[#2389E3] px-6 py-2 text-base font-semibold text-white hover:bg-[#2389E3]/90"
              >
                Renew Now
              </button>
            </div>
          </div>

          {/* second car */}
          <div className="rounded-2xl bg-white px-4 py-5">
            <div className="mb-6">
              <div className="text-sm font-light text-[#05243F]/60">
                Car Model
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="">
                    <img
                      src={MercedesLogo}
                      alt="Mercedes"
                      className="h-6 w-6"
                    />
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
                className="rounded-full bg-[#2389E3] px-6 py-2 text-base font-semibold text-white hover:bg-[#2389E3]/90"
              >
                Renew Now
              </button>
            </div>
          </div>

          {/* When you mouse hover the plus icon it should rotate */}
          <div className="flex items-center justify-center rounded-2xl bg-white p-6">
            <button
              onClick={handleAddCar}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2389E3] text-xl hover:animate-spin">
                <FaPlus className="text-xl text-white" />
              </span>
              <span className="text-base font-medium text-[#05243F]">
                Add a New Car
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
