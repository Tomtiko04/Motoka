import { Icon } from "@iconify/react";
import drivers from "../../../assets/images/license-sample.png";
import good from "../../../assets/images/good.svg";
function LicenseDoc() {
    return ( 
        <div>
            <div className="w-full flex items-end">
                <label htmlFor="year" className="block mb-2 text-sm font-medium text-gray-600 w-full">Documents</label>
                <select name="year" id="" className="h-fit text-gray-600 text-base text-sm rounded-lg block w-fit py-2.5 px-0 focus:outline-none">
                    <option selected value="2025">2025</option>
                    <option  value="2024">2024</option>
                    <option  value="2023">2023</option>
                    <option  value="2022">2022</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-5 mt-4">
                <div
                    className={` rounded-[17px] relative overflow-hidden flex items-center h-[111px]`}
                >
                    <img src={drivers} alt='licence' className="absolute top-0 left-0 object-contain" />
                    <div className="relative bg-[#05243F]/61 h-full w-full z-10 p-4 flex flex-col justify-between">
                        <div className="w-[25px]">
                            <img src={good} alt="" className="object-none"/>
                        </div>
                        <p className="text-white text-[16px]">Drivers License</p>
                    </div>
                </div>
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

export default LicenseDoc;