import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import MercedesLogo from "../../assets/images/mercedes-logo.png";
import useModalStore from "../../store/modalStore";

const defaultLogo = MercedesLogo;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to determine status based on backend expiry_status
const getExpiryStatusStyle = (expiryStatus) => {
  if (!expiryStatus || !expiryStatus.status) {
    return { 
      bgColor: "#E8F5E8", 
      dotColor: "#4CAF50",
      message: "No reminder available" 
    };
  }

  const { status, label, days_remaining } = expiryStatus;

  // Map backend status to UI colors
  if (status === "overdue") {
    return { 
      bgColor: "#FFE8E8", 
      dotColor: "#DB8888",
      message: label || "Overdue"
    };
  } else if (status === "reminder") {
    // Show red/danger for 0-3 days, warning for 4-30 days
    if (days_remaining !== null && days_remaining <= 3) {
      return { 
        bgColor: "#FFE8E8", 
        dotColor: "#DB8888",
        message: label || `${days_remaining} day${days_remaining === 1 ? '' : 's'} remaining`
      };
    }
    return { 
      bgColor: "#FFEFCE", 
      dotColor: "#FDB022",
      message: label || `${days_remaining} days remaining`
    };
  } else {
    // status === "no_reminder"
    return { 
      bgColor: "#E8F5E8", 
      dotColor: "#4CAF50",
      message: label || "No reminder available"
    };
  }
};

export default function CarDetailsCard({
  onRenewClick,
  carDetail,
  isRenew,
  onSelect,
  selectedCarId,
}) {
  // const [carLogo, setCarLogo] = useState(MercedesLogo);
  const { showModal } = useModalStore();

  const handleSelect = () => {
    if (onSelect) onSelect(carDetail);
  };

  const handleRenewClick = () => {
    onRenewClick(carDetail);
  };

  // Load car logo
  //   useEffect(() => {
  //     const loadCarLogo = async () => {
  //       try {
  //         const carMake = carDetail?.vehicle_make?.toLowerCase() || "";
  //         if (carMake) {
  //           const logoUrl = `https://www.carlogos.org/car-logos/${carMake}-logo.png`;
  //           const response = await fetch(logoUrl, { method: "HEAD" });
  //           if (response.ok) {
  //             setCarLogo(logoUrl);
  //           } else {
  //             setCarLogo(defaultLogo);
  //           }
  //         }
  //       } catch {
  //         setCarLogo(defaultLogo);
  //       }
  //     };
  //     loadCarLogo();
  //   }, [carDetail?.vehicle_make]);

  // useEffect(() => {
  //   const carMake = carDetail?.vehicle_make?.toLowerCase() || "";
  //   if (carMake) {
  //     const logoUrl = `https://www.carlogos.org/car-logos/${carMake}-logo.png`;
  //     setCarLogo(logoUrl);
  //   } else {
  //     setCarLogo(defaultLogo);
  //   }
  // }, [carDetail?.vehicle_make]);

  // Use expiry_status from backend (new format)
  const expiryStatusData = carDetail?.expiry_status;
  const statusStyle = getExpiryStatusStyle(expiryStatusData);
  
  // Extract data from expiry_status
  const reminderMessage = statusStyle.message;
  const daysRemaining = expiryStatusData?.days_remaining;
  const expiryStatus = expiryStatusData?.status; // "reminder", "overdue", or "no_reminder"
  
  console.log('Car Detail:', carDetail);
  console.log('Expiry Status:', expiryStatusData);
  return (
    <div
      className={`cursor-pointer rounded-2xl px-4 py-5 ${selectedCarId === carDetail.id ? "bg-[#45A1F2]" : "bg-white"}`}
      onClick={handleSelect}
      role="button"
    >
      {/* <div className="mb-6">
        <div className="text-sm font-light text-[#05243F]/60">Car Model</div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div>
              <Icon icon="ion:car-sport-sharp" fontSize={30} color="#2389E3" />
            </div>
            <h3
              className="cursor-pointer text-xl font-semibold text-[#05243F]"
              role="button"
              onClick={() => showModal(true, carDetail)}
            >
              {carDetail?.vehicle_model || "-"}
            </h3>
          </div>
          <div>
            <Icon icon="ion:car-sport-sharp" fontSize={30} color="#2389E3" />
            <img
              src={carLogo}
              loading="lazy"
              alt={carDetail?.vehicle_make || "Car"}
              className="h-6 w-6 object-contain"
              onError={() => setCarLogo(MercedesLogo)}
            />
          </div>
        </div>
      </div> */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* <img
            src={carLogo}
            loading="lazy"
            alt={carDetail?.vehicle_make || "Car"}
            className="h-6 w-6 object-contain"
            onError={() => setCarLogo(MercedesLogo)}
          /> */}
          <div className={`text-2xl font-semibold ${selectedCarId === carDetail.id ?"text-white":"text-[#05243F]"}`}>
            {carDetail?.plate_number || carDetail?.registration_no || "-"}
          </div>
        </div>
        <div>
          <Icon icon="ion:car-sport-sharp" fontSize={30} color={selectedCarId==carDetail.id?"#fff":"#2389E3"} />
        </div>
      </div>
      {/* <div className="mb-6 flex items-center">
        <div>
          <div className="text-sm text-nowrap text-[#05243F]/60">Plate No:</div>
          <div className="text-base font-semibold text-[#05243F]">
            {carDetail?.plate_number || carDetail?.registration_no || "-"}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-nowrap text-[#05243F]/60">Exp. Date</div>
          <div className="text-base font-semibold text-nowrap text-[#05243F]">
            {formatDate(carDetail?.expiry_date)}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-nowrap text-[#05243F]/60">Car Type</div>
          <div className="text-base font-semibold text-nowrap text-[#05243F]">
            {carDetail?.vehicle_make || "-"}
          </div>
        </div>
      </div> */}

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ backgroundColor: statusStyle.bgColor }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: statusStyle.dotColor }}
          ></span>
          <span className="text-sm font-medium text-[#05243F]">
            {reminderMessage}
          </span>
        </div>
        {isRenew && (
          <button
            className="cursor-pointer rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
            onClick={(e) => {
              e.stopPropagation();
              handleRenewClick();
            }}
          >
            Renew Now
          </button>
        )}
      </div>

      {/* Enhanced Reminder Display - Using Backend Data */}
      {/* {daysLeft !== null && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-[#05243F]/60">
            Expiry Status
          </div>
          <div className={`text-sm font-semibold ${
            isExpired ? 'text-red-600' :
            expiresToday ? 'text-orange-600' :
            isUrgent ? 'text-orange-600' :
            'text-green-600'
          }`}>
            {(() => {
              if (isExpired) return `${Math.abs(daysLeft)} days overdue`;
              if (expiresToday) return 'Expires today';
              if (daysLeft === 1) return '1 day left';
              return `${daysLeft} days left`;
            })()}
          </div>
        </div>
      )} */}

      {/* {isModal && (
        <CarDetailsModal
          isOpen={isModal}
          carDetail={carDetail}
          onClose={() => setIsModal(false)}
        />
      )} */}
    </div>
  );
}
