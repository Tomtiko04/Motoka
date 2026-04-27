import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { Icon } from "@iconify/react";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  handleSearch,
  selectedCar,
  setSelectedCar,
  garageCars = [],
}) {
  const [carDropdownOpen, setCarDropdownOpen] = useState(false);
  const [carFilterSearch, setCarFilterSearch] = useState("");
  const dropdownRef = useRef(null);

  // Filter cars based on search input
  const filteredCars = garageCars.filter((car) => {
    const searchLower = carFilterSearch.toLowerCase();
    return (
      car.vehicle_make?.toLowerCase().includes(searchLower) ||
      car.vehicle_model?.toLowerCase().includes(searchLower) ||
      car.vehicle_year?.toString().includes(searchLower) ||
      car.registration_no?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCarDropdownOpen(false);
        setCarFilterSearch("");
      }
    }
    if (carDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [carDropdownOpen]);

  function onKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  function clearSearch() {
    setSearchTerm("");
    handleSearch("");
  }

  function handleAskMo() {
    const carLabel = selectedCar
      ? `${selectedCar.vehicle_make || ""} ${selectedCar.vehicle_model || ""} ${selectedCar.vehicle_year || ""}`.trim()
      : null;

    const prefill = carLabel
      ? `Help me choose the right parts for my ${carLabel}.`
      : "Help me choose the right parts to buy.";

    window.dispatchEvent(
      new CustomEvent("motoka:open-mo", {
        detail: { prefill },
      })
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Top row: Search input + car selector + Ask Mo */}
      <div className="flex items-center gap-3">
        {/* Search Input with embedded button */}
        <div className="relative flex flex-1 items-center bg-[#F0F4F8] rounded-full p-1 border border-transparent focus-within:bg-white focus-within:border-[#46A2EC] transition-all">
          <Search className="absolute left-5 text-[#8A9EB0] pointer-events-none" size={18} />
          <input
            type="text"
            placeholder="Search brake pads, filters, tyres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent py-3 pl-12 pr-28 text-[14px] text-[#05243F] placeholder:text-[#B3BCC5] outline-none"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-[96px] p-1 rounded-full text-[#8A9EB0] hover:text-[#05243F] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => handleSearch()}
            className="absolute right-1 w-[84px] h-[calc(100%-8px)] rounded-full bg-[#46A2EC] hover:bg-[#2389E3] text-white text-[13px] font-bold transition-colors flex items-center justify-center cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Car filter button */}
        {garageCars.length > 0 && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                setCarDropdownOpen((v) => !v);
                if (!carDropdownOpen) setCarFilterSearch("");
              }}
              className={`flex items-center gap-2 flex-shrink-0 rounded-full px-3 sm:px-4 py-3 text-[13px] font-semibold border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                selectedCar
                  ? "bg-[#2389E3]/8 text-[#2389E3] border-[#2389E3]/30"
                  : "bg-white text-[#05243F] border-[#E1E6F4] hover:border-[#C4CDD5]"
              }`}
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded-lg flex-shrink-0 text-[12px] ${
                selectedCar ? "bg-[#2389E3] text-white" : "bg-[#F4F5FC] text-[#697C8C]"
              }`}>
                <Icon icon="ion:car-sport-sharp" fontSize={14} />
              </div>

              {selectedCar ? (
                <>
                  <span className="sm:hidden flex-shrink-0 text-[11px]">
                    {selectedCar.vehicle_make?.substring(0, 3)}
                  </span>
                  <span className="hidden sm:inline flex-shrink-0">
                    {selectedCar.vehicle_make}
                  </span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Select</span>
                  <span className="hidden sm:inline flex-shrink-0">
                    Select a car
                  </span>
                </>
              )}

              <ChevronDown
                size={14}
                className={`flex-shrink-0 text-[#697C8C] transition-transform duration-200 ${carDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Car Dropdown */}
            {carDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[380px] w-80 border border-[#E1E6F4]">
                <div className="px-4 py-3 flex-shrink-0">
                  <p className="text-[11px] font-bold text-[#697C8C] uppercase tracking-wider">
                    My Garage {garageCars.length > 0 && <span className="text-[#2389E3]">({garageCars.length})</span>}
                  </p>
                </div>

                {/* Car filter search — visible when 4+ cars */}
                {garageCars.length >= 4 && (
                  <div className="px-3 py-2.5 flex-shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#697C8C]" size={15} />
                      <input
                        type="text"
                        placeholder="Find your car..."
                        value={carFilterSearch}
                        onChange={(e) => setCarFilterSearch(e.target.value)}
                        className="w-full rounded-xl bg-[#F8FAFD] py-2.5 pl-9 pr-3 text-[12px] text-[#05243F] placeholder:text-[#05243F]/40 outline-none transition-all focus:bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}

                {/* All Parts option */}
                <button
                  onClick={() => { setSelectedCar(null); setCarDropdownOpen(false); setCarFilterSearch(""); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors cursor-pointer flex-shrink-0 ${
                    !selectedCar ? "bg-[#F4F5FC]" : "hover:bg-[#F9FAFC]"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !selectedCar ? "bg-[#2389E3] text-white" : "bg-[#F4F5FC] text-[#697C8C]"
                  }`}>
                    <Icon icon="solar:widget-bold" width="16" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold ${!selectedCar ? "text-[#2389E3]" : "text-[#05243F]"}`}>All Parts</p>
                    <p className="text-[11px] text-[#697C8C]">Show everything</p>
                  </div>
                  {!selectedCar && <Check size={16} className="text-[#2389E3] flex-shrink-0" />}
                </button>

                {/* Cars list — scrollable */}
                <div className="overflow-y-auto flex-1 min-h-0">
                  {filteredCars.length > 0 ? (
                    filteredCars.map((car) => {
                      const isActive = selectedCar?.registration_no === car.registration_no;
                      return (
                        <button
                          key={car.registration_no}
                          onClick={() => { setSelectedCar(car); setCarDropdownOpen(false); setCarFilterSearch(""); }}
                          className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors cursor-pointer hover:bg-[#F9FAFC] ${
                            isActive ? "bg-[#2389E3]/5" : ""
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                            isActive ? "bg-[#2389E3] text-white" : "bg-[#F4F5FC] text-[#697C8C]"
                          }`}>
                            <Icon icon="ion:car-sport-sharp" fontSize={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-semibold truncate ${isActive ? "text-[#2389E3]" : "text-[#05243F]"}`}>
                              {car.vehicle_make} {car.vehicle_model}
                            </p>
                            <p className="text-[11px] text-[#697C8C]">
                              {car.vehicle_year ? `${car.vehicle_year}` : ""}{car.registration_no ? ` · ${car.registration_no}` : ""}
                            </p>
                          </div>
                          {isActive && <Check size={16} className="text-[#2389E3] flex-shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[12px] text-[#697C8C]">No cars match your search</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ask Mo button */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="text-[12px] text-[#8A9EB0] whitespace-nowrap">Don&apos;t know what to buy?</span>
          <button
            type="button"
            onClick={handleAskMo}
            className="flex items-center gap-1.5 rounded-full bg-[#EBB850] px-4 py-2.5 text-[13px] font-bold text-[#05243F] hover:bg-[#d8a93f] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Icon icon="solar:stars-minimalistic-bold" width="15" />
            Ask Mo
          </button>
        </div>
      </div>
    </div>
  );
}
