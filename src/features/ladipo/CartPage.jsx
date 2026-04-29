import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import LadipoLayout from "./components/LadipoLayout";
import useCartStore, { selectTotalKobo } from "../../store/cartStore";

function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQty = useCartStore((s) => s.setQty);
  const totalKobo = useCartStore(selectTotalKobo);
  const navigate = useNavigate();

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <LadipoLayout title="Cart" backPath="/ladipo">

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-[#E1E6F4]">
          <div className="w-20 h-20 rounded-2xl bg-[#F4F5FC] flex items-center justify-center">
            <Icon icon="solar:bag-4-bold-duotone" width="40" className="text-[#2389E3]/40" />
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[#05243F] mb-1">Your cart is empty</p>
            <p className="text-[13px] text-[#697C8C]">Browse parts to add items to your cart</p>
          </div>
          <Link
            to="/ladipo"
            className="bg-[#2389E3] px-8 py-3 rounded-full text-white text-sm font-semibold hover:bg-[#1a7acf] transition-all active:scale-[0.98] cursor-pointer"
          >
            Browse Parts
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
          {/* Cart card */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#E8ECF0]">
            {/* Item rows */}
            {items.map((item, idx) => (
              <div
                key={item.inventoryId}
                className={`flex items-center gap-4 px-5 py-4 ${
                  idx < items.length - 1 ? "border-b border-[#F0F2F5]" : ""
                }`}
              >
                {/* Thumbnail */}
                <Link
                  to={`/ladipo/${item.slug}`}
                  className="flex-shrink-0 w-16 h-16 rounded-xl bg-[#F4F5FC] flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-contain w-full h-full p-1.5"
                    />
                  ) : (
                    <Icon icon="solar:box-bold-duotone" width="26" className="text-[#D3D9DE]" />
                  )}
                </Link>

                {/* Name + subtitle */}
                <div className="flex-1 min-w-0">
                  <Link to={`/ladipo/${item.slug}`} className="cursor-pointer">
                    <p className="text-[14px] font-bold text-[#0D1B2A] leading-snug line-clamp-1">
                      {item.name}
                    </p>
                  </Link>
                  <p className="text-[12px] text-[#8A9EB0] mt-0.5 line-clamp-1">
                    {item.subtitle || item.category || "Auto Part"}
                  </p>
                </div>

                {/* Price */}
                <div className="hidden sm:block min-w-[90px] text-right flex-shrink-0">
                  <p className="text-[14px] font-bold text-[#2389E3]">
                    ₦{((item.priceKobo * item.quantity) / 100).toLocaleString("en-NG")}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setQty(item.inventoryId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-[#EEF0F3] flex items-center justify-center text-[#697C8C] hover:bg-[#DDE0E5] transition-colors cursor-pointer text-lg font-bold leading-none"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-[14px] font-semibold text-[#0D1B2A]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => setQty(item.inventoryId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-[#2389E3] flex items-center justify-center text-white hover:bg-[#1a7acf] transition-colors cursor-pointer"
                  >
                    <Icon icon="lucide:plus" width="14" />
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.inventoryId)}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#FDE8E8] flex items-center justify-center text-[#D93025] hover:bg-[#FCCFCF] transition-colors cursor-pointer"
                >
                  <Icon icon="solar:trash-bin-trash-bold" width="16" />
                </button>
              </div>
            ))}

            {/* Subtotal bar — amber */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#E8B84B]">
              <span className="text-[14px] font-bold text-white">Subtotal</span>
              <span className="text-[14px] font-bold text-white">
                ₦{(totalKobo / 100).toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          {/* Checkout button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/ladipo/checkout")}
              className="w-[220px] bg-[#2389E3] hover:bg-[#1a7acf] text-white font-bold text-[15px] py-3.5 rounded-full transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-[#2389E3]/30"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </LadipoLayout>
  );
}

export default CartPage;
