import Logo from "../assets/images/motoka logo.svg";
import { BsStars } from "react-icons/bs";

export default function Header() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-0">
        <header className="flex h-[3.3em] items-center justify-between bg-white">
          <div className="flex flex-row items-center justify-center gap-x-3">
            <img src={Logo} alt="Motoka" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-[#05243F]">Motoka</h1>
          </div>
          {/* <div>
            <button className="ai-button flex flex-row items-center justify-between gap-x-2 rounded-full px-4 py-2 text-white">
              <BsStars />
              <span className="text-base font-bold">MO'</span>
            </button>
          </div> */}
        </header>
      </div>
    </div>
  );
}
