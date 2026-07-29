// import React, { useState } from "react";
// import { Icon } from "@iconify/react";
// import { formatCurrency } from "../utils/formatCurrency";

// export default function WelcomeSection({ userName }) {
//   const [showBalance, setShowBalance] = useState(true);
//   const balance = 234098;

//   return (
//     <div className="mb-6 flex gap-4 sm:mb-8 flex-row items-center justify-between">
//       <div>
//         <div className="mt-0.5 flex flex-col gap-1 sm:mt-0 md:mt-4">
//           <h1 className="text-base font-medium text-[#05243F]/40 sm:text-sm">
//             Welcome
//           </h1>
//           <div className="flex items-center gap-2">
//             <h1 className="text-2xl font-medium text-[#05243F] sm:text-3xl">
//               {userName}
//             </h1>
//             <span
//               role="img"
//               aria-label="wave"
//               className="transform transition-transform duration-300 hover:scale-110 cursor-pointer"
//             >
//               <Icon icon="mdi:hand-wave" fontSize={28} color="#B18378" />
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center gap-2 sm:gap-4">
//         <span className="text-base hidden font-normal text-[#05243F]/44 sm:text-sm sm:block">
//           Wallet Balance
//         </span>
//         <div className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 sm:gap-3 sm:px-4 sm:py-2">
//           <span>
//             {showBalance ? (
//               <Icon
//                 icon="mingcute:eye-fill"
//                 fontSize={24}
//                 color="#697C8C"
//                 onClick={() => setShowBalance(!showBalance)}
//               />
//             ) : (
//               <Icon
//                 icon="majesticons:eye-off"
//                 fontSize={24}
//                 color="#697C8C"
//                 onClick={() => setShowBalance(!showBalance)}
//               />
//             )}
//           </span>
//           <span className="text-lg font-semibold text-[#2389E3] sm:text-base">
//             {showBalance ? (
//               formatCurrency(balance)
//             ) : (
//               <Icon
//                 icon="mdi:shield-lock-outline"
//                 fontSize={24}
//                 color="#2389E3"
//               />
//             )}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "../utils/formatCurrency";
import { getWallet } from "../services/apiWallet";

export default function WelcomeSection({ userName }) {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(() => {
    const savedState = localStorage.getItem("showBalance");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const { data: wallet } = useQuery({ queryKey: ["wallet"], queryFn: getWallet });
  const balance = wallet ? Number(wallet.balance_kobo || 0) / 100 : 0;

  useEffect(() => {
    localStorage.setItem("showBalance", JSON.stringify(showBalance));
  }, [showBalance]);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
      <div>
        <div className="mt-0.5 flex flex-col gap-1 sm:mt-0 md:mt-4">
          <h1 className="text-base font-medium text-[#05243F]/40 sm:text-sm">
            Welcome
          </h1>
          <div className="flex items-center gap-2">
            <h1 className="max-w-[150px] truncate text-2xl font-medium text-[#05243F] sm:max-w-[200px] sm:text-3xl">
              {userName}
            </h1>
            <span
              role="img"
              aria-label="wave"
              className="transform cursor-pointer transition-transform duration-300 hover:scale-110"
            >
              <Icon icon="mdi:hand-wave" fontSize={28} color="#B18378" />
            </span>
          </div>
        </div>
      </div>

      {/* Wallet balance pill → tap to open the wallet */}
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-base font-normal text-[#05243F]/44 sm:block sm:text-sm">
          Wallet Balance
        </span>
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm sm:gap-3 sm:px-4 sm:py-2">
          <button
            type="button"
            aria-label={showBalance ? "Hide balance" : "Show balance"}
            onClick={() => setShowBalance((s) => !s)}
            className="flex items-center"
          >
            {showBalance ? (
              <Icon icon="mingcute:eye-fill" fontSize={20} color="#697C8C" />
            ) : (
              <Icon icon="majesticons:eye-off" fontSize={20} color="#697C8C" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/wallet")}
            className="text-lg font-semibold text-[#2389E3] transition-opacity duration-300 ease-in-out hover:opacity-80 sm:text-base"
          >
            {showBalance ? (
              formatCurrency(balance)
            ) : (
              <Icon icon="mdi:shield-lock-outline" fontSize={20} color="#2389E3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
