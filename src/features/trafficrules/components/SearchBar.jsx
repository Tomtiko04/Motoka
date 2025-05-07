import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch, searchTerm, setSearchTerm }) {
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="relative mb-1">
      <div className="flex items-center rounded-full bg-[#ECEFF8] px-4 py-2.5">
        <Search color="#2389E3" size={20} className="mr-1" />
        <input
          type="text"
          placeholder="search"
          value={searchTerm}
          onChange={handleChange}
          className="ml-1 w-full bg-transparent text-base font-medium text-[#05243F]/60 outline-none placeholder:text-[#05243F]/30 hover:bg-[#FDF6E8] focus:bg-[#FDF6E8]"
        />
      </div>
    </div>
  );
}
