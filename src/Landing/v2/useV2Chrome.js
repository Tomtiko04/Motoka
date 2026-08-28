import { useEffect } from "react";

/**
 * Applies the base styles the v2 Header/Footer were designed against.
 *
 * The app's globals set body{font-size:1.6rem} and html,body{overflow-x:hidden}.
 * The first makes anything that inherits its size render ~1.6x too large; the
 * second turns body into a scroll container, which silently breaks any
 * position:sticky inside. Both are switched off only while v2 chrome is
 * mounted, then restored.
 *
 * `landing` additionally applies the landing's own canvas — white background
 * and the prototype's 1.1 zoom — which the marketing and blog pages must not
 * inherit.
 */
export default function useV2Chrome({ landing = false } = {}) {
  useEffect(() => {
    const { documentElement: html, body } = document;
    html.classList.add("motoka-v2-chrome");
    body.classList.add("motoka-v2-chrome");
    if (landing) body.classList.add("landing-v2-active");

    return () => {
      html.classList.remove("motoka-v2-chrome");
      body.classList.remove("motoka-v2-chrome");
      body.classList.remove("landing-v2-active");
    };
  }, [landing]);
}
