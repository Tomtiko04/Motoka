import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { IoIosArrowBack } from "react-icons/io";
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
} from "./config/paymentTypes";
import { usePaymentVerification } from "./hooks/usePayment";
import { initializePaystackPayment } from "../../services/apiPaystack";
import { initializeMonipayPayment } from "../../services/apiMonipay";
import { abandonPayment } from "../../services/apiPayment";
import { getWallet, payFromWallet } from "../../services/apiWallet";
import { payLadipoOrder, verifyLadipoPayment } from "../../services/apiLadipo";
import useCartStore from "../../store/cartStore";
import { useLadipoPaymentModalStore } from "../../store/ladipoPaymentModalStore";
import AutoRenewalPrompt from "./components/AutoRenewalPrompt";
import PhonePromptModal from "./components/PhonePromptModal";
import { useProfile } from "../settings/hooks/useProfile";
import { pathAfterDocumentPayment, pickOrderNumber } from "./afterPaymentNavigate";

const paymentMethods = [
  { id: PAYMENT_METHODS.PAYSTACK, label: "Pay Via Paystack", icon: "💳" },
  { id: PAYMENT_METHODS.MONIPAY, label: "Pay Via Monipay" },
];

export default function PaymentOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [paymentSession, setPaymentSession] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(
    PAYMENT_METHODS.MONIPAY,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPaymentMethodConfirmed, setIsPaymentMethodConfirmed] = useState(false);
  const [monipayInitError, setMonipayInitError] = useState(null);
  const clearLadipoCart = useCartStore((s) => s.clearCart);
  const [showAutoRenewal, setShowAutoRenewal] = useState(false);
  const paidOrderNumberRef = useRef(null);
  const [walletPaying, setWalletPaying] = useState(false);
  const [userPickedMethod, setUserPickedMethod] = useState(false);

  // Load wallet via React Query so cached data is shown instantly on navigation
  // and there is no flash of ₦0 / "Insufficient" while the request is in-flight.
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
    staleTime: 30_000,
  });

  // Inline phone capture when a gateway still requires a phone number
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const { updateUserProfile } = useProfile();

  // Helper: delivery fee in Naira from session (stored as kobo in deliveryDetails.fee)
  const sessionDeliveryFeeNaira = (() => {
    const feeKobo = Number(
      paymentSession?.deliveryDetails?.fee ||
      paymentSession?.delivery_details?.fee ||
      0
    );
    return feeKobo / 100;
  })();

  const totalAmount = paymentSession?.monipay?.reference || paymentSession?.paystack?.reference
    ? Number(paymentSession?.amount || 0) / 100
    : (paymentSession?.amount
        ? paymentSession.amount / 100
        : Number(paymentSession?.price || 0) + sessionDeliveryFeeNaira) || null;
  
  // Backend always returns amount in kobo — divide by 100 for display
  const paystackAmount = (paymentSession?.paystack?.reference || paymentSession?.monipay?.reference)
    ? Number(paymentSession?.amount || 0) / 100
    : Number(paymentSession?.price || paymentSession?.amount || 0) + sessionDeliveryFeeNaira;

  // ── Pay-from-wallet (renewal, plate, driver license — not Ladipo) ────────
  const isWalletProduct =
    paymentSession?.type === PAYMENT_TYPES.LICENSE_RENEWAL ||
    paymentSession?.type === PAYMENT_TYPES.VEHICLE_PAPER ||
    paymentSession?.type === PAYMENT_TYPES.PLATE_NUMBER ||
    paymentSession?.type === PAYMENT_TYPES.DRIVERS_LICENSE ||
    paymentSession?.type === "drivers_license";
  const fmtN = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  const renewalCostNaira = Number(totalAmount || paystackAmount || 0);
  const walletBalanceNaira = wallet ? Number(wallet.balance_kobo || 0) / 100 : 0;
  const walletEligible = isWalletProduct && !!wallet && wallet.status !== "frozen";
  const walletSufficient = walletEligible && renewalCostNaira > 0 && walletBalanceNaira >= renewalCostNaira;
  const walletDetails = {
    availableBalance: fmtN(walletBalanceNaira),
    renewalCost: fmtN(renewalCostNaira),
    newBalance: fmtN(Math.max(0, walletBalanceNaira - renewalCostNaira)),
  };
  // Only offer wallet once data is confirmed loaded — prevents "Insufficient" flash
  const showWalletOption = isWalletProduct && !walletLoading && wallet?.status !== "frozen";
  const methodsToShow = showWalletOption
    ? [{ id: PAYMENT_METHODS.WALLET, label: `Wallet Balance: ${fmtN(walletBalanceNaira)}` }, ...paymentMethods]
    : paymentMethods;

  const { verifyPaystack } = usePaymentVerification();

  // Invalidate cars + notifications cache so dashboard and bell update immediately
  const navigateAfterPayment = useCallback((state) => {
    queryClient.invalidateQueries({ queryKey: ['cars'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });

    // Ladipo: success modal on marketplace (not a separate page)
    if (paymentSession?.type === PAYMENT_TYPES.LADIPO) {
      clearLadipoCart();
      useLadipoPaymentModalStore.getState().openSuccess({
        order: paymentSession?.orderData,
        amountKobo: paymentSession?.amount,
      });
      navigate("/ladipo");
      return;
    }

    const orderNumber = pickOrderNumber(state?.order_number, paidOrderNumberRef.current);
    if (orderNumber) paidOrderNumberRef.current = orderNumber;
    const dest = pathAfterDocumentPayment({ orderNumber, session: paymentSession });
    navigate(dest, { state });
  }, [navigate, queryClient, paymentSession]);

  // Abandon any initialized-but-unpaid transaction when user leaves this page
  useEffect(() => {
    return () => {
      const paystackRef = paymentSession?.paystack?.reference;
      const monipayRef = paymentSession?.monipay?.reference;
      const monicreditRef = paymentSession?.monicredit?.data?.reference ||
                            paymentSession?.monicredit?.data?.orderid;
      const ref = paystackRef || monipayRef || monicreditRef;
      if (ref && isPaymentMethodConfirmed && !isProcessing && paymentSession?.type !== PAYMENT_TYPES.LADIPO) {
        abandonPayment(ref, 'User left payment page');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSession, isPaymentMethodConfirmed, isProcessing]);

  useEffect(() => {
    const initializePaymentSession = () => {
      try {
        const params = new URLSearchParams(location.search);
        const paymentType = params.get("type");

        // Get session from location state or session storage
        const sessionData =
          location.state?.paymentData ||
          JSON.parse(sessionStorage.getItem("paymentData") || "null");

        if (!sessionData || !paymentType) {
          throw new Error("Invalid or expired payment session");
        }

        setPaymentSession(sessionData);
        const isWalletProduct =
          sessionData.type === PAYMENT_TYPES.LICENSE_RENEWAL ||
          sessionData.type === PAYMENT_TYPES.VEHICLE_PAPER ||
          sessionData.type === PAYMENT_TYPES.PLATE_NUMBER ||
          sessionData.type === PAYMENT_TYPES.DRIVERS_LICENSE ||
          sessionData.type === "drivers_license";
        const monicreditData = sessionData.monicredit?.data;
        const alreadyInitialized =
          sessionData.monipay?.authorization_url ||
          sessionData.paystack?.authorization_url ||
          monicreditData?.account_number ||
          monicreditData?.customer?.account_number;

        if (isWalletProduct) {
          setSelectedMethod(PAYMENT_METHODS.WALLET);
          setIsPaymentMethodConfirmed(false);
        } else {
          const defaultMethod = sessionData.method || PAYMENT_METHODS.MONIPAY;
          setSelectedMethod(defaultMethod);
          if (alreadyInitialized && (defaultMethod === PAYMENT_METHODS.MONIPAY || defaultMethod === PAYMENT_METHODS.PAYSTACK)) {
            setIsPaymentMethodConfirmed(true);
          }
        }
      } catch (err) {
        console.error("Payment initialization error:", err);
        toast.error("Failed to initialize payment. Please try again.");
        navigate(-1);
      }
    };

    initializePaymentSession();
  }, [location, navigate]);

  useEffect(() => {
    if (walletLoading || userPickedMethod || !isWalletProduct) return;
    if (wallet?.status === "frozen") {
      const monicreditData = paymentSession?.monicredit?.data;
      const alreadyInitialized =
        paymentSession?.monipay?.authorization_url ||
        paymentSession?.paystack?.authorization_url ||
        monicreditData?.account_number ||
        monicreditData?.customer?.account_number;
      setSelectedMethod(PAYMENT_METHODS.MONIPAY);
      setIsPaymentMethodConfirmed(Boolean(alreadyInitialized));
    }
  }, [wallet, walletLoading, userPickedMethod, isWalletProduct, paymentSession]);

  // Handle payment method selection.
  //
  // If the user has an active (confirmed but unpaid) init on the current
  // method, switching means abandoning that pending transaction. Require an
  // explicit confirm + send a clear cancellation_reason to the backend so the
  // abandoned row is tagged correctly. Without this, a user clicking Pay,
  // glancing at the bank details, and switching gateways used to silently
  // double-init — which is how we ended up with 100+ abandoned rows that look
  // like gateway failures but are actually user-driven gateway switches.
  const handleMethodSelect = (method) => {
    if (method === selectedMethod) return;
    if (isInitializing) return; // a confirm-button click is in-flight; don't race

    const currentRef =
      paymentSession?.monipay?.reference ||
      paymentSession?.monicredit?.data?.reference ||
      paymentSession?.monicredit?.data?.orderid ||
      paymentSession?.paystack?.reference;
    if (isPaymentMethodConfirmed && currentRef) {
      const ok = window.confirm(
        'Switching payment method will cancel your current pending payment. Are you sure?'
      );
      if (!ok) return;
      // Fire-and-forget: backend marks the prior txn abandoned with this reason.
      abandonPayment(currentRef, 'User switched payment method');
    }

    setUserPickedMethod(true);
    setSelectedMethod(method);
    setMonipayInitError(null);

    setIsPaymentMethodConfirmed(
      (method === PAYMENT_METHODS.MONIPAY && Boolean(paymentSession?.monipay?.authorization_url || paymentSession?.monipay?.access_code)) ||
      (method === PAYMENT_METHODS.PAYSTACK && Boolean(paymentSession?.paystack?.authorization_url))
    );
  };

  // Helper function to build payment payload
  const buildPaymentPayload = () => {
    const car_slug = paymentSession?.car_slug || paymentSession?.car_id || paymentSession?.monicredit?.data?.car_slug;

    const deliveryMeta = () => {
      const delivery = paymentSession?.deliveryDetails || paymentSession?.delivery_details || paymentSession?.meta_data || {};
      const address = delivery?.address || delivery?.delivery_address || "";
      const contact = delivery?.contact || delivery?.delivery_contact || "";
      const stateId = delivery?.state_id;
      const state = delivery?.state;
      const lgaId = delivery?.lga_id;
      const lga = delivery?.lga || delivery?.lg;
      const hasComplete = address.trim() && contact.trim() && (stateId || state) && (lgaId || lga);
      if (!hasComplete) return {};
      return {
        delivery_details: {
          address: address.trim(),
          contact: contact.trim(),
          ...(state ? { state } : {}),
          ...(lga ? { lga } : {}),
          ...(stateId ? { state_id: stateId } : {}),
          ...(lgaId ? { lga_id: lgaId } : {}),
        },
        meta_data: {
          address: address.trim(),
          delivery_address: address.trim(),
          contact: contact.trim(),
          delivery_contact: contact.trim(),
          ...(state ? { state } : {}),
          ...(lga ? { lga } : {}),
          ...(stateId ? { state_id: stateId } : {}),
          ...(lgaId ? { lga_id: lgaId } : {}),
        },
      };
    };

    // ── Driver license payment: no car, no schedules ─────────────────────────
    if (paymentSession?.type === PAYMENT_TYPES.DRIVERS_LICENSE || paymentSession?.type === 'drivers_license') {
      return {
        payment_type: 'driver_license',
        license_type: paymentSession.license_type || 'new',
        duration: paymentSession.duration || null,
        ...deliveryMeta(),
      };
    }

    // ── Plate number payment ─────────────────────────────────────────────────
    if (paymentSession?.type === PAYMENT_TYPES.PLATE_NUMBER) {
      return {
        car_slug,
        payment_type: 'plate_number',
        plate_type: paymentSession.plate_type,
        ...(paymentSession.sub_type ? { sub_type: paymentSession.sub_type } : {}),
        ...deliveryMeta(),
      };
    }

    // ── Renewal / other payment types ────────────────────────────────────────
    const schedules = paymentSession?.selectedSchedules || [];
    
    // Normalize payment_schedule_id - backend REQUIRES a non-empty array
    let payment_schedule_id = [];
    
    if (Array.isArray(schedules) && schedules.length > 0) {
      payment_schedule_id = schedules.map(s => s?.id || s).filter(id => id !== null && id !== undefined && id !== '');
    } else if (paymentSession?.payment_schedule_id) {
      if (Array.isArray(paymentSession.payment_schedule_id)) {
        payment_schedule_id = paymentSession.payment_schedule_id.filter(id => id !== null && id !== undefined && id !== '');
      } else {
        payment_schedule_id = [paymentSession.payment_schedule_id].filter(id => id !== null && id !== undefined && id !== '');
      }
    } else {
      const monicreditScheduleId = paymentSession?.monicredit?.data?.payment_schedule_id;
      if (monicreditScheduleId) {
        if (Array.isArray(monicreditScheduleId)) {
          payment_schedule_id = monicreditScheduleId.filter(id => id !== null && id !== undefined && id !== '');
        } else {
          payment_schedule_id = [monicreditScheduleId].filter(id => id !== null && id !== undefined && id !== '');
        }
      }
    }

    return {
      car_slug,
      payment_schedule_id,
      ...deliveryMeta(),
    };
  };

  // Confirm and initialize selected payment method
  const handleConfirmPaymentMethod = async () => {
    setIsInitializing(true);
    try {
      const isLadipo = paymentSession?.type === PAYMENT_TYPES.LADIPO;

      // ── Ladipo orders use their own API ──────────────────────────────────
      if (isLadipo) {
        const orderNumber = paymentSession?.order_number;
        if (!orderNumber) {
          toast.error('Order information is missing. Please try again.');
          return;
        }

        const result = await payLadipoOrder(orderNumber, {
          payment_gateway: selectedMethod,
        });

        if (selectedMethod === PAYMENT_METHODS.PAYSTACK || selectedMethod === PAYMENT_METHODS.MONIPAY) {
          if (result?.authorization_url) {
            const key = selectedMethod === PAYMENT_METHODS.MONIPAY ? 'monipay' : 'paystack';
            setPaymentSession(prev => {
              const updated = {
                ...prev,
                [key]: {
                  authorization_url: result.authorization_url,
                  access_code: result.access_code || null,
                  reference: result.reference,
                },
                amount: result.amount || prev?.amount,
              };
              try { sessionStorage.setItem("paymentData", JSON.stringify(updated)); } catch {}
              return updated;
            });
            setIsPaymentMethodConfirmed(true);
            toast.success(`${selectedMethod === PAYMENT_METHODS.MONIPAY ? 'Monipay' : 'Paystack'} payment initialized successfully`);
          } else {
            toast.error(`Failed to initialize ${selectedMethod === PAYMENT_METHODS.MONIPAY ? 'Monipay' : 'Paystack'} payment`);
          }
        } else {
          toast.error('Unsupported payment method');
        }
        return; // Skip standard flow below
      }

      // ── Standard flow (plate number, license, renewal) ───────────────────
      const payload = buildPaymentPayload();

      // Driver license: no car_slug or schedule required
      const isDriverLicense = paymentSession?.type === PAYMENT_TYPES.DRIVERS_LICENSE || paymentSession?.type === 'drivers_license';
      if (!isDriverLicense && !payload.car_slug) {
        toast.error('Car information is missing. Please try again.');
        return;
      }

      // Skip schedule validation for plate number and driver license payments
      if (paymentSession?.type !== PAYMENT_TYPES.PLATE_NUMBER && !isDriverLicense) {
        if (!Array.isArray(payload.payment_schedule_id) || payload.payment_schedule_id.length === 0) {
          toast.error('Payment schedule information is missing. Please try again.');
          return;
        }
      }

      if (selectedMethod === PAYMENT_METHODS.PAYSTACK) {
        // Initialize Paystack
        payload.payment_gateway = 'paystack';
        console.log("Initializing Paystack with payload:", payload);

        const initRes = await initializePaystackPayment(payload);
        // Backend response structure: { status: true, data: {...}, message: '...' }
        const responseData = initRes?.data || initRes;
        const paystackUrl = responseData?.authorization_url || responseData?.data?.authorization_url;
        const reference = responseData?.reference || responseData?.data?.reference || responseData?.transaction_id;
        // Paystack amount is in kobo from backend
        const amount = responseData?.amount || responseData?.data?.amount;

        if (paystackUrl && reference) {
          setPaymentSession(prev => {
            const updated = {
              ...prev,
              paystack: {
                ...(prev?.paystack || {}),
                authorization_url: paystackUrl,
                reference,
              },
              // Store amount from Paystack response (in kobo)
              amount: amount || prev?.amount
            };
            try {
              sessionStorage.setItem("paymentData", JSON.stringify(updated));
            } catch (storageError) {
              console.warn("Failed to save payment data to sessionStorage:", storageError);
            }
            return updated;
          });
          setIsPaymentMethodConfirmed(true);
          toast.success('Paystack payment initialized successfully');
        } else {
          toast.error('Failed to initialize Paystack payment');
        }
      } else if (selectedMethod === PAYMENT_METHODS.MONIPAY) {
        payload.payment_gateway = 'monipay';
        setMonipayInitError(null);

        const initRes = await initializeMonipayPayment(payload);
        const responseData = initRes?.data || initRes;
        const authorizationUrl = responseData?.authorization_url || responseData?.data?.authorization_url;
        const accessCode = responseData?.access_code || responseData?.data?.access_code;
        const reference = responseData?.reference || responseData?.data?.reference || responseData?.transaction_id;
        const amount = responseData?.amount || responseData?.data?.amount;

        if ((authorizationUrl || accessCode) && reference) {
          setPaymentSession(prev => {
            const updated = {
              ...prev,
              monipay: {
                ...(prev?.monipay || {}),
                authorization_url: authorizationUrl,
                access_code: accessCode,
                reference,
              },
              amount: amount || prev?.amount
            };
            try {
              sessionStorage.setItem("paymentData", JSON.stringify(updated));
            } catch (storageError) {
              console.warn("Failed to save payment data to sessionStorage:", storageError);
            }
            return updated;
          });
          setIsPaymentMethodConfirmed(true);
          toast.success('Monipay payment initialized successfully');
        } else {
          toast.error(initRes?.message || 'Failed to initialize Monipay payment');
        }
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to initialize payment';

      // Monipay requires a phone number to generate the virtual account.
      // If that's the reason it failed, prompt for the phone inline and retry
      // rather than dumping the user out to Settings.
      const needsPhone = /phone number is required/i.test(errMsg);
      if (selectedMethod === PAYMENT_METHODS.MONIPAY && needsPhone) {
        setPhoneError(null);
        setShowPhonePrompt(true);
      } else if (selectedMethod === PAYMENT_METHODS.MONIPAY) {
        setMonipayInitError(errMsg);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Switch to Paystack after Monipay init failure. Abandon any prior
  // Monipay reference so the row gets a clean reason logged in admin.
  const handleSwitchToPaystack = () => {
    const monipayRef = paymentSession?.monipay?.reference;
    const monicreditRef =
      paymentSession?.monicredit?.data?.reference ||
      paymentSession?.monicredit?.data?.orderid;
    const priorRef = monipayRef || monicreditRef;
    if (priorRef) {
      abandonPayment(priorRef, 'Payment init failed, user switched to Paystack');
    }
    setMonipayInitError(null);
    setSelectedMethod(PAYMENT_METHODS.PAYSTACK);
    setIsPaymentMethodConfirmed(false);
  };

  // Pay for the renewal from wallet balance. The backend debits + creates the
  // order atomically, so success here means the order exists.
  const handlePayFromWallet = async () => {
    if (!walletSufficient || walletPaying) return;
    setWalletPaying(true);
    try {
      const payload = buildPaymentPayload();
      const isDriverLicense =
        payload.payment_type === "driver_license" ||
        paymentSession?.type === PAYMENT_TYPES.DRIVERS_LICENSE;
      if (!isDriverLicense && !payload.car_slug) {
        toast.error("Car information is missing. Please try again.");
        return;
      }
      const result = await payFromWallet(payload);
      if (result?.order_id) {
        const unusedRef =
          paymentSession?.monipay?.reference ||
          paymentSession?.monicredit?.data?.reference ||
          paymentSession?.monicredit?.data?.orderid ||
          paymentSession?.paystack?.reference;
        if (unusedRef) {
          abandonPayment(unusedRef, "User paid with wallet");
        }
        queryClient.setQueryData(['wallet'], (old) => old ? { ...old, balance_kobo: result.balance_kobo } : old);
        toast.success("Paid from wallet successfully");
        navigateAfterPayment({ paymentSuccess: true, paymentMethod: "wallet", reference: result.reference, order_number: result.order_number });
      } else {
        toast.error("Wallet payment could not be completed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Wallet payment failed.");
    } finally {
      setWalletPaying(false);
    }
  };

  // Save the phone number the user entered, then retry the Monicredit init so
  // they stay in the checkout flow instead of being sent off to Settings.
  const handleSavePhoneAndRetry = async (phone) => {
    setPhoneSaving(true);
    setPhoneError(null);
    try {
      const res = await updateUserProfile({ phone_number: phone });
      if (res && res.success) {
        setShowPhonePrompt(false);
        await handleConfirmPaymentMethod();
      } else {
        setPhoneError(res?.message || "Could not save your phone number. Please try again.");
      }
    } catch (err) {
      setPhoneError(
        err.response?.data?.message || err.message || "Could not save your phone number. Please try again.",
      );
    } finally {
      setPhoneSaving(false);
    }
  };

  // Note: Monicredit doesn't require a separate payment initiation step
  // Users just see bank details and verify after making the transfer

  // Helper function to get receipt URL based on payment type
  const getReceiptUrl = useCallback((paymentType, verificationResponse = null) => {
    // Get payment type from session or URL params
    const type = paymentType || 
                 paymentSession?.type || 
                 new URLSearchParams(location.search).get("type");
    
    let identifier = null;
    
    // Extract identifier based on payment type
    if (type === PAYMENT_TYPES.DRIVERS_LICENSE || type === 'drivers_license') {
      // For driver's license, use slug
      identifier = paymentSession?.slug || 
                  paymentSession?.data?.slug ||
                  verificationResponse?.slug ||
                  verificationResponse?.data?.slug;
    } else {
      // For vehicle paper or license renewal, use car_slug/car_id
      identifier = verificationResponse?.car_id || 
                  verificationResponse?.data?.car_id ||
                  paymentSession?.car_slug || 
                  paymentSession?.car_id ||
                  paymentSession?.data?.car_slug;
    }
    
    if (identifier && type) {
      return `/payment/receipt/${type}/${identifier}`;
    }
    
    return null;
  }, [paymentSession, location.search]);

  // Handle Paystack payment - redirects to Paystack payment page
  const handlePaystackPayment = async () => {
    try {
      const paystackUrl = paymentSession?.paystack?.authorization_url;
      const reference = paymentSession?.paystack?.reference;

      if (!paystackUrl) {
        toast.error('Payment not initialized. Please confirm your payment method first.');
        return;
      }

      // Store reference for later verification
      if (reference) {
        storePaymentReference(
          reference,
          PAYMENT_METHODS.PAYSTACK,
        );
      }

      // Ladipo: direct redirect (backend callback_url goes to /ladipo/payment/callback)
      if (paymentSession?.type === PAYMENT_TYPES.LADIPO) {
        clearLadipoCart();
        window.location.href = paystackUrl;
        return;
      }

      // Open Paystack in a new tab
      // FIX 2: Do not pass 'noopener' — the callback page needs window.opener
      // to postMessage success back to this tab.
      const newWindow = window.open(paystackUrl, '_blank');
      if (!newWindow) {
        // Popup blocked — don't dead-end the user. Redirect this tab instead;
        // the callback page now handles the no-opener case and routes the user
        // back to the dashboard after verifying.
        toast.success('Redirecting to Paystack...');
        window.location.href = paystackUrl;
        return;
      } else {
        toast.success("Redirecting to Paystack...");
      }

      const checkPopup = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkPopup);
          // FIX 4: Wait 3 seconds before polling — gives the callback page time
          // to verify and send a PAYMENT_SUCCESS message first. Also covers the
          // case where the user closes the tab a split-second before Paystack
          // finishes its redirect.
          setTimeout(checkPaystackStatus, 3000);
        }
      }, 1000);
    } catch (err) {
      console.error("Paystack payment error:", err);
      throw new Error(err.message || "Failed to process Paystack payment");
    }
  };

  const loadMonipayInline = () =>
    new Promise((resolve, reject) => {
      if (window.MonipayPop) {
        resolve(window.MonipayPop);
        return;
      }
      const existing = document.querySelector('script[src="https://js.monipay.ng/v2/inline.js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.MonipayPop));
        existing.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.monipay.ng/v2/inline.js";
      script.async = true;
      script.onload = () => resolve(window.MonipayPop);
      script.onerror = () => reject(new Error("Failed to load Monipay checkout"));
      document.body.appendChild(script);
    });

  const handleMonipayPayment = async () => {
    try {
      const checkoutUrl = paymentSession?.monipay?.authorization_url;
      const accessCode = paymentSession?.monipay?.access_code;
      const reference = paymentSession?.monipay?.reference;

      if (!checkoutUrl && !accessCode) {
        toast.error("Payment not initialized. Please confirm your payment method first.");
        return;
      }

      if (reference) {
        storePaymentReference(reference, PAYMENT_METHODS.MONIPAY);
      }

      if (accessCode) {
        try {
          const MonipayPop = await loadMonipayInline();
          if (MonipayPop) {
            const popup = new MonipayPop();
            popup.resumeTransaction(accessCode);
            toast.success("Opening Monipay checkout...");
            return;
          }
        } catch (inlineErr) {
          console.warn("Monipay inline checkout unavailable, using redirect", inlineErr);
        }
      }

      if (!checkoutUrl) {
        toast.error("Monipay checkout URL missing. Please retry.");
        return;
      }

      if (paymentSession?.type === PAYMENT_TYPES.LADIPO) {
        clearLadipoCart();
        window.location.href = checkoutUrl;
        return;
      }

      const newWindow = window.open(checkoutUrl, "_blank");
      if (!newWindow) {
        toast.success("Redirecting to Monipay...");
        window.location.href = checkoutUrl;
        return;
      }

      toast.success("Redirecting to Monipay...");
      const checkPopup = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkPopup);
          setTimeout(checkPaystackStatus, 3000);
        }
      }, 1000);
    } catch (err) {
      console.error("Monipay payment error:", err);
      throw new Error(err.message || "Failed to process Monipay payment");
    }
  };

  // Store payment reference for verification
  const storePaymentReference = (reference, gateway) => {
    if (!reference || !gateway) return;

    const paymentInfo = {
      reference,
      gateway,
      type: paymentSession.type,
      timestamp: Date.now(),
      data: paymentSession.data,
    };

    // Store in localStorage for auto-verification
    const recentPayments = JSON.parse(
      localStorage.getItem("recentPayments") || "[]",
    );
    recentPayments.unshift(paymentInfo);
    localStorage.setItem(
      "recentPayments",
      JSON.stringify(recentPayments.slice(0, 5)),
    );
  };

  const checkPaystackStatus = async () => {
    const reference = paymentSession?.paystack?.reference || paymentSession?.monipay?.reference;
    if (!reference) return;

    const isLadipo = paymentSession?.type === PAYMENT_TYPES.LADIPO;

    setIsProcessing(true);
    try {
      if (isLadipo) {
        useLadipoPaymentModalStore.getState().openProcessing(paymentSession?.amount || 0);
        const result = await verifyLadipoPayment(reference);
        if (result?.status === "success" || result?.status === "paid") {
          clearLadipoCart();
          toast.success('Payment successful!');
          const merged = { ...paymentSession?.orderData, ...result };
          useLadipoPaymentModalStore.getState().openSuccess({
            order: merged,
            amountKobo: merged?.total_kobo ?? paymentSession?.amount,
          });
          navigate("/ladipo");
          setIsProcessing(false);
          return;
        } else {
          useLadipoPaymentModalStore.getState().close();
          toast.error('Payment verification failed. Please try again.');
          setIsProcessing(false);
          return;
        }
      }

      const result = await verifyPaystack.mutateAsync(reference);
      
      // Handle different response structures
      const responseData = result?.data || result;
      const status = responseData?.status || responseData?.data?.status;
      const isSuccess = status === 'success' || status === true || 
                       result?.data?.status === 'success' || 
                       responseData?.status === 'success';

      if (isSuccess) {
        navigateAfterPayment({
          paymentSuccess: true,
          reference,
          amount: paymentSession.amount,
          order_number: responseData?.order_number || responseData?.data?.order_number || result?.order_number,
        });
      } else {
        toast.error('Payment verification failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      if (paymentSession?.type === PAYMENT_TYPES.LADIPO) {
        useLadipoPaymentModalStore.getState().close();
      }
      toast.error(error.message || 'Failed to verify payment');
      setIsProcessing(false);
    }
  };

  // Handle Paystack verification
  const handleVerifyPaystack = async () => {
    const reference = paymentSession?.paystack?.reference;
    if (!reference) {
      toast.error("No payment reference found");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await verifyPaystack.mutateAsync(reference);
      
      const responseData = result?.data || result;
      const status = responseData?.status || responseData?.data?.status;
      const isSuccess = status === 'success' || status === true || 
                       result?.data?.status === 'success' || 
                       responseData?.status === 'success';

      if (isSuccess) {
        toast.success('Payment successful! Your renewal is being processed.');
        navigateAfterPayment({
          paymentSuccess: true,
          reference,
          amount: paymentSession.amount,
          paymentMethod: "paystack",
          order_number: responseData?.order_number || responseData?.data?.order_number || result?.order_number,
        });
      } else {
        toast.error("Payment verification failed");
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
    }
  };

  // Listen for messages from PaystackCallback window
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        const { reference } = event.data;
        if (reference) {
          setIsProcessing(true);
          try {
            let orderNumber = event.data.order_number;
            if (!orderNumber && verifyPaystack?.mutateAsync) {
              const result = await verifyPaystack.mutateAsync(reference);
              const responseData = result?.data || result;
              orderNumber = pickOrderNumber(
                responseData?.order_number,
                responseData?.data?.order_number,
                result?.order_number
              );
            }
            toast.success('Payment successful! Your renewal is being processed.');
            navigateAfterPayment({
              paymentSuccess: true,
              reference,
              amount: paymentSession?.amount,
              paymentMethod: 'paystack',
              order_number: orderNumber,
            });
          } catch (error) {
            console.error('Error processing payment success:', error);
            toast.error('Failed to process payment. Please verify manually.');
            setIsProcessing(false);
          }
        }
      } else if (event.data.type === 'PAYMENT_ERROR') {
        toast.error('Payment was not completed successfully');
        setIsProcessing(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, navigateAfterPayment, paymentSession, verifyPaystack, getReceiptUrl]);

  if (!paymentSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PhonePromptModal
        open={showPhonePrompt}
        saving={phoneSaving}
        error={phoneError}
        onSubmit={handleSavePhoneAndRetry}
        onUseCard={() => {
          setShowPhonePrompt(false);
          handleSwitchToPaystack();
        }}
        onClose={() => setShowPhonePrompt(false)}
      />
      {showAutoRenewal && (
        <AutoRenewalPrompt
          carSlug={paymentSession?.car_slug}
          amount={Math.round((paymentSession?.amount || 0) * 100)}
          selectedItems={(paymentSession?.selectedSchedules || []).map(s => s.id)}
          onDone={() => {
            setShowAutoRenewal(false);
            navigateAfterPayment({
              paymentSuccess: true,
              paymentMethod: "monipay",
            });
          }}
        />
      )}
      {/* Header */}
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="relative mb-6 flex h-12 items-center sm:h-12">
          <button
            onClick={() => navigate(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF] sm:h-8 sm:w-8"
          >
            <IoIosArrowBack className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-medium text-[#05243F] sm:text-2xl">
            Payment Options
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8 shadow-sm">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_auto_1fr]">
          {/* LEFT SECTION */}
          <div className="space-y-2">
            {methodsToShow.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                disabled={isInitializing}
                className={`w-full rounded-[10px] bg-[#F4F5FC] p-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedMethod === method.id
                  ? "shadow-sm ring-1 ring-[#2389E3]"
                  : "hover:bg-[#FDF6E8] hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${selectedMethod === method.id
                      ? "font-semibold text-[#05243F]/95"
                      : "font-normal text-[#05243F]/40"
                      }`}
                  >
                    {method.label}
                  </span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2389E3]">
                    {selectedMethod === method.id && (
                      <div className="h-2 w-2 rounded-full bg-[#2389E3]"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="hidden h-full w-px bg-[#F4F5FC] md:block"></div>

          {/* RIGHT SECTION */}
          {/* Right Panel - Payment Details */}
          {selectedMethod === "wallet" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Wallet Method
              </h2>
              {walletLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-3/4 rounded bg-[#E1E5EE]" />
                  <div className="h-4 w-1/2 rounded bg-[#E1E5EE]" />
                  <div className="h-4 w-2/3 rounded bg-[#E1E5EE]" />
                  <div className="mt-5 h-12 w-full rounded-full bg-[#E1E5EE]" />
                </div>
              ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    Available Balance:
                  </span>
                  <span className="text-base font-semibold text-[#05243F]">
                    {walletDetails.availableBalance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    Renewal Cost
                  </span>
                  <span className="text-base font-semibold text-[#05243F]">
                    {walletDetails.renewalCost}
                  </span>
                </div>
                <div className="border border-[#F4F5FC]"></div>
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    New Balance
                  </span>
                  <span className="text-base font-semibold text-[#05243F]">
                    {walletDetails.newBalance}
                  </span>
                </div>
                {walletSufficient ? (
                  <button
                    onClick={handlePayFromWallet}
                    disabled={walletPaying}
                    className="mt-5 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#1a6fc2] active:scale-[0.99] disabled:opacity-60 md:mt-10"
                  >
                    {walletPaying ? "Processing…" : `${walletDetails.renewalCost} Pay Now`}
                  </button>
                ) : (
                  <div className="mt-5 md:mt-10">
                    <p className="mb-3 text-center text-sm text-[#C0435C]">
                      Insufficient balance. You need {walletDetails.renewalCost} but have {walletDetails.availableBalance}.
                    </p>
                    <button
                      onClick={() => navigate("/wallet")}
                      className="w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#1a6fc2]"
                    >
                      Top up wallet
                    </button>
                  </div>
                )}
              </div>
              )}
            </div>
          )}

          {selectedMethod === PAYMENT_METHODS.MONIPAY && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Monipay Payment
              </h2>

              {monipayInitError && (
                <div className="mb-4 rounded-[12px] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800 mb-1">Monipay unavailable</p>
                  <p className="text-xs text-amber-700 mb-3">{monipayInitError}</p>
                  <button
                    onClick={handleSwitchToPaystack}
                    className="w-full rounded-full bg-[#2284DB] py-2 text-sm font-semibold text-white hover:bg-[#1a6fc2] transition-colors"
                  >
                    Pay via Paystack instead
                  </button>
                </div>
              )}

              {!isPaymentMethodConfirmed ? (
                <div className="space-y-4 rounded-[20px] border border-[#697B8C]/11 px-6 py-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏦</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Secure Payment
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pay with card, bank transfer, or QR
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#05243F]/60 mb-4">
                      Click the button below to confirm your payment method and proceed with payment.
                    </p>
                    <button
                      onClick={handleConfirmPaymentMethod}
                      disabled={isInitializing}
                      className="w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#1a6bb8] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInitializing ? (
                        <span className="flex items-center justify-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Initializing...
                        </span>
                      ) : (
                        "Confirm Payment Method"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Payment Summary
                    </h4>
                    <div className="space-y-1 text-xs text-[#697C8C]">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">
                          ₦{(paystackAmount || totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-mono text-xs">
                          {paymentSession?.monipay?.reference || "Not initialized"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span>Monipay</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleMonipayPayment}
                    disabled={(!paymentSession?.monipay?.authorization_url && !paymentSession?.monipay?.access_code) || isProcessing}
                    className="flex w-full items-center justify-center rounded-full bg-[#2284DB] px-4 py-3 text-base font-semibold text-white hover:bg-[#1a6bb8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Verifying payment...
                      </>
                    ) : (
                      "Pay with Monipay"
                    )}
                  </button>
                  <p className="mt-2 text-center text-xs text-[#697C8C]">
                    You will complete payment in Monipay checkout. Verification happens on the server after return.
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedMethod === "card" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Card Method
              </h2>
              <div className="space-y-3 rounded-[20px] border border-[#697B8C]/11 px-6 py-2">
                <div className="text-center">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    Amount
                  </span>
                  <p className="mt-1 text-4xl font-semibold text-[#2284DB]">
                    N35,000
                  </p>
                  <p className="mt-2 text-[15px] text-[#05243F]/40">
                    Kindly Input your Card Details
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <h3 className="text-sm font-medium text-[#05243F]">
                    Input Card Details
                  </h3>

                  {/* Card Number Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000-0000-0000-0000"
                      className="w-full rounded-[10px] border border-[#E1E6F4] bg-[#F8F8F8] py-3 pr-4 pl-12 text-right text-base text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />
                    {cardLogo && (
                      <div className="absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center">
                        <img
                          src={cardLogo}
                          alt={cardType || "card"}
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Month/Year and CVV */}
                  {/* TODO: Let add min and max value and error input invalidation */}
                  {/* <div className="grid grid-cols-2 gap-2"> */}
                  {/* ...omitted for brevity... */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Month"
                      value={month}
                      min={1}
                      max={12}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, month: true }))
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 2) {
                          e.target.value = e.target.value.slice(0, 2);
                        }
                      }}
                      onChange={(e) => setMonth(e.target.value)}
                      className={`w-full rounded-[10px] border ${touched.month && !isMonthValid
                        ? "border-red-500"
                        : "border-[#E1E6F4]"
                        } bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none`}
                    />

                    <input
                      type="number"
                      placeholder="Year"
                      value={year}
                      min={currentYear}
                      max={currentYear + 15}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, year: true }))
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 4) {
                          e.target.value = e.target.value.slice(0, 4);
                        }
                      }}
                      onChange={(e) => setYear(e.target.value)}
                      className={`w-full rounded-[10px] border ${touched.year && !isYearValid
                        ? "border-red-500"
                        : "border-[#E1E6F4]"
                        } bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none`}
                    />

                    <input
                      type="number"
                      placeholder="CVV"
                      value={cvv}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, cvv: true }))
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 4) {
                          e.target.value = e.target.value.slice(0, 4);
                        }
                      }}
                      onChange={(e) => setCvv(e.target.value)}
                      className={`w-full rounded-[10px] border ${touched.cvv && !isCvvValid
                        ? "border-red-500"
                        : "border-[#E1E6F4]"
                        } bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none`}
                    />

                    {/* Auto Renew */}
                    <div className="flex items-center justify-center gap-x-3 rounded-[10px] bg-[#EEF2FF]">
                      <input
                        type="checkbox"
                        id="autoRenew"
                        className="h-4 w-4 rounded-full border-[#E1E6F4] text-[#2389E3] focus:ring-[#2389E3]"
                      />
                      <label
                        htmlFor="autoRenew"
                        className="text-sm text-[#05243F]/40"
                      >
                        Auto Renew
                      </label>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mt-5 rounded-[10px] bg-[#F8F8F8] p-4 drop-shadow-xs">
                    <div className="flex gap-5">
                      <span className="text-base font-medium text-[#05243F]">
                        Note:
                      </span>
                      <p className="text-sm text-[#05243F]/60">
                        Activate Auto renewal to enjoy{" "}
                        <span className="font-semibold text-[#F26060]">
                          10%
                        </span>{" "}
                        Discount on your next renewal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="mt-5 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F]">
                Make Payment
              </button>
            </div>
          )}

          {selectedMethod === PAYMENT_METHODS.PAYSTACK && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Paystack Payment
              </h2>
              {!isPaymentMethodConfirmed ? (
                <div className="space-y-4 rounded-[20px] border border-[#697B8C]/11 px-6 py-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Secure Payment
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pay securely with your card, bank transfer, or mobile money
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#05243F]/60 mb-4">
                      Click the button below to confirm your payment method and proceed with payment.
                    </p>
                    <button
                      onClick={handleConfirmPaymentMethod}
                      disabled={isInitializing}
                      className="w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#1a6bb8] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInitializing ? (
                        <span className="flex items-center justify-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Initializing...
                        </span>
                      ) : (
                        "Confirm Payment Method"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Secure Payment
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pay securely with your card, bank transfer, or mobile
                          money
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-1">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Payment Summary
                    </h4>
                    <div className="space-y-1 text-xs text-[#697C8C]">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">
                          ₦{(paystackAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-mono text-xs">
                          {paymentSession?.paystack?.reference || "Not initialized"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span>Paystack</span>
                      </div>
                      {paymentSession?.items?.length > 1 && (
                        <div className="flex justify-between">
                          <span>Documents:</span>
                          <span className="font-semibold text-blue-600">
                            {paymentSession.items.length} items
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handlePaystackPayment}
                    disabled={!paymentSession?.paystack?.authorization_url || isProcessing}
                    className="flex w-full items-center justify-center rounded-full bg-[#2284DB] px-4 py-3 text-base font-semibold text-white hover:bg-[#1a6bb8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Verifying payment...
                      </>
                    ) : (
                      "Pay with Paystack"
                    )}
                  </button>
                  <p className="mt-2 text-center text-xs text-[#697C8C]">
                    You will be redirected to Paystack's secure payment page. Verification is automatic after payment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
