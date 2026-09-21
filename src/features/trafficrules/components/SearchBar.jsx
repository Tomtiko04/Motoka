import { Search } from "lucide-react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative mb-1">
      <label htmlFor="traffic-search" className="sr-only">
        Search traffic offences
      </label>
      <div className="flex items-center rounded-full bg-[#ECEFF8] px-4 py-2.5">
        <Search color="#2389E3" size={20} className="mr-1" />
        <input
          id="traffic-search"
          type="search"
          placeholder="Search offences"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-1 w-full bg-transparent text-base font-medium text-[#05243F]/60 outline-none placeholder:text-[#05243F]/30"
        />
      </div>
    </div>
  );
}
