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
  return (
    <div className="">
      {docType === "MyCar" ? (
        <div>
          <div className="mb-6">
            <div className="relative group w-fit">
              {/* Invisible select to handle switching functionality */}
              {cars.length > 1 && (
                <select
                  disabled={cars.length <= 1}
                  onChange={(e) => onCarChange(parseInt(e.target.value))}
                  value={cars.findIndex((c) => c.id === car?.id)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                >
                  {cars.map((c, idx) => (
                    <option key={c.id} value={idx}>
                      {c.plate_number || c.registration_no || "N/A"} - {c.vehicle_make}
                    </option>
                  ))}
                </select>
              )}
              
              <div className="flex items-center justify-between bg-[#45A1F2] rounded-[10px] w-fit gap-10 px-4 py-2.5 pe-10 hover:bg-[#1b6dbd] transition-all shadow-lg active:scale-95 group">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest">{car?.vehicle_make || "VEHICLE"}</p>
                    <h3 className="text-xl font-bold text-white uppercase whitespace-nowrap leading-tight">
                      {car?.plate_number || car?.registration_no || "NO PLATE"}
                    </h3>
                  </div>
                  {cars.length > 1 && (
                    <Icon icon="ri:arrow-down-s-fill" className="text-white mt-3 group-hover:rotate-180 transition-transform" />
                  )}
                </div>
                <div className="absolute right-3">
                  <Icon icon="ion:car-sport-sharp" fontSize={26} color="#ffffff" />
                </div>
              </div>
            </div>

            <div className="w-full flex items-end mt-4">
              <label
                htmlFor="year"
                className="block mb-2 text-sm font-medium text-gray-600 w-full"
              >
                Documents
              </label>
              <select
                name="year"
                className="h-fit text-gray-600 font-semibold text-sm rounded-lg block w-fit py-2.5 px-0 focus:outline-none bg-transparent cursor-pointer"
              >
                <option selected value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
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
        <LicenseDoc />
      )}
    </div>
  );
}

export default DocumentPage;