import { Outlet } from "react-router-dom";
import Header from "../Landing/v2/Header";
import Footer from "../Landing/v2/Footer";
import useV2Chrome from "../Landing/v2/useV2Chrome";
import ChatWidget from "../Landing/v2/ChatWidget";

export default function MarketingLayout() {
  useV2Chrome();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Mo rides along on the marketing pages so /faq can answer the
          questions the FAQ list does not. LandingV2 mounts its own and sits
          outside this layout, so there is no double widget on the homepage. */}
      <ChatWidget />
    </div>
  );
}
