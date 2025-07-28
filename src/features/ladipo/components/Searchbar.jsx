import { useState } from "react";
import { Search } from "lucide-react";
import { Icon } from "@iconify/react";
export default function SearchBar({ onSearch, searchTerm, setSearchTerm, handleSearch}) {
  return (
    <div className="flex items-center gap-2 w-full overflow-hidden">
      <div className="flex w-full items-center gap-2 rounded-full bg-[#E9EDF6] p-1 ps-4 text-[13px] flex-1">
        <Search className="text-[#45A1F2]" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none outline-0 flex-1"
        />
        <button onClick={handleSearch} className="rounded-full bg-[#45A1F2] hover:bg-[#4582f2] px-4 py-2 text-white hidden sm:block">
          Search
        </button>
      </div>
      <div className="h-full rounded-full border-2 border-[#E1E6F4] px-8 py-3">
        <Icon
          icon="rivet-icons:filter-solid"
          width="21"
          height="21"
          className="text-[#45A1F2]"
        />
      </div>
    </div>
  );
}
