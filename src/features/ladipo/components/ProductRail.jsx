import ProductCard from "./productCard";
import ProductSkeleton from "./ProductSkeleton";

function ProductRail({ title, parts = [], loading = false, onSeeAll, seeAllLabel = "See All" }) {
  if (!loading && parts.length === 0) return null;

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold text-[#2389E3]">{title}</h2>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[13px] font-semibold text-[#8B98A5] hover:text-[#05243F] transition-colors cursor-pointer"
          >
            {seeAllLabel}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 sm:-mx-6 sm:px-6 pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[160px] sm:w-[200px] flex-shrink-0">
              <ProductSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 sm:-mx-6 sm:px-6 pb-1 scroll-smooth">
          {parts.map((part) => (
            <div
              key={part.id}
              className="w-[160px] sm:w-[200px] flex-shrink-0 snap-start"
            >
              <ProductCard part={part} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductRail;
