import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import { getLadipoPartBySlug } from "../../../services/apiLadipo";
import useCartStore from "../../../store/cartStore";
import LadipoLayout from "./LadipoLayout";

const CONDITION_LABELS = {
  new: { text: "New", icon: "solar:verified-check-bold", color: "bg-emerald-500 text-white" },
  tokunbo: { text: "Tokunbo", icon: "solar:import-bold", color: "bg-[#2389E3] text-white" },
  nigerian_used: { text: "Nigerian Used", icon: "solar:refresh-bold", color: "bg-[#EBB850] text-white" },
};

function ProductModal() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [touchStart, setTouchStart] = useState(null);

  const addItem = useCartStore((s) => s.addItem);

  const { data: part, isLoading, isError } = useQuery({
    queryKey: ["ladipo-part", slug],
    queryFn: () => getLadipoPartBySlug(slug),
    enabled: !!slug,
  });
  const sanitizedDescription = useMemo(
    () => DOMPurify.sanitize(part?.description || ""),
    [part?.description]
  );

  function buildCartItem(quantityToUse) {
    return {
      inventoryId: part.inventory_id,
      partId: part.id,
      slug: part.slug,
      name: part.name,
      imageUrl: part.primary_image_url,
      priceKobo: part.price_kobo,
      quantity: quantityToUse,
    };
  }

  function handleAddToCart() {
    if (!part?.inventory_id) return toast.error("This part is currently unavailable");
    addItem(buildCartItem(displayQty));
    toast.success(`${part.name} added to cart`);
  }

  function handleBuyNow() {
    if (!part?.inventory_id) return toast.error("This part is currently unavailable");
    addItem(buildCartItem(displayQty));
    navigate("/ladipo/cart-page");
  }

  function handleTouchStart(e) {
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchEnd(e, imageCount) {
    if (touchStart === null) return;

    const distance = touchStart - e.changedTouches[0].clientX;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && selectedImage < imageCount - 1) {
      setSelectedImage(selectedImage + 1);
    } else if (isSwipeRight && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  }

  function handleKeyDown(e, imageCount) {
    if (e.key === "ArrowRight" && selectedImage < imageCount - 1) {
      setSelectedImage(selectedImage + 1);
    } else if (e.key === "ArrowLeft" && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  }

  if (isLoading) {
    return (
      <LadipoLayout title="Ladipo" backPath="/ladipo">
        <div className="w-full bg-white rounded-[28px] p-5 sm:p-8 border border-[#E1E6F4] mb-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side Skeleton */}
            <div className="flex flex-col">
              <div className="mb-4 space-y-2">
                <div className="h-6 w-3/4 bg-[#E1E6F4] rounded" />
                <div className="h-3 w-16 bg-[#E1E6F4] rounded" />
                <div className="h-4 w-24 bg-[#E1E6F4] rounded mt-2" />
              </div>
              <div className="h-[240px] sm:h-[300px] w-full bg-[#E1E6F4] rounded-[16px] mb-4" />
              <div className="flex justify-between mt-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[70px] sm:h-[80px] w-[70px] sm:w-[80px] bg-[#E1E6F4] rounded-[16px]" />
                ))}
              </div>
            </div>

            {/* Right Side Skeleton */}
            <div className="flex flex-col gap-6 lg:pl-6 lg:border-l lg:border-[#E1E6F4]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="pb-6 border-b border-[#E1E6F4] space-y-3">
                  <div className="h-4 w-1/3 bg-[#E1E6F4] rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-[#E1E6F4] rounded" />
                    <div className="h-3 w-5/6 bg-[#E1E6F4] rounded" />
                    <div className="h-3 w-4/6 bg-[#E1E6F4] rounded" />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 mt-auto">
                <div className="flex-1 h-12 bg-[#E1E6F4] rounded-full" />
                <div className="flex-1 h-12 bg-[#E1E6F4] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </LadipoLayout>
    );
  }

  if (isError || !part) {
    return (
      <LadipoLayout title="Ladipo" backPath="/ladipo">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <Icon icon="solar:danger-triangle-bold" width="32" className="text-red-400" />
          </div>
          <p className="text-[16px] font-semibold text-[#05243F]">Part not found</p>
          <button onClick={() => navigate("/ladipo")} className="text-sm text-[#2389E3] hover:underline font-semibold">
            Back to marketplace
          </button>
        </div>
      </LadipoLayout>
    );
  }

  const images = Array.isArray(part.images) && part.images.length > 0
    ? part.images
    : [part.primary_image_url].filter(Boolean);

  const keyFeatures = Array.isArray(part.key_features) ? part.key_features : [];
  const displayQty = Math.max(1, qty);
  return (
    <LadipoLayout
      title={part.name}
      subTitle={part.brand || "Auto part"}
      backPath="/ladipo"
    >
      <div className="w-full bg-white rounded-[28px] p-5 sm:p-8 border border-[#E1E6F4] mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image & Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-[18px] sm:text-[20px] font-bold text-[#05243F] mb-2">{part.name}</h3>
                <p className="text-[13px] text-[#697C8C] mb-1">Price:</p>
                <p className="text-[14px] font-bold text-[#05243F]">
                  {part.price_kobo != null ? `₦${(Math.round(part.price_kobo) / 100).toLocaleString("en-NG")}` : "---"}
                </p>
              </div>

              {/* Image Container */}
              <div
                className="flex items-center justify-center p-4 mb-4 relative cursor-grab active:cursor-grabbing select-none h-[240px] sm:h-[300px] border border-[#E8E9EB] rounded-[16px] overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, images.length)}
                onKeyDown={(e) => handleKeyDown(e, images.length)}
                tabIndex={0}
                role="region"
                aria-label="Product image gallery"
              >
                {images[selectedImage] ? (
                  <img src={images[selectedImage]} alt={part.name} className="object-contain h-full w-full pointer-events-none" />
                ) : (
                  <Icon icon="solar:box-bold-duotone" width="64" className="text-[#E1E6F4]" />
                )}
              </div>

              {/* Thumbnails */}
              <div className="mt-5 flex justify-between">
                {[...Array(4)].map((_, i) => {
                  // If we don't have enough unique images, just repeat the available ones
                  const imgToShow = images[i % images.length];
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i % images.length)}
                      className={`flex-shrink-0 h-[70px] sm:h-[80px] w-[70px] sm:w-[80px] rounded-[16px] border overflow-hidden p-2 transition-all cursor-pointer ${
                        selectedImage === (i % images.length) && i < images.length
                          ? "border-[#2389E3] ring-1 ring-[#2389E3] bg-[#2389E3]/5"
                          : "border-[#E1E6F4] bg-[#F4F5FC] hover:border-[#2389E3]/50"
                      }`}
                    >
                      {imgToShow ? (
                        <img src={imgToShow} alt="" className="object-contain w-full h-full mix-blend-multiply" />
                      ) : (
                        <Icon icon="solar:box-bold-duotone" width="24" className="text-[#D3D9DE] w-full h-full p-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="flex flex-col gap-6 lg:pl-6 lg:border-l lg:border-[#E1E6F4]">
              {/* Product Specification */}
              {part.specifications && typeof part.specifications === "object" && Object.keys(part.specifications).length > 0 && (
                <div className="pb-6 border-b border-[#E1E6F4]">
                  <h4 className="text-[13px] font-bold text-[#05243F] mb-3 uppercase tracking-wide">Product Specification:</h4>
                  <div className="space-y-2">
                    {Object.entries(part.specifications).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="text-[12px]">
                        <span className="text-[#697C8C]">{key.replace(/_/g, " ")}: </span>
                        <span className="text-[#05243F] font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Description */}
              {sanitizedDescription && (
                <div className="pb-6 border-b border-[#E1E6F4]">
                  <h4 className="text-[13px] font-bold text-[#05243F] mb-3 uppercase tracking-wide">Product Description:</h4>
                  <div
                    className="text-[12px] text-[#697C8C] leading-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription.length > 200 ? sanitizedDescription.substring(0, 200) + "..." : sanitizedDescription }}
                  />
                </div>
              )}

              {/* Key Features */}
              {keyFeatures.length > 0 && (
                <div className="pb-6 border-b border-[#E1E6F4]">
                  <h4 className="text-[13px] font-bold text-[#05243F] mb-3 uppercase tracking-wide">Key Features:</h4>
                  <ul className="space-y-2">
                    {keyFeatures.slice(0, 3).map((feature, i) => (
                      <li key={i} className="text-[12px] text-[#697C8C]">
                        <span className="font-semibold text-[#05243F]">• {feature.title}:</span> {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-4 py-3 border-2 border-[#2389E3] text-[#2389E3] rounded-full font-bold text-[13px] hover:bg-[#2389E3]/5 transition-colors cursor-pointer"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 px-4 py-3 bg-[#2389E3] text-white rounded-full font-bold text-[13px] hover:bg-[#1a7acf] transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
    </LadipoLayout>
  );
}

export default ProductModal;
