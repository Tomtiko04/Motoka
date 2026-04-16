import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCartStore from "../../../store/cartStore";

const CONDITION_LABELS = {
  new: { text: "New", icon: "solar:verified-check-bold", color: "bg-emerald-500 text-white", borderColor: "border-emerald-300" },
  tokunbo: { text: "Tokunbo", icon: "solar:import-bold", color: "bg-[#2389E3] text-white", borderColor: "border-[#2389E3]/40" },
  nigerian_used: { text: "Used", icon: "solar:refresh-bold", color: "bg-[#EBB850] text-white", borderColor: "border-[#EBB850]/40" },
};

function ProductCard({ part }) {
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

  const condition = CONDITION_LABELS[part.condition] || CONDITION_LABELS.new;

  return (
    <div className="group relative flex h-full w-full cursor-pointer flex-col rounded-[16px] border border-[#E1E6F4] bg-white p-4 transition-all duration-300 hover:border-[#2389E3]">
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
