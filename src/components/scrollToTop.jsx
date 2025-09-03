import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = (props) => {
 const { pathname } = useLocation();

 useLayoutEffect(() => {
   if ("scrollRestoration" in window.history) {
     window.history.scrollRestoration = "manual";
   }

   window.scrollTo({ top: 0, behavior: "smooth" });

   return () => {
     window.history.scrollRestoration = "auto";
   };
 }, [pathname]);

 return null;
};

export default ScrollToTop;
