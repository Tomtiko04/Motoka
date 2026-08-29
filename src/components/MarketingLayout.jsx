import { Outlet } from "react-router-dom";
import Header from "../Landing/v2/Header";
import Footer from "../Landing/v2/Footer";
import useV2Chrome from "../Landing/v2/useV2Chrome";

export default function MarketingLayout() {
  useV2Chrome();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
