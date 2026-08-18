import { Outlet } from "react-router-dom";
import Header from "../Landing/components/Header";
import Footer from "../Landing/components/Footer";

export default function MarketingLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#EBF5FF]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
