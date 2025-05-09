import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaCarAlt, FaPlus } from "react-icons/fa";
import MercedesLogo from "../../assets/images/mercedes-logo.png";

export default function RenewLicense() {
  const navigate = useNavigate();
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    fee: "",
    contact: "",
  });

  const handleDeliveryChange = (field, value) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePayNow = () => {
    // Handle payment logic here
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mt-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-1/2 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
          >
            <IoIosArrowBack className="h-5 w-5" />
          </button>
          <h1 className="text-center text-2xl font-medium text-[#05243F]">
            Renew License
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8">
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Left Column - Car Details */}
          <div className="mt-2">
            <div className="rounded-2xl bg-white px-4 py-5 shadow">
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

              <div className="w-full">
                <div className="flex items-center gap-2 rounded-full bg-[#FFEFCE] px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#FDB022]"></span>
                  <span className="text-sm font-medium text-[#05243F]">
                    Expires in 3 days
                  </span>
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm text-[#697C8C]">Document Details</h3>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-[#F4F5FC] px-5 py-2.5 text-sm font-medium text-[#05243F] transition-colors hover:bg-[#E5F3FF]">
                  Road Worthiness
                </button>
                <button className="rounded-full bg-[#F4F5FC] px-5 py-2.5 text-sm font-medium text-[#05243F] transition-colors hover:bg-[#E5F3FF]">
                  Vehicle License
                </button>
                <button className="rounded-full bg-[#F4F5FC] px-5 py-2.5 text-sm font-medium text-[#05243F] transition-colors hover:bg-[#E5F3FF]">
                  Insurance
                </button>
                <button className="rounded-full bg-[#F4F5FC] px-5 py-2.5 text-sm font-medium text-[#05243F] transition-colors hover:bg-[#E5F3FF]">
                  Proof of Ownership
                </button>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="absolute top-0 left-1/2 hidden h-full w-[1px] -translate-x-1/2 bg-[#e9ecff] md:block"></div>

          {/* Right Column - Payment Details */}
          <div className="mt-2">
            <div className="rounded-2xl px-4">
              <div className="mb-6">
                <div className="text-base font-normal text-[#697C8C]">
                  Payment Details
                </div>
              </div>

              {/* Renewal Amount */}
              <div className="mb-6">
                <div className="text-sm font-medium text-[#05243F]">
                  Renewal Amount
                </div>
                <div className="mt-3 w-full rounded-[10px] border-3 border-[#F4F5FC] p-4 text-[16px] font-semibold text-[#05243F]/40">
                  ₦30,000
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <div className="text-sm font-medium text-[#05243F]">
                  Delivery Address
                </div>
                <input
                  type="text"
                  value={deliveryDetails.address}
                  onChange={(e) =>
                    handleDeliveryChange("address", e.target.value)
                  }
                  className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                  placeholder="Enter delivery address"
                />
              </div>

              {/* Delivery Fee */}
              <div className="mb-6">
                <div className="text-sm font-medium text-[#05243F]">
                  Delivery Fee
                </div>
                <input
                  type="text"
                  value={deliveryDetails.fee}
                  onChange={(e) => handleDeliveryChange("fee", e.target.value)}
                  className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                  placeholder="Enter delivery fee"
                />
              </div>

              {/* Delivery Contact */}
              <div className="mb-6">
                <div className="text-sm font-medium text-[#05243F]">
                  Delivery Contact
                </div>
                <input
                  type="tel"
                  value={deliveryDetails.contact}
                  onChange={(e) =>
                    handleDeliveryChange("contact", e.target.value)
                  }
                  className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                  placeholder="08012345678"
                />
              </div>

              {/* Pay Now Button */}
              <button
                onClick={handlePayNow}
                className="mt-2 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3]"
              >
                ₦35,000 Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
