import { Link } from "react-router-dom";
import MarketingPage from "../components/MarketingPage";

export default function DriverGuides() {
  return (
    <MarketingPage
      title="Driver Guides"
      description="Practical notes for keeping a car legal in Nigeria — papers, renewals, and the road."
      path="/guides"
    >
      <article>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">
          What papers a private car usually needs
        </h2>
        <p>
          Exact requirements vary by state, but owners typically keep vehicle
          licence, proof of ownership or change of ownership, insurance, and
          roadworthiness (where required) current. Carry digital copies on your
          phone and keep the originals somewhere they cannot be stolen from the
          glove box.
        </p>
      </article>
      <article>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">
          How to renew through Motoka
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>On Motoka, enter your plate on the{" "}
            <Link to="/renew-vehicle-licence" className="font-semibold text-[#2389E3] hover:underline">
              vehicle licence renewal
            </Link>{" "}
            page, or log in and open Licenses.</li>
          <li>Choose the documents you need and confirm delivery details.</li>
          <li>Pay online. Motoka creates an order our team can process.</li>
          <li>Track the order until it is completed. Your new expiry is stored on the car.</li>
        </ol>
      </article>
      <article>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">
          If papers have already expired
        </h2>
        <p>
          Renew as soon as you can. Driving with expired papers can mean a fine
          or the vehicle being delayed at a checkpoint. Motoka can still take
          the renewal — it does not replace a penalty the authorities already
          issued.
        </p>
      </article>
      <article>
        <h2 className="mb-3 text-xl font-bold text-[#05243F]">Traffic education</h2>
        <p>
          Signs, markings, and common offences live in the Traffic Education
          section of the app.{" "}
          <Link to="/traffic-rules" className="font-semibold text-[#2389E3] hover:underline">
            Open traffic rules
          </Link>
          . You will be asked to log in.
        </p>
      </article>
      <p>
        More walkthroughs are on the{" "}
        <Link to="/blogs" className="font-semibold text-[#2389E3] hover:underline">
          blog
        </Link>
        .
      </p>
    </MarketingPage>
  );
}
