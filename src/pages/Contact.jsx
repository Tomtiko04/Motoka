import { Helmet } from "react-helmet";

export default function Contact() {
  return (
    <section className="px-6 py-12 sm:px-10 sm:py-16">
      <Helmet>
        <title>Contact Us | Motoka</title>
        <meta
          name="description"
          content="Reach Motoka on Instagram, X, and TikTok."
        />
      </Helmet>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[32px] font-bold leading-tight text-[#05243F] sm:text-[44px]">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-[#05203DB2]">
          Questions about a renewal, an order, or the app — message us on
          social.
        </p>

        <div className="mt-10 rounded-[20px] bg-white p-6 sm:p-8">
          <p className="text-sm font-medium text-[#05243F]">Message us on</p>
          <div className="mt-4 flex flex-col gap-3 text-lg font-semibold text-[#2389E3]">
            <a href="https://www.instagram.com/trymotoka" target="_blank" rel="noreferrer" className="hover:underline">
              Instagram — @trymotoka
            </a>
            <a href="https://x.com/trymotoka" target="_blank" rel="noreferrer" className="hover:underline">
              X — @trymotoka
            </a>
            <a href="https://www.tiktok.com/@trymotoka1" target="_blank" rel="noreferrer" className="hover:underline">
              TikTok — @trymotoka1
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
