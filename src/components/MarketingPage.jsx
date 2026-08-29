import { Link } from "react-router-dom";
import Seo from "./Seo";

export default function MarketingPage({
  title,
  description,
  path,
  children,
  ctaLabel,
  ctaTo,
}) {
  return (
    <section className="px-6 py-12 sm:px-10 sm:py-16">
      <Seo title={title} description={description} path={path} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[32px] font-bold leading-tight text-[#05243F] sm:text-[44px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 text-lg text-[#05203DB2]">{description}</p>
        ) : null}
        <div className="mt-10 space-y-8 text-base leading-7 text-[#05243F]/80">
          {children}
        </div>
        {ctaLabel && ctaTo ? (
          <Link
            to={ctaTo}
            className="mt-10 inline-flex rounded-[10px] bg-[#2389E3] px-6 py-3 text-base font-semibold text-white hover:bg-[#126cbb]"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
