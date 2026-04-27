import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ladipoStore from "../../../store/ladipoStore";
import { getLadipoMainCategories } from "../../../services/apiLadipoCategories";

function Categories() {
  const {
    selectedMainCategory,
    setSelectedMainCategory,
    clearCategoryFilters,
  } = ladipoStore();

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
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {Array(6).fill(0).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="h-16 w-16 rounded-full bg-[#F4F5FC] animate-pulse" />
            <div className="h-3 w-12 bg-[#F4F5FC] animate-pulse rounded" />
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
      {/* Horizontal Scrollable Categories */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
        >
          {/* All Categories Button */}
          <button
            onClick={() => clearCategoryFilters()}
            className="flex flex-col items-center gap-2.5 transition-all duration-200 cursor-pointer flex-shrink-0 group"
          >
            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-base font-bold transition-all ${!selectedMainCategory ? "bg-[#1A7ACF] text-white" : "bg-[#F4F5FC] text-[#05243F] group-hover:bg-[#E8EDFA]"
              }`}>
              All
            </div>
            <span className="text-[12px] font-semibold text-center text-[#05243F]">Browse All</span>
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
                <div
                  className={`h-16 w-16 rounded-full overflow-hidden flex-shrink-0 transition-all ${isActive ? "ring-2 ring-[#1A7ACF] ring-offset-1" : "group-hover:shadow-md"
                    }`}
                  style={{
                    background: `linear-gradient(135deg, ${category.accentFrom} 0%, ${category.accentTo} 100%)`,
                  }}
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center min-w-0 max-w-[80px]">
                  <span className="text-[12px] font-semibold leading-tight text-center line-clamp-2 text-[#05243F]">
                    {category.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-[#697C8C] shadow-sm hover:text-[#2389E3] hover:bg-[#F4F5FC] transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-[#697C8C] shadow-sm hover:text-[#2389E3] hover:bg-[#F4F5FC] transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Categories;
