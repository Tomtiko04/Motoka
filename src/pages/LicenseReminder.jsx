import MarketingPage from "../components/MarketingPage";

export default function LicenseReminder() {
  return (
    <MarketingPage
      title="License Auto Reminder"
      description="Motoka tracks expiry dates on your vehicle papers and emails you before they lapse — so you can renew on time and skip the fine."
      path="/reminders"
      ctaLabel="Add a car to get reminders"
      ctaTo="/auth/signup"
    >
      <p>
        Most overdue papers are not a choice. They are a date nobody wrote
        down. Motoka stores the expiry on each document and sends staged
        reminders as that date approaches.
      </p>
      <div>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">How to turn it on</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Create a Motoka account.</li>
          <li>Add your vehicle and the current expiry dates on its papers.</li>
          <li>Keep notifications and email reachable. Reminders go out automatically — there is nothing to tap each month.</li>
        </ol>
      </div>
      <div>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">What you will get</h2>
        <p>
          Advance notice before a document expires, and a follow-up if it has
          already lapsed. When you are ready, renew from the same account so
          the new date replaces the old one.
        </p>
      </div>
      <p>
        Reminders are not a substitute for renewal. If papers are already due,
        start a renewal from the homepage with your plate number.
      </p>
    </MarketingPage>
  );
}
