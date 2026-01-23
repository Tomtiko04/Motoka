import { Icon } from "@iconify/react";
import DocumentList from "./DocumentList";
import LicenseDoc from "./drivers license/licenseDoc";
function DocumentPage({selectedDocument, setSelectedDocument,docType,showsidebar, setShowsidebar}) {
    // const cars = userData[0]?.carDetails[0];
    // const imageUrl=`https://www.carlogos.org/car-logos/${cars?.vehicle_make?.toLowerCase()}-logo.png`
    return ( 
        <div className="">
                
                {/* <li className="flex ites-center w-fit">
                    <img src={imageUrl} alt={cars?.vehicle_make} className="h-6 w-6 object-contain border"/>
                    {cars?.plate_number}
                </li> */}
                {docType === "MyCar" ? (
                    <div>
                        <div>
                          <div className="flex items-center justify-between bg-[#45A1F2] rounded-[10px] w-fit gap-10 px-4 py-2.5 pe-6 hover:bg-[#1b6dbd]">
                          <div className="flex items-center gap-2">
                            <div className="">
                              {/* <img
                                src={"https://www.carlogos.org/car-logos/mercedes-benz-logo.png"}
                                lazyloading="lazy"
                                alt={"Car"}
                                className="h-6 w-6 object-contain"
                                // onError={() => setCarLogo(MercedesLogo)}
                              /> */}
                            </div>
                            <h3 className="text-xl font-semibold text-white">
                              {"ABC-123DE"}
                            </h3>
                          </div>
                          <div>
                            <Icon icon="ion:car-sport-sharp" fontSize={30} color="#ffffff" />
                          </div>
                        </div>
                            <div className="w-full flex items-end">
                                <label htmlFor="year" className="block mb-2 text-sm font-medium text-gray-600 w-full">Documents</label>
                                <select name="year" id="" className="h-fit text-gray-600 text-base text-sm rounded-lg block w-fit py-2.5 px-0 focus:outline-none">
                                    <option selected value="2025">2025</option>
                                    <option  value="2024">2024</option>
                                    <option  value="2023">2023</option>
                                    <option  value="2022">2022</option>
                                </select>
                            </div>

                        </div>
                        <DocumentList
                            selectedDocument={selectedDocument}
                            setSelectedDocument={setSelectedDocument} 
                            showsidebar={showsidebar}
                            setShowsidebar={setShowsidebar} 
                        />
                    </div>
                    ):(
                        <LicenseDoc/>

                )}
        </div>
     );
}

export default DocumentPage;