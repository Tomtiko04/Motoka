import { useEffect } from "react";
import { absoluteUrl } from "../utils/site";

/**
 * Per-route document head.
 *
 * This used react-helmet 6.1.0, which does not work reliably on React 19.
 * Measured on the running app before this change: on client-side navigation —
 * how people actually move around a SPA — *no* route updated its title, every
 * one kept index.html's, and the canonical tag rendered on none of them. Only
 * a hard reload applied anything.
 *
 * Setting the tags in an effect is a few more lines than a Helmet tree, but it
 * has no version coupling to React and nothing to go stale. Tags this owns are
 * marked data-seo so repeat renders update in place instead of stacking.
 */

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("data-seo", "");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

export default function Seo({ title, description, path = "/", jsonLd }) {
  const url = absoluteUrl(path);
  const fullTitle = title
    ? title.includes("Motoka")
      ? title
      : `${title} | Motoka`
    : null;

  useEffect(() => {
    if (fullTitle) document.title = fullTitle;

    if (description) {
      upsertMeta('meta[name="description"]', {
        name: "description",
        content: description,
      });
      upsertMeta('meta[property="og:description"]', {
        property: "og:description",
        content: description,
      });
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("data-seo", "");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    if (fullTitle) {
      upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    }
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: absoluteUrl("/icons/icon-512.png"),
    });
  }, [fullTitle, description, url]);

  // Structured data is removed on unmount — unlike the tags above it is not
  // overwritten by the next route, so leaving it would attach one page's
  // schema to another.
  //
  // The sweep is for prerendering: a snapshot ships with its own block baked
  // in, and every route that is not prerendered boots from the homepage
  // snapshot, so without this the page ends up carrying two — the file's and
  // this route's.
  useEffect(() => {
    document.head
      .querySelectorAll('script[type="application/ld+json"][data-seo]')
      .forEach((el) => el.remove());

    if (!jsonLd) return undefined;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", "");
    script.textContent = JSON.stringify(
      Array.isArray(jsonLd)
        ? {
            "@context": "https://schema.org",
            "@graph": jsonLd.map(({ "@context": _c, ...rest }) => rest),
          }
        : jsonLd,
    );
    document.head.appendChild(script);

    return () => script.remove();
  }, [jsonLd]);

  return null;
}
