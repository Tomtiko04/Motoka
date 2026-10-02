import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import faqs from "../../Data/faqs";

// The same answers as the public help page, in the app's own chrome. Sending a
// signed-in user out to the marketing site to read them would drop them out of
// the app shell and hand them a page written for people who are not customers
// yet. Mo already rides along in AppLayout for anything not answered here.
export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const visible = term
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term),
      )
    : faqs;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#05243F]">
          FAQs &amp; help
        </h1>
        <p className="mt-1 text-sm text-[#05243F]/60">
          Answers to the questions we get most. Still stuck? Ask Mo — the chat
          button is at the bottom of the screen.
        </p>
      </header>

      <div className="mb-5 flex items-center rounded-full bg-[#ECEFF8] px-4 py-2.5">
        <Icon icon="solar:magnifer-linear" color="#2389E3" width="20" />
        <label htmlFor="faq-search" className="sr-only">
          Search the FAQs
        </label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions"
          className="ml-2 w-full bg-transparent text-base font-medium text-[#05243F]/70 outline-none placeholder:text-[#05243F]/30"
        />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl bg-[#F4F5FC] p-6 text-center">
          <p className="text-sm font-semibold text-[#05243F]">
            Nothing matches “{query}”
          </p>
          <p className="mt-1 text-sm text-[#05243F]/55">
            Ask Mo instead — it can answer questions this list does not cover.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((faq, i) => {
            const open = openIndex === i;
            return (
              <li
                key={faq.q}
                className="overflow-hidden rounded-2xl bg-[#F4F5FC]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  aria-expanded={open}
                  className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-[#05243F]">
                    {faq.q}
                  </span>
                  <Icon
                    icon="solar:alt-arrow-down-linear"
                    width="20"
                    className={`mt-0.5 shrink-0 text-[#05243F]/40 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-[#05243F]/70">
                    {faq.a}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 rounded-2xl border border-[#E4E9F2] p-4">
        <p className="text-sm font-semibold text-[#05243F]">
          Still need a person?
        </p>
        <p className="mt-1 text-sm text-[#05243F]/60">
          Traffic rules and penalties are in{" "}
          <Link
            to="/traffic-rules"
            className="font-semibold text-[#2389E3] underline"
          >
            Traffic Rules
          </Link>
          , or reach the team on WhatsApp at{" "}
          <a
            href="https://wa.me/2348128685978"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#2389E3] underline"
          >
            0812 868 5978
          </a>
          .
        </p>
      </div>
    </div>
  );
}
