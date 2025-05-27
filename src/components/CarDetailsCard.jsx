import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import MercedesLogo from "../assets/images/mercedes-logo.png";

const defaultLogo = MercedesLogo;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function CarDetailsCard({ onRenewClick, carDetail, isRenew }) {
  const [carLogo, setCarLogo] = useState(MercedesLogo);

  const handleRenewClick = () => {
    onRenewClick(carDetail);
  };

  useEffect(() => {
    const loadCarLogo = async () => {
      try {
        const carMake = carDetail?.vehicle_make?.toLowerCase() || "";
        if (carMake) {
          const logoUrl = `https://www.carlogos.org/car-logos/${carMake}-logo.png`;
          const response = await fetch(logoUrl, { method: "HEAD" });
          if (response.ok) {
            setCarLogo(logoUrl);
          } else {
            setCarLogo(defaultLogo);
          }
        }
      } catch {
        setCarLogo(defaultLogo);
      }
    };

    loadCarLogo();
  }, [carDetail?.vehicle_make]);

  // Another solution that works but we will need to upload our logo on that platform
  // useEffect(() => {
  //   const loadCarLogo = async () => {
  //     try {
  //       const carMake = carDetail?.vehicle_make?.toLowerCase() || "";
  //       if (carMake) {
  //         const logoUrl = `https://i.ibb.co/${getCarLogoPath(carMake)}`;
  //         setCarLogo(logoUrl);
  //       }
  //     } catch {
  //       setCarLogo(MercedesLogo);
  //     }
  //   };

  //   loadCarLogo();
  // }, [carDetail?.vehicle_make]);

  // const getCarLogoPath = (carMake) => {
  //   const logoMap = {
  //     toyota: "L8QZJ8p/toyota-logo.png",
  //     bmw: "L8QZJ8p/bmw-logo.png",
  //     mercedes: "L8QZJ8p/mercedes-logo.png",
  //     audi: "L8QZJ8p/audi-logo.png",
  //     honda: "L8QZJ8p/honda-logo.png",
  //     ford: "L8QZJ8p/ford-logo.png",
  //     hyundai: "L8QZJ8p/hyundai-logo.png",
  //     kia: "L8QZJ8p/kia-logo.png",
  //     nissan: "L8QZJ8p/nissan-logo.png",
  //     volkswagen: "L8QZJ8p/volkswagen-logo.png",
  //   };

  //   return logoMap[carMake] || "L8QZJ8p/default-car-logo.png";
  // };

  return (
    <div className="rounded-2xl bg-white px-4 py-5">
      <div className="mb-6">
        <div className="text-sm font-light text-[#05243F]/60">Car Model</div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="">
              <img
                src={carLogo}
                lazyloading="lazy"
                alt={carDetail?.vehicle_make || "Car"}
                className="h-6 w-6 object-contain"
                // onError={() => setCarLogo(MercedesLogo)}
              />
            </div>
            <h3 className="text-xl font-semibold text-[#05243F]">
              {carDetail?.vehicle_model || "-"}
            </h3>
          </div>
          <div>
            <Icon icon="ion:car-sport-sharp" fontSize={30} color="#2389E3" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <div>
          <div className="text-sm text-[#05243F]/60">Plate No:</div>
          <div className="text-base font-semibold text-[#05243F]">
            {carDetail?.plate_number || "-"}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-[#05243F]/60">Exp. Date</div>
          <div className="text-base font-semibold text-[#05243F]">
            {formatDate(carDetail?.expiry_date)}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-[#05243F]/60">Car Type</div>
          <div className="text-base font-semibold text-[#05243F]">
            {carDetail?.vehicle_make || "-"}
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
        {isRenew && (
          <button
            onClick={handleRenewClick}
            className="rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
          >
            Renew Now
          </button>
        )}
      </div>
    </div>
  );
}

{
  /* <div className="flex items-center gap-2 rounded-full bg-[#FFE8E8] px-4 py-1.5">
  <span className="h-2 w-2 rounded-full bg-[#DB8888]"></span>
  <span className="text-sm font-medium text-[#05243F]">License Expired</span>
</div>; */
}
