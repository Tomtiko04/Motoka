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

// Helper function to determine status based on reminder message
const getReminderStatus = (message) => {
  if (!message) return { type: 'warning', bgColor: '#FFEFCE', dotColor: '#FDB022' };
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('expired') || lowerMessage.includes('0 day')) {
    return { type: 'expired', bgColor: '#FFE8E8', dotColor: '#DB8888' };
  } else if (lowerMessage.includes('1 day') || lowerMessage.includes('2 day') || lowerMessage.includes('3 day')) {
    return { type: 'warning', bgColor: '#FFEFCE', dotColor: '#FDB022' };
  } else {
    return { type: 'normal', bgColor: '#E8F5E8', dotColor: '#4CAF50' };
  }
};

export default function CarDetailsCard({ 
  onRenewClick, 
  carDetail, 
  isRenew, 
  reminderData = [] 
}) {
  const [carLogo, setCarLogo] = useState(MercedesLogo);
  const [reminderMessage, setReminderMessage] = useState("No reminder available");
  const [reminderStatus, setReminderStatus] = useState({ type: 'normal', bgColor: '#E8F5E8', dotColor: '#4CAF50' });

  const handleRenewClick = () => {
    onRenewClick(carDetail);
  };

  // Load car logo
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

  // Process reminder data
  useEffect(() => {
    if (reminderData && reminderData.length > 0) {
      const reminderObj = reminderData[0];
      if (reminderObj && reminderObj.reminder && reminderObj.reminder.message) {
        setReminderMessage(reminderObj.reminder.message);
        setReminderStatus(getReminderStatus(reminderObj.reminder.message));
      } else {
        setReminderMessage("No active reminders");
        setReminderStatus({ type: 'normal', bgColor: '#E8F5E8', dotColor: '#4CAF50' });
      }
    } else {
      setReminderMessage("No reminder available");
      setReminderStatus({ type: 'normal', bgColor: '#E8F5E8', dotColor: '#4CAF50' });
    }
  }, []);

  return (
    <div className="rounded-2xl bg-white px-4 py-5">
      <div className="mb-6">
        <div className="text-sm font-light text-[#05243F]/60">Car Model</div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="">
              <img
                src={carLogo}
                loading="lazy"
                alt={carDetail?.vehicle_make || "Car"}
                className="h-6 w-6 object-contain"
                onError={() => setCarLogo(MercedesLogo)}
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
            {carDetail?.plate_number || carDetail?.registration_no || "-"}
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
        <div 
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ backgroundColor: reminderStatus.bgColor }}
        >
          <span 
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: reminderStatus.dotColor }}
          ></span>
          <span className="text-sm font-medium text-[#05243F]">
            {reminderMessage}
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