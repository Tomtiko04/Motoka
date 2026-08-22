import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Action1 from "../../assets/images/landing/Group 1171279843.png";
import Action2 from "../../assets/images/landing/Group 1171279844.png";
import Action3 from "../../assets/images/landing/Group 1171279845.png";
import RenewModal from "./RenewModal";

export default function Action() {
  const navigate = useNavigate();
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  const actions = [
    {
      src: Action2,
      alt: "Renew your vehicle papers",
      onClick: () => setIsRenewModalOpen(true),
    },
    {
      src: Action3,
      alt: "Register your new car",
      onClick: () => navigate("/auth/signup"),
    },
    {
      src: Action1,
      alt: "Change Ownership",
      onClick: () => navigate("/auth/signup"),
    },
  ];

  return (
    <div className="bg-[#2389E3] mt-15 py-16 px-6">
      <h1 className="text-white text-5xl font-bold">What do you want to do now?</h1>

      <div className="grid gird-cols-1 sm:grid-cols-3 gap-3 py-12">
        {actions.map((action) => (
          <button
            key={action.alt}
            type="button"
            onClick={action.onClick}
            className="cursor-pointer overflow-hidden rounded-[20px] p-0 text-left transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <img src={action.src} alt={action.alt} className="w-full h-auto block" />
          </button>
        ))}
      </div>

      <RenewModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        initialPlateNumber=""
      />
    </div>
  );
}
