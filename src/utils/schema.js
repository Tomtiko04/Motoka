import { absoluteUrl } from "./site";

// Schema.org fragments for the marketing pages. Only the types Google actually
// surfaces rich results for — a generic WebPage on every route earns nothing
// and just adds weight to the head.
//
// Seo wraps an array into an @graph and strips any nested @context, so nothing
// here carries its own.

const PUBLISHER = {
  "@type": "Organization",
  name: "Motoka",
  url: absoluteUrl("/"),
};

export const ORGANIZATION = {
  ...PUBLISHER,
  logo: absoluteUrl("/icons/icon-512.png"),
  areaServed: "NG",
  description:
    "Motoka renews vehicle licences, insurance, roadworthiness and driver's licences online in Nigeria through a licensed, MVAA-certified agent network.",
};

export const WEBSITE = {
  "@type": "WebSite",
  name: "Motoka",
  url: absoluteUrl("/"),
  publisher: PUBLISHER,
};

// faqs are ServicePageTemplate's { q, a } pairs.
export function faqSchema(faqs) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

// steps are ServicePageTemplate's { title, description } pairs.
export function howToSchema({ name, description, path, steps }) {
  return {
    "@type": "HowTo",
    name,
    description,
    url: absoluteUrl(path),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };
}

export function blogPostingSchema({ title, description, path, date, image }) {
  // Posts carry a display date like "Mar 20, 2026". Anything Date cannot read
  // is left off rather than emitted as an invalid datePublished.
  const published = new Date(date);
  const dated = date && !Number.isNaN(published.getTime());

  return {
    "@type": "BlogPosting",
    headline: title,
    description,
    url: absoluteUrl(path),
    ...(dated ? { datePublished: published.toISOString().slice(0, 10) } : {}),
    ...(image ? { image: absoluteUrl(image) } : {}),
    publisher: PUBLISHER,
  };
}
