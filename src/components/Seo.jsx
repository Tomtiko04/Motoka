import { Helmet } from "react-helmet";
import { absoluteUrl } from "../utils/site";

export default function Seo({
  title,
  description,
  path = "/",
  jsonLd,
}) {
  const url = absoluteUrl(path);
  const fullTitle = title.includes("Motoka") ? title : `${title} | Motoka`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:image" content={`${absoluteUrl("/icons/icon-512.png")}`} />
  {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(
            Array.isArray(jsonLd)
              ? { "@context": "https://schema.org", "@graph": jsonLd.map(({ "@context": _c, ...rest }) => rest) }
              : jsonLd,
          )}
        </script>
      ) : null}
    </Helmet>
  );
}
