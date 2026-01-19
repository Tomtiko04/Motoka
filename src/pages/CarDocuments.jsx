import React, { useState } from "react";
import PagesLayout from "./components/PageLayout";
import DocumentsNav from "../components/DocumentsNav";
import DocumentPage from "./components/DocumentPage";
import DocumentList from "./components/DocumentList";
import DocPreview from "./components/Docpreview";

function CarDocuments() {
  const [selectedDocument, setSelectedDocument] = useState("VehicleLicense");
  const [docType, setDocType] = useState("MyCar");
  const [showsidebar, setShowsidebar] = useState(true);
  const onMyCarClick=()=> setDocType("MyCar");
  const onDriverLicenseClick=()=> setDocType("DriversLicense");
    // const [filteredDocument, setFilteredDocument] = useState(
    //   userData.CarDocuments,
    // );
    return ( 
        <div className="px-0 sm:px-6 lg:px-8 h-full pb-5">
            <PagesLayout
                title="Car Documents"
                subTitle="This is where you find all your vehicle papers e.g Vehicle License, Road worthiness and so on. "
                // mainContentTitle="Car Documents Overview"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 rounded-[20px] overflow-hidden relative">
                {/* side 1 */}
                <div className="flex-1 px-4 sm:px-8  pt-6 pb-10 bg-[linear-gradient(90deg,_rgba(255,255,255,0)_25.17%,_rgba(115,115,115,0.1)_128.52%)]  overflow-hidden h-full w-full absolute z-9 sm:relative">
                  <DocumentsNav
                    setDocType={setDocType} 
                    docType={docType}
                    onMyCarClick={onMyCarClick}
                    onDriverLicenseClick={onDriverLicenseClick}/>
                  <DocumentPage 
                    selectedDocument={selectedDocument}
                    setSelectedDocument={setSelectedDocument}
                    docType={docType}
                    activeTab={docType}
                    showsidebar={showsidebar}
                    setShowsidebar={setShowsidebar}
                  />
                </div>
                {/* side 2 */}
                <div className={`flex-1 px-4 sm:px-6 bg-[#F9FAFC] pt-6 pb-6 ${showsidebar? "w-0 overflow-hidden relative -z-10":"w-full z-300 flex overflow-hidden"} sm:z-10  sm:w-full`}>
                  <DocPreview 
                  selectedDocument={selectedDocument}
                  docType={docType}
                  setShowsidebar={setShowsidebar}
                  />
                </div>
              </div>
            </PagesLayout>
        </div>
     );
}

export default CarDocuments;