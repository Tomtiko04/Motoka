import { Icon } from "@iconify/react";
import DocumentList from "./DocumentList";
import LicenseDoc from "./drivers license/licenseDoc";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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
            <Swiper
              spaceBetween={20}
              slidesPerView={1.2}
              centeredSlides={false}
              onSlideChange={(swiper) => onCarChange(swiper.activeIndex)}
              className="mb-6"
            >
              {cars.map((c, idx) => (
                <SwiperSlide key={c.id || idx}>
                  <div className={`flex items-center justify-between rounded-[10px] gap-6 px-4 py-2.5 transition-colors ${
                    car?.id === c.id ? "bg-[#45A1F2]" : "bg-[#F4F5FC]"
                  }`}>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xl font-semibold uppercase whitespace-nowrap ${
                        car?.id === c.id ? "text-white" : "text-[#05243F]"
                      }`}>
                        {c.plate_number || c.registration_no || "N/A"}
                      </h3>
                    </div>
                    <Icon 
                      icon="ion:car-sport-sharp" 
                      fontSize={24} 
                      color={car?.id === c.id ? "#ffffff" : "#05243F"} 
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

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