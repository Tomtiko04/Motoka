import React from "react";
import { useLocation } from "react-router-dom";
import LicenseLayout from "../../features/licenses/components/LicenseLayout";
import OrderList from "./OrderList";

export default function ConfirmRequest() {
  const location = useLocation();
  const { items, type, backTo } = location.state || {};

  // Define configurations for different request types
  const requestConfigs = {
    license: {
      title: "Confirm Request",
      subTitle:
        "Kindly Confirm your wan to proceed with the following requests",
      mainContentTitle: "Order List",
    },
    plate: {
      title: "Confirm Request",
      subTitle:
        "Kindly Confirm your wan to proceed with the following requests",
      mainContentTitle: "Order List",
    },
    tint: {
      title: "Confirm Request",
      subTitle:
        "Kindly Confirm your wan to proceed with the following requests",
      mainContentTitle: "Order List",
    },
  };

  const config = requestConfigs[type] || requestConfigs.license;

  const handlePaymentSuccess = (total, items) => {
    // Handle success based on type
    switch (type) {
      case "license":
        // Handle license payment
        break;
      case "plate":
        // Handle plate number payment
        break;
      case "tint":
        // Handle tint permit payment
        break;
      default:
        break;
    }
  };

  const handlePaymentError = (error) => {
    // Handle payment errors
    console.error("Payment failed:", error);
  };

  return (
    <LicenseLayout
      title={config.title}
      subTitle={config.subTitle}
      mainContentTitle={config.mainContentTitle}
      backTo={backTo}
    >
      <OrderList
        items={items}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </LicenseLayout>
  );
}
