import PageLayout from "./components/LadipoLayout";
import Product from '../../assets/images/3f7adbdd7c0244bc472649798d8b21efd639cdc8.png'
import { Icon } from "@iconify/react";
import { useState } from "react";
function CartPage() {
  const[count,setCount]=useState(1);
          const increment = () => {
          setCount(count + 1);
        };

        const decrement = () => {
          if (count > 1) { // Optional: prevent negative counts
            setCount(count - 1);
          }
        };

        const reset = () => { // Optional: reset to initial value
          setCount(1);
        };
  return (
      <PageLayout
        title="Add To Cart"
        
      >
    <div className="flex flex-col items-center">
        <div className="px-6 flex items-center justify-between w-full">
        <div className=" flex items-center gap-6">
          <div className=" border-[0.4px] border-[#E8E9EB] rounded-[5px] w-[86px]">
         <img src={Product} alt="" />
         </div>
          <div>
            <h3 className="text-[16px] font-[600] text-[#05243F] ">Michelin Pilot Sport 4S</h3>
            <p className="text-[14px] font-[400] text-[#000]">265/55r20 Tyre</p>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <p className="text-[20px] font-[600] text-[#2284DB]">N2 Trillion</p>
            <div className="flex items-center gap-3">
            <button
              onClick={decrement}
              className=" w-[30px] h-[30px] bg-[#D3D9DE] text-white rounded-[10px] hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <Icon icon="heroicons-outline:minus-sm" width="24" height="24" />
            </button>
          <p className="text-[24px] font-bold">{count}</p>
            <button
              onClick={increment}
              className=" w-[30px] h-[30px] bg-[#2284DB] text-white rounded-[10px] hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <Icon icon="heroicons-outline:plus-sm" width="24" height="24" />
            </button>
        </div>
          <div><Icon icon="ri:delete-bin-6-fill" width="24" height="24" className="text-[#940E0E]" /></div>
        </div>
        </div>
        <div className="text-[16px] text-white font-[400] w-full flex bg-[#EBB850] py-4 px-4 rounded-[10px] justify-between my-5">
          <p className="">Sub Total </p>
          <p>2 Trillion</p>
        </div>
        <button className="bg-[#2284DB] px-30 py-3 text-[16px]  rounded-full text-white fonot-[600]">Checkout</button>
    </div>
      </PageLayout>
  );
}

export default CartPage;
