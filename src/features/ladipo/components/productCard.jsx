import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCartStore from "../../../store/cartStore";

const CONDITION_LABELS = {
  new: { text: "New", icon: "solar:verified-check-bold", color: "bg-emerald-500 text-white", borderColor: "border-emerald-300" },
  tokunbo: { text: "Tokunbo", icon: "solar:import-bold", color: "bg-[#2389E3] text-white", borderColor: "border-[#2389E3]/40" },
  nigerian_used: { text: "Used", icon: "solar:refresh-bold", color: "bg-[#EBB850] text-white", borderColor: "border-[#EBB850]/40" },
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isCompatibilityMatch(car, rule) {
  if (!car || !rule) return false;
  const carMake = normalize(car.vehicle_make);
  const carModel = normalize(car.vehicle_model);
  const carYearRaw = car.vehicle_year;
  const carYear = carYearRaw === undefined || carYearRaw === null || carYearRaw === ""
    ? null
    : Number(carYearRaw);

  const ruleMake = normalize(rule.make);
  const ruleModel = normalize(rule.model);

  if (!ruleMake || carMake !== ruleMake) return false;
  if (ruleModel && carModel !== ruleModel) return false;

  if (carYear != null && Number.isFinite(carYear)) {
    if (rule.year_min != null && carYear < Number(rule.year_min)) return false;
    if (rule.year_max != null && carYear > Number(rule.year_max)) return false;
  }

  return true;
}

function ProductCard({ part, isCarFilterActive = false, selectedCar = null, garageCars = [] }) {
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  function buildCartItem() {
    return {
      inventoryId: part.inventory_id,
      partId: part.id,
      slug: part.slug,
      name: part.name,
      imageUrl: part.primary_image_url,
      priceKobo: part.price_kobo,
      quantity: 1,
    };
  }

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!part.inventory_id) return toast.error("This part is currently unavailable");
    addItem(buildCartItem());
    toast.success(`${part.name} added to cart`);
  }

  function handleBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!part.inventory_id) return toast.error("This part is currently unavailable");
    addItem(buildCartItem());
    navigate("/ladipo/cart-page");
  }

  function handleCardOpen() {
    if (!part?.slug) return;
    navigate(`/ladipo/${part.slug}`);
  }

  const condition = CONDITION_LABELS[part.condition] || CONDITION_LABELS.new;
  const showUniversalBadge = part?.is_universal === true;
  const compatibilityRows = Array.isArray(part?.compatibility) ? part.compatibility : [];
  const allGarageCars = Array.isArray(garageCars) ? garageCars : [];
  const matchedGarageCars = allGarageCars.filter((car) =>
    compatibilityRows.some((rule) => isCompatibilityMatch(car, rule))
  );
  const selectedCarMatches = selectedCar
    ? compatibilityRows.some((rule) => isCompatibilityMatch(selectedCar, rule))
    : false;

  let fitBadgeText = null;
  if (!showUniversalBadge) {
    if (selectedCar && selectedCarMatches) {
      fitBadgeText = "Fits your car";
    } else if (!selectedCar && matchedGarageCars.length > 0) {
      fitBadgeText = matchedGarageCars.length === 1
        ? "Fits 1 of your cars"
        : `Fits ${matchedGarageCars.length} of your cars`;
    } else if (isCarFilterActive) {
      fitBadgeText = "Fits your car";
    }
  }

  const showFitsBadge = !showUniversalBadge && !!fitBadgeText;

  return (
    <div
      className="group relative flex h-full w-full cursor-pointer flex-col rounded-[16px] border border-[#E1E6F4] bg-white p-4 transition-all duration-300 hover:border-[#2389E3]"
      onClick={handleCardOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${part?.name || "product"} details`}
    >
      <button
        onClick={handleAddToCart}
        className="absolute top-4 right-4 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-[#DFE4E8] text-white transition-colors group-hover:bg-[#2389E3]"
      >
        <Icon icon="lucide:plus" width="14" strokeWidth="3" />
      </button>

      {part.condition && (
        <span className={`absolute top-4 left-4 z-10 rounded-[4px] px-1.5 py-[2px] text-[9px] font-bold ${condition.color}`}>
          {condition.text}
        </span>
      )}

      <div className="relative mb-4 aspect-square flex items-center justify-center">
        {part.primary_image_url ? (
          <img
            src={part.primary_image_url}
            alt={part.name}
            className="h-3/4 w-3/4 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Icon icon="solar:box-bold-duotone" width="48" className="text-[#D3D9DE]" />
        )}

      </div>

      {(showFitsBadge || showUniversalBadge) && (
        <span
          className={`absolute bottom-4 left-4 z-10 rounded-[4px] px-1.5 py-[2px] text-[9px] font-bold ${
            showUniversalBadge ? "bg-slate-500 text-white" : "bg-emerald-500 text-white"
          }`}
        >
          {showUniversalBadge ? "Universal" : fitBadgeText}
        </span>
      )}

      <div className="flex flex-1 flex-col">
        <p className="mb-1 min-h-[3.5rem] text-[14px] font-bold leading-snug text-[#05243F] line-clamp-2">
          {part.name}
        </p>

        <p className="mb-2 min-h-[1.25rem] text-[12px] font-medium text-[#8A9EB0] line-clamp-1">
          {part.brand || "\u00A0"}
        </p>

        <div className="mt-auto flex flex-col gap-3">
          <p className="text-[14px] font-bold text-[#2389E3]">
            {part.price_kobo != null
              ? `\u20A6${(Math.round(part.price_kobo) / 100).toLocaleString("en-NG", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
              : "\u2014"}
          </p>

          <button
            onClick={handleBuyNow}
            className="flex w-full items-center justify-center rounded-full bg-[#DFE4E8] py-2 text-[13px] font-bold text-white transition-colors duration-300 cursor-pointer group-hover:bg-[#2389E3]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
