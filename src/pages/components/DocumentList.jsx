import { useState } from "react";
import Licencesample from "../../assets/images/052ff265aad5faf623af5bf39cc0e610d17a8ae1.png";
import good from "../../assets/images/good.svg";
import warning from "../../assets/images/warning.svg";
import Licensesample2 from "../../assets/images/6fe45ed589cd8efebdda471557ad5d41b9a94c27.png"
import { Icon } from "@iconify/react";
const categories=[
        {
            key: "VehicleLicense",
            title: "Vehicle License",
            image: Licencesample,
            status: good,
        },
        {
            key: "RoadWorthiness",
            title: "Road Worthiness",
            image: Licensesample2,
            status: warning
        },
        {
            key: "VehicleLicense2",
            title: "Vehicle License",
            image: Licencesample,
            status: good
        },
        {
            key: "RoadWorthiness2",
            title: "Road Worthiness",
            image: Licensesample2,
            status: warning
        }
    ]
function DocumentList({selectedDocument, setSelectedDocument,showsidebar, setShowsidebar}) {
    return ( 
        <div>
            <div className="grid grid-cols-2 gap-5 ">
        {categories.map((doc) => (        
            <div
                onClick={() => {
                    setSelectedDocument(doc.key)
                    setShowsidebar(false)
                }}
                className={` rounded-[17px] relative overflow-hidden h-[111px] flex items-center ${selectedDocument === doc.key? " border-[#EBB850] border-3": ""}`}
                key={doc.key}
             >
                    <img src={doc.image} alt='licence' className="absolute top-0 left-0 object-contain" />
                    <div className="relative bg-[#05243F]/61 h-full w-full z-10 p-4 flex flex-col justify-between">
                        <div className="w-[25px]">
                            <img src={doc.status} alt="" className="object-none"/>
                        </div>
                        <p className="text-white text-[15px]">{doc.title}</p>
                    </div>
                </div>
        ))}
      {/* </div> */}
                <div className="bg-[#eaecf3] rounded-[17px] relative overflow-hidden h-[111px] flex items-center">
                    <div className="relative h-full w-full z-10 p-4 flex flex-col justify-between">
                        <div className="w-[25px] bg-[#D2E2F0] rounded-[10px]">
                            <Icon icon="lets-icons:add-round" fontSize={24} color="#2284DB" />
                        </div>
                        <p className="text-black text-[16px]">Add Documents</p>
                    </div>
                </div>
            </div>
        </div>
     );
}

export default DocumentList;