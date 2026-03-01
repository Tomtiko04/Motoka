import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LicenseLayout from "../../features/licenses/components/LicenseLayout";
import OrderList from "./OrderList";
import { toast } from "react-hot-toast";

// Configuration for different request types
const requestConfigs = {
  vehicle_paper: {
    title: "Confirm Vehicle Papers",
    subTitle: "Please review your vehicle papers order before proceeding",
    nextStep: "/licenses/renew",
  },
  drivers_license: {
    title: "Confirm License",
    subTitle: "Please review your license details before proceeding",
    nextStep: "/licenses/payment",
  },
  default: {
    title: "Confirm Request",
    subTitle: "Please review your order before proceeding",
  },
};

export default function ConfirmRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    items = [],
    type = "default",
    details = {},
    carDetail,
    ...restState
  } = location.state || {};

  const config = { ...requestConfigs[type], ...requestConfigs.default };
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleProceed = async ({ total, items: orderItems }) => {
    setIsProcessing(true);

    try {
      switch (type) {
        case "vehicle_paper":
          if (carDetail) {
            // If we have carDetail, proceed to renew
            navigate("/licenses/renew", {
              state: {
                carDetail,
                type,
                amount: total,
                details: {
                  ...details,
                  paperType: details.paperType || "Private",
                },
                items: orderItems,
                ...restState,
              },
            });
          } else {
            navigate("/add-car", {
              state: {
                next: {
                  path: "/licenses/confirm-request",
                  state: {
                    type,
                    amount: total,
                    details: {
                      ...details,
                      paperType: details.paperType || "Private",
                    },
                    items: orderItems,
                    ...restState,
                  },
                },
              },
            });
          }
          break;
        case "drivers_license":
          // Driver's license now uses DriversLicense -> DriverLicenseOrderSummary -> Payment flow
          toast.error("Please use the Driver's License flow from the licenses menu.");
          setIsProcessing(false);
          break;

        default:
          if (config.nextStep) {
            navigate(config.nextStep, {
              state: {
                ...restState,
                type,
                amount: total,
                items: orderItems,
              },
            });
          }
      }
    } catch (error) {
      console.error("Error during payment processing:", error);
      toast.error("An error occurred while processing your request");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LicenseLayout
      title={config.title}
      subTitle={config.subTitle}
      mainContentTitle="Order Summary"
    >
      <OrderList
        items={items}
        orderDetails={details}
        onProceed={handleProceed}
        buttonText={
          isProcessing ? "Processing..." : "Proceed to Payment"
        }
        isLoading={isProcessing}
      />
    </LicenseLayout>
  );
}
