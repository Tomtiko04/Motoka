import { useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import ladipoStore from "../../../store/ladipoStore";

export default function SubcategoriesNav({ subcategories = [], mainCategory }) {
  const { selectedSubcategory, setSelectedSubcategory } = ladipoStore();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [subcategories]);

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

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#E8EDFA]">
      <div className="px-0 py-2">
        {/* Scroll Container with Buttons */}
        <div className="relative">
          {/* Left Scroll Button - Outside */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#E8EDFA]/95 text-[#697C8C] hover:text-[#2389E3] transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex overflow-x-auto scrollbar-hide py-1 scroll-smooth"
          >
            {subcategories.map((subcategory, index) => {
              const isActive = selectedSubcategory?.id === subcategory.id;
              return (
                <div
                  key={subcategory.id}
                  className="flex items-center flex-shrink-0"
                >
                  <button
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 ${isActive
                        ? "bg-white text-[#1A7ACF]"
                        : "bg-transparent text-[#8B98A5] hover:text-[#05243F]"
                      }`}
                  >
                    {subcategory.name}
                  </button>
                  {index < subcategories.length - 1 && (
                    <span className="mx-1 h-4 w-px bg-[#C9D4E5]" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Scroll Button - Outside */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#E8EDFA]/95 text-[#697C8C] hover:text-[#2389E3] transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
