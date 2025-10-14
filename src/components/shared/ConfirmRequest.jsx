import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LicenseLayout from "../../features/licenses/components/LicenseLayout";
import OrderList from "./OrderList";
import { initializeDriversLicensePayment, verifyDriversLicensePayment } from "../../services/apiDriversLicense";
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
    amount,
    details = {},
    carDetail,
    ...restState
  } = location.state || {};

  const config = { ...requestConfigs[type], ...requestConfigs.default };
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleProceed = async ({ total, items: orderItems, orderDetails }) => {
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
        // case 'drivers_license':
        //   if (orderDetails.slug) {
        //    initiateDriversLicensePayment({
        //       slug: orderDetails.slug,
        //       onSuccess: (data) => {
        //         // Handle successful payment initiation
        //         console.log('Payment initiated:', data);
        //       },
        //       onError: (error) => {
        //         toast.error(error.message || 'Failed to initiate payment');
        //       }
        //     });
        //   }
        //   break;
        case "drivers_license":
          if (orderDetails.slug) {
            try {
              const paymentData = await initializeDriversLicensePayment(
                orderDetails.slug,
              );

              if (paymentData?.authorization_url) {
                // Redirect to payment gateway
                window.location.href = paymentData.authorization_url;

                // Set up a listener for when the user returns to the page
                window.onPaymentReturn = async (reference) => {
                  try {
                    // Verify the payment
                    const verification = await verifyDriversLicensePayment(
                      reference,
                      orderDetails.slug,
                    );

                    if (verification.status === "success") {
                      // Navigate to success page with verification data
                      navigate("/payment/success", {
                        state: {
                          type: "drivers_license",
                          reference,
                          amount: total,
                          details: verification.data,
                          items: orderItems,
                          ...restState,
                        },
                      });
                    } else {
                      throw new Error("Payment verification failed");
                    }
                  } catch (error) {
                    console.error("Payment verification error:", error);
                    toast.error(error.message || "Failed to verify payment");
                    navigate("/payment/failed", {
                      state: {
                        error: error.message || "Payment verification failed",
                        type: "drivers_license",
                        ...restState,
                      },
                    });
                  }
                };
              } else {
                throw new Error("Failed to initialize payment");
              }
            } catch (error) {
              console.error("Payment initialization error:", error);
              toast.error(error.message || "Failed to initialize payment");
              setIsProcessing(false);
            }
          } else {
            toast.error("Invalid license details");
            setIsProcessing(false);
          }
          break;

        default:
          if (config.nextStep) {
            navigate(config.nextStep, {
              state: {
                ...orderDetails,
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
