import MarketingPage from "../components/MarketingPage";

const steps = [
  {
    title: "1. Add your vehicle",
    body: "Create an account and add the cars you drive. Motoka stores plate number, documents, and expiry dates in one place.",
  },
  {
    title: "2. We watch the dates",
    body: "Before a licence, roadworthiness paper, or related document expires, you get a reminder by email. Add the car and the reminders start from the dates on file.",
  },
  {
    title: "3. Renew without the queue",
    body: "Start a renewal from the app or from the homepage with your plate number. Pay online. Our team processes the papers and you track the order until it is complete.",
  },
  {
    title: "4. Shop parts when you need them",
    body: "Ladipo on Motoka is a parts catalogue with vehicle fitment. Find the part, check out, and follow the order in the app.",
  },
];

export default function HowItWorks() {
  return (
    <MarketingPage
      title="How Motoka Works"
      description="Four steps: add your car, get reminded, renew online, and buy parts when you need them."
      path="/how-it-works"
      ctaLabel="Get started"
      ctaTo="/auth/signup"
    >
      {steps.map((step) => (
        <div key={step.title}>
          <h2 className="mb-2 text-xl font-bold text-[#05243F]">{step.title}</h2>
          <p>{step.body}</p>
        </div>
      ))}
      <p>
        Already have papers due? You can start a guest renewal on the homepage
        without creating an account first. After payment you can sign up and
        keep the vehicle on Motoka.
      </p>
    </MarketingPage>
  );
}
