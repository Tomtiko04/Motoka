import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";
import ladipoStore from "../../../store/ladipoStore";
import { getLadipoMainCategories } from "../../../services/apiLadipoCategories";

function Categories({ onBrowseAll, isBrowseAllActive = false }) {
  const {
    selectedMainCategory,
    setSelectedMainCategory,
    clearCategoryFilters,
  } = ladipoStore();

  function handleBrowseAll() {
    clearCategoryFilters();
    onBrowseAll?.();
  }

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getLadipoMainCategories();
        setCategories(data);
      } catch {
        setError("Unable to load categories right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Check scroll position
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-3">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5 flex-shrink-0">
            <div className="h-[60px] w-[84px] rounded-[90px] bg-[#F4F5FC] animate-pulse" />
            <div className="h-2.5 w-14 bg-[#F4F5FC] animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl border border-[#F2D3D3] bg-[#FFF7F7] px-4 py-3 text-[13px] text-[#A33A3A]">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">

        {/* Edge fade — left: signals more content behind, non-interactive */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-white to-transparent" />
        )}
        {/* Edge fade — right */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-white to-transparent" />
        )}

        {/* Scrollable row */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-5 sm:gap-7 overflow-x-auto no-scrollbar pb-3 scroll-smooth"
        >
          {/* Browse All */}
          <button
            onClick={handleBrowseAll}
            className="flex flex-col items-center gap-2.5 transition-all duration-200 cursor-pointer flex-shrink-0 group"
          >
            <div className={`h-[60px] w-[84px] rounded-[90px] border flex items-center justify-center text-base font-bold transition-all ${
              isBrowseAllActive
                ? "bg-[#1A7ACF] text-white border-[#2284DB]"
                : "bg-[#F4F5FC] text-[#05243F] border-[#D3D9DE4D] group-hover:bg-[#E8EDFA]"
            }`}>
              All
            </div>
            <span className="text-[11px] sm:text-[12px] font-semibold text-center text-[#05243F]">Browse All</span>
          </button>

          {/* Main Categories */}
          {categories.map((category) => {
            const isActive = selectedMainCategory?.id === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedMainCategory(category)}
                className="flex flex-col items-center gap-2.5 transition-all duration-200 cursor-pointer flex-shrink-0 group"
              >
                <div className={`relative h-[60px] w-[84px] rounded-[90px] overflow-hidden flex-shrink-0 bg-[#F4F5FC] transition-all border-2 ${
                  isActive
                    ? "border-[#2389E3] ring-2 ring-[#2389E3]/20"
                    : "border-transparent group-hover:border-[#2389E3]/40 group-hover:shadow-md"
                }`}>
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover scale-125"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon icon="solar:widget-5-bold-duotone" fontSize={22} className="text-[#8B98A5]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center min-w-0 max-w-[80px]">
                  <span className={`text-[11px] sm:text-[12px] font-semibold leading-tight text-center line-clamp-2 transition-colors ${
                    isActive ? "text-[#2389E3]" : "text-[#05243F]"
                  }`}>
                    {category.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scroll arrows — desktop only (mobile users swipe) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white text-[#697C8C] shadow-md border border-[#E1E6F4] hover:text-[#2389E3] hover:border-[#2389E3] transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white text-[#697C8C] shadow-md border border-[#E1E6F4] hover:text-[#2389E3] hover:border-[#2389E3] transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Categories;
