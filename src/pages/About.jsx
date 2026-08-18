import MarketingPage from "../components/MarketingPage";

export default function About() {
  return (
    <MarketingPage
      title="About Motoka"
      description="Motoka is a Nigerian platform for vehicle papers, reminders, and auto parts — so you can stay legal and keep driving."
      path="/about"
      ctaLabel="Create a free account"
      ctaTo="/auth/signup"
    >
      <p>
        Motoka started from a simple frustration: renewing vehicle documents in
        Nigeria takes too long, costs extra when you miss a deadline, and still
        leaves you guessing whether the papers are actually done.
      </p>
      <div>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">Our mission</h2>
        <p>
          Make vehicle compliance boring — in a good way. Add your car once,
          get reminded before anything expires, renew from your phone, and keep
          digital copies ready for a roadside check.
        </p>
      </div>
      <div>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">What we do today</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Vehicle licence and paper renewals, including guest checkout from the homepage</li>
          <li>Automatic expiry reminders so papers do not lapse unnoticed</li>
          <li>Ladipo marketplace for car parts, with fitment filters</li>
          <li>Traffic education and driver guides inside the app</li>
        </ul>
      </div>
      <p>
        We are not a mechanic workshop or a government office. We handle the
        paperwork flow, the reminders, and the parts catalogue — and we tell
        you clearly when a human on our team needs to complete an order.
      </p>
    </MarketingPage>
  );
}
