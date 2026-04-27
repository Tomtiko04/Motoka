import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import useCartStore, { selectTotalKobo } from "../../store/cartStore";
import { createLadipoOrder } from "../../services/apiLadipo";
import { PAYMENT_TYPES } from "../payment/config/paymentTypes";
import { useGetLocalGovernment, useGetState } from "../licenses/useRenew";
import SearchableSelect from "../../components/shared/SearchableSelect";
import LadipoLayout from "./components/LadipoLayout";

const DELIVERY_OPTIONS = [
  {
    label: "World wide",
    description: "Fee is calculated by your delivery location",
    value: "standard",
    icon: "solar:scooter-bold-duotone",
  },
];

export default function LadipoCheckout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotalKobo = useCartStore(selectTotalKobo);

  const deliveryOption = DELIVERY_OPTIONS[0];
  const [form, setForm] = useState({
    contact_name: "",
    phone: "",
    address: "",
    state: "",
    stateName: "",
    lga: "",
  });
  const [loading, setLoading] = useState(false);
  const [lgaOptions, setLgaOptions] = useState([]);
  const { data: state, isPending: isGettingState } = useGetState();
  const {
    mutate: fetchLGAs,
    isPending: isGettingLG,
  } = useGetLocalGovernment();

  useEffect(() => {
    if (items.length === 0) {
      navigate("/ladipo/cart-page");
    }
  }, [items.length, navigate]);

  const isState = state?.data;
  const selectedState = useMemo(
    () => (Array.isArray(isState) ? isState.find((s) => s.code === form.state) : null),
    [isState, form.state],
  );
  const deliveryFeeKobo = Number(selectedState?.delivery_fee || 0);
  const totalKobo = subtotalKobo + deliveryFeeKobo;
  const isCheckoutReady =
    form.contact_name.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.state &&
    form.lga;

  if (items.length === 0) {
    return null;
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "state" ? { lga: "" } : {}),
    }));
  }

  const handleStateChange = (e) => {
    const selectedStateName = e.target.value;

    if (!selectedStateName) {
      setForm((prev) => ({
        ...prev,
        state: "",
        stateName: "",
        lga: "",
      }));
      setLgaOptions([]);
      return;
    }

    const selected = Array.isArray(isState)
      ? isState.find((entry) => entry.state_name === selectedStateName)
      : null;

    if (selected) {
      setForm((prev) => ({
        ...prev,
        state: selected.code,
        stateName: selectedStateName,
        lga: "",
      }));
      fetchLGAs(selected.code, {
        onSuccess: (response) => {
          const options = Array.isArray(response?.data) ? response.data : [];
          setLgaOptions(options);
        },
      });
    } else {
      setForm((prev) => ({
        ...prev,
        state: "",
        stateName: selectedStateName,
        lga: "",
      }));
      setLgaOptions([]);
    }
  };

  const handleLgaChange = (e) => {
    setForm((prev) => ({ ...prev, lga: e.target.value || "" }));
  };

  const formatPhoneDisplay = (raw) => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  };

  const handlePhoneChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    setForm((prev) => ({ ...prev, phone: digits }));
  };

  // Step 1: Create order and move to payment
  async function handleProceedToPayment(e) {
    e.preventDefault();

    if (!form.contact_name.trim()) return toast.error("Please enter your name");
    if (!form.phone.trim()) return toast.error("Please enter your phone number");
    if (!form.address.trim()) return toast.error("Please enter a delivery address");
    if (!form.state) return toast.error("Please select a state");
    if (!form.lga) return toast.error("Please select a local government");

    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          inventory_id: i.inventoryId,
          quantity: i.quantity,
        })),
        delivery: {
          contact_name: form.contact_name,
          phone: form.phone,
          address: form.address,
          state: form.state,
          lga: form.lga,
          method: "standard",
        },
      };

      const order = await createLadipoOrder(orderPayload);

      // Navigate to the shared PaymentOptions page
      const paymentData = {
        type: PAYMENT_TYPES.LADIPO,
        order_number: order.order_number,
        amount: order.total_kobo,
        price: order.total_kobo,
        orderData: order,
      };

      try {
        sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
      } catch { /* ignore */ }

      navigate(`/payment?type=${PAYMENT_TYPES.LADIPO}`, {
        state: { paymentData },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "border border-[#E1E6F4] rounded-2xl px-4 py-3 text-[14px] text-[#05243F] outline-none focus:border-[#2389E3] focus:ring-2 focus:ring-[#2389E3]/10 transition-all placeholder:text-[#05243F]/40 bg-white w-full";

  return (
    <LadipoLayout title="Checkout" backPath="/ladipo/cart-page">
      <div className="max-w-3xl mx-auto">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {[
            { num: 1, label: "Cart", icon: "solar:bag-4-bold" },
            { num: 2, label: "Details", icon: "solar:clipboard-list-bold" },
            { num: 3, label: "Payment", icon: "solar:card-bold" },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              {idx > 0 && (
                <div className={`w-8 sm:w-14 h-[2px] ${s.num <= 2 ? "bg-[#2389E3]" : "bg-[#E1E6F4]"} transition-colors`} />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] font-bold transition-all ${
                    s.num === 1
                      ? "bg-emerald-500 text-white"
                      : s.num === 2
                        ? "bg-[#2389E3] text-white"
                        : "bg-[#F4F5FC] text-[#697C8C]"
                  }`}
                >
                  {s.num === 1 ? (
                    <Icon icon="solar:check-circle-bold" width="16" />
                  ) : (
                    <Icon icon={s.icon} width="15" />
                  )}
                </div>
                <span className={`text-[12px] font-semibold hidden sm:inline ${s.num <= 2 ? "text-[#05243F]" : "text-[#697C8C]"}`}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Details form */}
          <form onSubmit={handleProceedToPayment} className="bg-white rounded-[28px] border border-[#E1E6F4] p-5 sm:p-8 flex flex-col lg:flex-row gap-8">
            {/* Left column - Forms */}
            <div className="flex-1 flex flex-col">
              {/* Contact info */}
              <div className="pb-6 border-b border-[#E1E6F4]">
                <h3 className="text-[15px] font-bold text-[#05243F] mb-4 flex items-center gap-2">
                  <Icon icon="solar:user-bold-duotone" width="19" className="text-[#2389E3]" />
                  Contact Details
                </h3>
                <div className="flex flex-col gap-3">
                  <input type="text" name="contact_name" placeholder="Full name" value={form.contact_name} onChange={handleFormChange} required className={inputCls} />
                  <div className="flex items-center gap-3 overflow-hidden rounded-[12px] border border-[#E1E5EE] bg-white transition-colors focus-within:border-[#2389E3] focus-within:ring-2 focus-within:ring-[#2389E3]/20">
                    <div className="flex shrink-0 items-center gap-2 border-r border-[#E1E5EE] bg-[#F4F5FC] px-4 py-3">
                      <Icon icon="solar:phone-bold" className="text-[#2389E3]" fontSize={20} />
                      <span className="text-sm font-medium text-[#697C8C]">+234</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      maxLength={14}
                      value={formatPhoneDisplay(form.phone)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      required
                      className="flex-1 bg-transparent px-4 py-3 text-base tracking-widest text-[#05243F] placeholder:tracking-normal placeholder:text-[#05243F]/40 outline-none"
                      placeholder="080 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery method */}
              <div className="py-6 border-b border-[#E1E6F4]">
                <h3 className="text-[15px] font-bold text-[#05243F] mb-4 flex items-center gap-2">
                  <Icon icon="solar:delivery-bold-duotone" width="19" className="text-[#2389E3]" />
                  Delivery Method
                </h3>
                <div className="flex flex-col gap-2.5">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3.5 rounded-[12px] border-2 transition-all ${
                        deliveryOption.value === opt.value
                          ? "border-[#2389E3] bg-[#2389E3]/5"
                          : "border-[#E1E6F4] hover:border-[#2389E3]/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        deliveryOption.value === opt.value ? "border-[#2389E3]" : "border-[#D3D9DE]"
                      }`}>
                        {deliveryOption.value === opt.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2389E3]" />
                        )}
                      </div>
                      <Icon icon={opt.icon} width="22" className={deliveryOption.value === opt.value ? "text-[#2389E3]" : "text-[#697C8C]"} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#05243F]">{opt.label}</p>
                        <p className="text-[12px] text-[#697C8C]">{opt.description}</p>
                      </div>
                      <span className="text-[13px] font-bold flex-shrink-0 text-[#05243F]">
                        Calculated
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery address */}
              <div className="pt-6">
                <h3 className="text-[15px] font-bold text-[#05243F] mb-4 flex items-center gap-2">
                  <Icon icon="solar:map-point-bold-duotone" width="19" className="text-[#2389E3]" />
                  Delivery Address
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-sm font-medium text-[#05243F]">
                      Delivery Address <span className="text-red-500">*</span>
                    </div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Street address"
                      value={form.address}
                      onChange={handleFormChange}
                      className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SearchableSelect
                      label={<>State <span className="text-red-500">*</span></>}
                      name="state"
                      value={form.stateName}
                      onChange={handleStateChange}
                      options={
                        Array.isArray(isState)
                          ? isState.map((entry) => ({ id: entry.id, name: entry.state_name }))
                          : []
                      }
                      placeholder="Select state"
                      filterKey="name"
                      isLoading={isGettingState}
                      allowCustom={true}
                    />
                    <SearchableSelect
                      label={<>Local Government <span className="text-red-500">*</span></>}
                      name="lga"
                      value={form.lga}
                      onChange={handleLgaChange}
                      options={
                        Array.isArray(lgaOptions)
                          ? lgaOptions.map((entry) => ({ id: entry.id, name: entry.lga_name }))
                          : []
                      }
                      placeholder="Select local government"
                      filterKey="name"
                      isLoading={isGettingLG}
                      disabled={!form.state}
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#05243F]">
                      Delivery Fee <span className="text-red-500">*</span>
                    </div>
                    <input
                      readOnly
                      type="text"
                      value={form.state ? `₦${(deliveryFeeKobo / 100).toLocaleString()}` : "Select a state first"}
                      className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Order summary */}
            <div className="lg:w-[300px] flex-shrink-0 pt-6 border-t border-[#E1E6F4] lg:pt-0 lg:border-t-0 lg:pl-8 lg:border-l">
              <div className="lg:sticky lg:top-36">
                <h3 className="text-[15px] font-bold text-[#05243F] mb-3">Order Summary</h3>
                <div className="max-h-[200px] overflow-y-auto mb-3">
                  {items.map((item) => (
                    <div key={item.inventoryId} className="flex justify-between py-2 text-[13px]">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                        <span className="text-[#05243F] truncate">{item.name}</span>
                        <span className="text-[#697C8C] flex-shrink-0">&times;{item.quantity}</span>
                      </div>
                      <span className="text-[#05243F] font-semibold flex-shrink-0">
                        ₦{((item.priceKobo * item.quantity) / 100).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E1E6F4] pt-3 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#697C8C]">Subtotal</span>
                    <span className="text-[#05243F] font-semibold">₦{(subtotalKobo / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#697C8C]">Delivery</span>
                    <span className="font-semibold text-[#05243F]">
                      {form.state ? `₦${(deliveryFeeKobo / 100).toLocaleString()}` : "Select state"}
                    </span>
                  </div>
                  <div className="border-t border-[#E1E6F4] pt-2 mt-2 flex justify-between items-baseline">
                    <span className="text-[14px] font-semibold text-[#05243F]">Total</span>
                    <span className="text-xl font-bold text-[#05243F]">₦{(totalKobo / 100).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isCheckoutReady}
                  className="w-full mt-4 bg-[#2389E3] py-3.5 rounded-[12px] text-white font-semibold text-[15px] hover:bg-[#1a7acf] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating order...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <Icon icon="solar:arrow-right-linear" width="16" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
      </div>
    </LadipoLayout>
  );
}
