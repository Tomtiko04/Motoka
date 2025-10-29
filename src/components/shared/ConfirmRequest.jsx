import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LicenseLayout from "../../features/licenses/components/LicenseLayout";
import OrderList from "./OrderList";
import {
  initializeDriversLicensePaymentPaystack,
  initializeDriversLicensePaymentMonicredit,
  verifyDriversLicensePaymentMonicredit,
} from "../../services/apiDriversLicense";
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

  const handleProceed = async ({ total, items: orderItems }) => {
    setIsProcessing(true);

    // Slug comes from navigation state set by DriversLicense.jsx
    const resolvedSlug = location?.state?.orderDetails?.slug;

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
          // if (resolvedSlug) {
          //   try {
          //     const initRes = await initializeDriversLicensePaymentPaystack(resolvedSlug);
          //     const initPayload = initRes?.data?.data || initRes?.data || initRes;

          //     if (initPayload) {
          //       navigate("/payment", {
          //         state: {
          //           paymentData: initPayload,
          //           type: "drivers_license",
          //           items: orderItems,
          //           amount: total,
          //           ...restState,
          //         },
          //       });
          //     } else {
          //       throw new Error("Failed to initialize payment: Missing payload");
          //     }
          //   } catch (error) {
          //     console.error("Payment initialization error:", error);
          //     toast.error(error.message || "Failed to initialize payment");
          //     setIsProcessing(false);
          //   }
          // } else {
          //   toast.error("Invalid license details");
          //   setIsProcessing(false);
          // }
          if (resolvedSlug) {
            try {
              const [paystackRes, monicreditRes] = await Promise.allSettled([
                initializeDriversLicensePaymentPaystack(resolvedSlug),
                initializeDriversLicensePaymentMonicredit(resolvedSlug)
              ]);

              const paystackData = paystackRes.status === 'fulfilled' ?
                (paystackRes.value?.data?.data || paystackRes.value?.data || paystackRes.value) : null;

              const monicreditData = monicreditRes.status === 'fulfilled' ?
                (monicreditRes.value?.data?.data || monicreditRes.value?.data || monicreditRes.value) : null;

              if (!paystackData && !monicreditData) {
                throw new Error("Failed to initialize any payment gateway");
              }

              const paymentData = {
                type: "drivers_license",
                items: orderItems,
                amount: total,
                paystack: paystackRes.status === 'fulfilled' ? {
                  authorization_url: paystackRes.value?.data?.authorization_url,
                  reference: paystackRes.value?.data?.reference
                } : null,
                monicredit: monicreditRes.status === 'fulfilled' ? {
                  // payment_url: monicreditRes.value?.data?.data?.payment_url,
                  // transid: monicreditRes.value?.data?.data?.transid,

                  data: {
                    ...monicreditRes.value?.data?.data, // This contains customer, amount, etc.
                    payment_url: monicreditRes.value?.data?.data?.payment_url,
                    transid: monicreditRes.value?.data?.data?.transid,
                    total_amount: monicreditRes.value?.data?.data?.total_amount,
                    // Make sure customer data is included
                    customer: monicreditRes.value?.data?.data?.customer || {
                      account_number: monicreditRes.value?.data?.data?.account_number,
                      bank_name: monicreditRes.value?.data?.data?.bank_name,
                      account_name: monicreditRes.value?.data?.data?.account_name
                    }
                  }

                } : null,
                ...restState
              };

              // Save to session storage
              sessionStorage.setItem('paymentData', JSON.stringify(paymentData));

              navigate(`/payment?type=drivers_license`, {
                state: {
                  paymentData: paymentData
                }
              });

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
