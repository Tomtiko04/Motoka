import { Outlet } from "react-router-dom";
import Header from "../Landing/v2/Header";
import Footer from "../Landing/v2/Footer";
import useV2Chrome from "../Landing/v2/useV2Chrome";

/**
 * Blog pages used to ship their own header — a third nav ("Landing / Blogs /
 * Login-Signup" plus a dead "Get Started" button) that matched neither the
 * landing nor the other marketing pages. It now shares the same chrome as
 * everything else public-facing.
 */
export default function BlogLayout() {
  useV2Chrome();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex flex-grow flex-col w-full px-0 mt-6 sm:mt-16 sm:items-center sm:justify-center sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
