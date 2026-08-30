import { useEffect } from "react";
import { absoluteUrl } from "../../utils/site";

/**
 * Sets title, description and canonical directly on the document.
 *
 * The app's <Seo> component uses react-helmet 6.1.0, which is unreliable on
 * React 19 — measured on the running app, /blogs got its title but /contact
 * silently kept index.html's, and the canonical tag rendered on neither. These
 * pages exist to rank, so they can't depend on that.
 *
 * Ported from the prototype's own useSeoHead for the same reason. No
 * dependency, nothing to go stale, and it cleans up nothing on unmount
 * because the next route overwrites the same three tags.
 */
export default function useSeoHead(title, description, path) {
  useEffect(() => {
    if (title) {
      document.title = title.includes("Motoka") ? title : `${title} | Motoka`;
    }

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }

    if (path) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", absoluteUrl(path));
    }
  }, [title, description, path]);
}
