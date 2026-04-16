export default function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-[#E1E6F4]" />

      {/* Content placeholder */}
      <div className="flex flex-col flex-1 px-3 sm:px-3.5 pt-2 pb-3 sm:pb-3.5 gap-2">
        {/* Brand */}
        <div className="h-3 w-16 bg-[#E1E6F4] rounded" />
        
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-[#E1E6F4] rounded" />
          <div className="h-3 w-4/5 bg-[#E1E6F4] rounded" />
        </div>

        {/* Price */}
        <div className="mt-auto pt-1.5">
          <div className="h-4 w-24 bg-[#E1E6F4] rounded" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-2">
          <div className="flex-1 h-10 bg-[#E1E6F4] rounded-[10px]" />
          <div className="flex-1 h-10 bg-[#E1E6F4] rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
