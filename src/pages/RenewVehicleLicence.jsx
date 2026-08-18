import { Link } from "react-router-dom";
import PlateRenewCta from "../components/PlateRenewCta";
import Seo from "../components/Seo";
import { absoluteUrl } from "../utils/site";

const PATH = "/renew-vehicle-licence";
const TITLE = "How to renew a vehicle licence online in Nigeria";
const DESCRIPTION =
  "Renew your vehicle licence and papers online in Nigeria. Enter your plate number, pay, and Motoka processes the documents. Works as a guest — no account required.";

const STEPS = [
  {
    name: "Enter your plate number",
    text: "Type the plate on this page. Motoka looks up the vehicle so you can confirm it is the right car.",
  },
  {
    name: "Choose the papers to renew",
    text: "Pick vehicle licence and any other documents due (for example roadworthiness or insurance, depending on what you need). You will see the amount before you pay.",
  },
  {
    name: "Pay online",
    text: "Pay with the checkout Motoka shows you. You can do this without creating an account first (guest renewal).",
  },
  {
    name: "We process the papers",
    text: "Our team handles the renewal. Track the order until it is complete, then keep the new expiry on Motoka so reminders fire next year.",
  },
];

const FAQS = [
  {
    question: "Can I renew my vehicle licence online in Nigeria?",
    answer:
      "Yes. On Motoka you enter your plate number, choose the documents, and pay online. Motoka is a private processor — we complete the paperwork for you. We are not the FRSC or a state licensing office.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Guest renewal starts from this page or the homepage. After payment you can sign up if you want reminders and a digital copy of the car on Motoka.",
  },
  {
    question: "How much does vehicle licence renewal cost?",
    answer:
      "Fees depend on the document, vehicle, and state of renewal. Motoka shows the quote in checkout after you enter the plate and select items. We do not publish a single nationwide price because it would be wrong for many cars.",
  },
  {
    question: "Does this work in Lagos and other states?",
    answer:
      "Yes. During checkout you choose the state of renewal. Lagos, Ogun, FCT and other states are part of the same flow.",
  },
  {
    question: "What if my papers have already expired?",
    answer:
      "You can still start a renewal. Motoka does not cancel a fine or impound already issued by the authorities. Renew as soon as you can and keep digital copies on your phone.",
  },
  {
    question: "Is Motoka the official FRSC portal?",
    answer:
      "No. The Federal Road Safety Corps and state motor registries remain the statutory bodies. Motoka is an independent service that submits and follows up your renewal so you do not have to queue.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    step: STEPS.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Vehicle licence renewal",
    provider: {
      "@type": "Organization",
      name: "Motoka",
      url: absoluteUrl("/"),
    },
    areaServed: "NG",
    serviceType: "Vehicle document renewal",
    url: absoluteUrl(PATH),
  },
];

export default function RenewVehicleLicence() {
  return (
    <article className="px-6 py-12 sm:px-10 sm:py-16">
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2389E3]">
          Vehicle documents
        </p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight text-[#05243F] sm:text-[44px]">
          {TITLE}
        </h1>
        <p className="mt-4 text-lg text-[#05203DB2]">{DESCRIPTION}</p>

        <div className="mt-8 rounded-[20px] bg-white p-5 sm:p-6">
          <p className="mb-3 text-sm font-medium text-[#05243F]">
            Start with your plate number
          </p>
          <PlateRenewCta />
        </div>

        <div className="mt-12 space-y-8 text-base leading-7 text-[#05243F]/80">
          <section>
            <h2 className="mb-3 text-xl font-bold text-[#05243F]">
              What you are renewing
            </h2>
            <p>
              A private car in Nigeria typically needs a current vehicle
              licence. Many owners also renew roadworthiness and insurance in
              the same sitting so they are not stopped with one valid paper and
              one expired. Exact requirements depend on your state and whether
              the vehicle is private or commercial.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-[#05243F]">
              How to renew online with Motoka
            </h2>
            <ol className="space-y-5">
              {STEPS.map((step, index) => (
                <li key={step.name} className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2389E3] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#05243F]">{step.name}</h3>
                    <p className="mt-1">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[#05243F]">
              Motoka vs the government office
            </h2>
            <p>
              FRSC and state licensing authorities issue the papers. Motoka
              does not replace them. We collect your details, payment, and
              documents, then process the renewal so you are not standing in a
              queue. For official rules always check the relevant government
              channel as well.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[#05243F]">
              After you renew
            </h2>
            <p>
              Add the car on Motoka if you have not already.{" "}
              <Link to="/reminders" className="font-semibold text-[#2389E3] hover:underline">
                Auto reminders
              </Link>{" "}
              use the new expiry so next year’s renewal is not a surprise. More
              context is on{" "}
              <Link to="/how-it-works" className="font-semibold text-[#2389E3] hover:underline">
                how Motoka works
              </Link>{" "}
              and the{" "}
              <Link to="/guides" className="font-semibold text-[#2389E3] hover:underline">
                driver guides
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-xl font-bold text-[#05243F]">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.question} className="rounded-[16px] bg-white p-5">
                  <h3 className="font-semibold text-[#05243F]">{faq.question}</h3>
                  <p className="mt-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 rounded-[20px] bg-white p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-[#05243F]">Ready to renew?</h2>
          <PlateRenewCta />
        </div>
      </div>
    </article>
  );
}
