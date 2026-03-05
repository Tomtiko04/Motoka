import React, { useRef } from "react";
import { Icon } from "@iconify/react";
import DocumentList from "./DocumentList";
import LicenseDoc from "./drivers license/licenseDoc";

function DocumentPage({
  selectedDocument,
  setSelectedDocument,
  docType,
  showsidebar,
  setShowsidebar,
  car,
  cars = [],
  onCarChange,
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="">
      {docType === "MyCar" ? (
        <div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
               <label className="block text-sm font-medium text-gray-600">
                Select Vehicle
              </label>
              <div className="flex items-center rounded-full bg-white border border-gray-100 overflow-hidden">
                <button
                  onClick={() => scroll("left")}
                  className="flex h-8 w-8 items-center justify-center hover:bg-[#F4F5FC] transition-colors border-r border-gray-50"
                  aria-label="Scroll left"
                >
                  <Icon icon="lucide:chevron-left" fontSize={18} color="#05243F" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="flex h-8 w-8 items-center justify-center hover:bg-[#F4F5FC] transition-colors"
                  aria-label="Scroll right"
                >
                  <Icon icon="lucide:chevron-right" fontSize={18} color="#05243F" />
                </button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth -mx-4 sm:-mx-8 px-4 sm:px-8"
            >
              {cars.map((c, idx) => (
                <div
                  key={c.id || idx}
                  onClick={() => onCarChange(idx)}
                  className={`flex flex-shrink-0 cursor-pointer items-center justify-between rounded-[10px] w-[calc(50%-5px)] min-w-[140px] gap-2 px-3 py-2.5 transition-all shadow-sm ${
                    car?.id === c.id 
                      ? "bg-[#45A1F2] text-white scale-[1.02]" 
                      : "bg-[#F4F5FC] text-[#05243F] hover:bg-[#e8ebf5]"
                  }`}
                >
                  <div className="flex flex-col">
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${
                      car?.id === c.id ? "text-white/60" : "text-[#05243F]/40"
                    }`}>
                      {c.vehicle_make || "Vehicle"}
                    </p>
                    <h3 className="text-base font-bold uppercase whitespace-nowrap leading-tight">
                      {c.plate_number || c.registration_no || "N/A"}
                    </h3>
                  </div>
                  <Icon 
                    icon="ion:car-sport-sharp" 
                    fontSize={20} 
                    color={car?.id === c.id ? "#ffffff" : "#2389E3"} 
                  />
                </div>
              ))}
            </div>

            <div className="w-full flex items-end mt-2">
              <label
                htmlFor="year"
                className="block mb-2 text-sm font-medium text-gray-600 w-full"
              >
                Documents
              </label>
              {/* <select
                name="year"
                className="h-fit text-gray-600 font-semibold text-sm rounded-lg block w-fit py-2.5 px-0 focus:outline-none bg-transparent cursor-pointer"
              >
                <option selected value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select> */}
            </div>
          </div>
          <DocumentList
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            showsidebar={showsidebar}
            setShowsidebar={setShowsidebar}
            car={car}
          />
        </div>
      ) : (
        <LicenseDoc
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          showsidebar={showsidebar}
          setShowsidebar={setShowsidebar}
        />
      )}
    </div>
  );
}

export default DocumentPage;