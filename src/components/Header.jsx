import Logo from "../assets/images/motoka logo.svg";
import { BsStars } from "react-icons/bs";

export default function Header() {
  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="flex h-[3.3em] items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Motoka" className="h-8 w-auto" />
            <h1 className="text-lg font-bold text-[#05243F]">Motoka</h1>
          </div>
          <button className="ai-button flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white">
            <BsStars />
            <span>MO'</span>
          </button>
        </header>
      </div>
    </div>
  );
}
