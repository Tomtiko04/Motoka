import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LicenseLayout from "../../features/licenses/components/LicenseLayout";
import OrderList from "./OrderList";
import {
  initializeDriversLicensePaymentPaystack,
  initializeDriversLicensePaymentMonicredit,
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
          // Extract license type and duration from details or orderDetails
          const orderDetails = location?.state?.orderDetails || {};
          const licenseType = details?.license_type || orderDetails?.license_type || details?.application_type || 'new';
          const duration = details?.duration || orderDetails?.duration || null;
          
          // Prepare payment data for initialization
          const paymentInitData = {
            license_type: licenseType === 'Renew' || licenseType === 'renew' ? 'renew' : 'new',
            duration: duration
          };

          if (resolvedSlug || licenseType) {
            try {
              const [paystackRes, monicreditRes] = await Promise.allSettled([
                initializeDriversLicensePaymentPaystack(paymentInitData),
                initializeDriversLicensePaymentMonicredit(paymentInitData)
              ]);

              // Paystack: apiDriversLicense returns the backend JSON body directly
              const paystackData = paystackRes.status === "fulfilled"
                ? (paystackRes.value?.data || paystackRes.value)
                : null;

              // Monicredit: apiDriversLicense returns { success, data, message }
              // We want the inner `data` object which contains total_amount, customer, etc.
              const monicreditInit = monicreditRes.status === "fulfilled"
                ? (monicreditRes.value?.data || monicreditRes.value)
                : null;
              const monicreditCore = monicreditInit?.data || monicreditInit || null;

              if (!paystackData && !monicreditData) {
                throw new Error("Failed to initialize any payment gateway");
              }

              const paymentData = {
                type: "drivers_license",
                items: orderItems,
                // Store amount in naira so PaymentOptions can display it directly
                amount: total,
                slug: resolvedSlug,
                paystack:
                  paystackRes.status === "fulfilled"
                    ? {
                        authorization_url:
                          paystackData?.authorization_url,
                        reference: paystackData?.reference,
                      }
                    : null,
                monicredit:
                  monicreditRes.status === "fulfilled"
                    ? {
                        transid: monicreditCore?.transaction_id || monicreditCore?.transaction_id_monicredit,
                        orderid: monicreditCore?.order_id,
                        data: {
                          // Monicredit normalized response: total_amount (naira), account/customer details, etc.
                          ...(monicreditCore || {}),
                          total_amount: monicreditCore?.total_amount ?? monicreditCore?.amount ?? 0,
                          customer: monicreditCore?.customer || {
                            account_number: monicreditCore?.account_number,
                            bank_name: monicreditCore?.bank_name,
                            account_name: monicreditCore?.account_name,
                          },
                        },
                      }
                    : null,
                ...restState,
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
