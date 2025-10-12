import { Icon } from "@iconify/react/dist/iconify.js";

function Whyus() {
  return (
    <div className="mt-18">
      <div className="mt-10 max-w-[1003px] px-6">
        <h1 className="text-[40px] text-[56px] font-bold text-[#05243F]">
          Stop Worrying. <span className="text-[#2389E3]">Start Driving.</span>
        </h1>
        <p className="mt-6 text-lg text-[#05203DB2]">
          Motoka is the only digital platform in Nigeria that gives you
          guaranteed peace of mind through automation, security, and a vetted
          service network.
        </p>
      </div>
      <div className="w-full px-6">
        <div className="mt-18 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="text-[#05243F]">
            <h2 className="text-[32px] font-bold">End the Document Stress:</h2>
            <p className="text-2xl">Compliance & Security</p>
          </div>
          <div>
            {[
              {
                title: "Digital Vehicle Wallet",
                content:
                  "Securely digitize all licenses, insurance, and roadworthiness papers. Access them instantly via the app to eliminate the risk of loss and avoid panic during roadside checks.",
                iconName: "akar-icons:wallet",
              },
              {
                title: "Military-Grade Data Protection",
                content:
                  "Your sensitive vehicle and personal data are encrypted and stored safely, ensuring your information is protected better than the physical documents themselves.",
                iconName: "icon-park-outline:protect",
              },
            ].map((item, index) => (
              <div key={index} className="mb-6 flex gap-3">
               <div className="bg-[#2389E31C] rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
  <Icon icon={item.iconName} className="h-6 w-6 text-[#2388E1]" />
</div>

                <div>
                  <p className="text-lg text-[#05203DB2]">
                    <b className="text-[#05203D]">{item.title}:</b>
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-18 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="text-[#05243F]">
            <h2 className="text-[32px] font-bold">Never Miss a Renewal:</h2>
            <p className="text-2xl">Time & Money Savings</p>
          </div>
          <div>
            {[
              {
                title: "Intelligent Expiry Reminders",
                content:
                  " Receive automated, customizable alerts well in advance of every license, insurance, and service due date. Save money by effortlessly avoiding late penalties and fines.",
                iconName: "material-symbols:alarm-outline-rounded",
              },
              {
                title: "Instant, Seamless Renewals",
                content:
                  " Process and pay for critical renewals (licenses, insurance) directly within the app. Our certified team handles the entire fulfillment process, giving you the fastest, most secure, and transparent route to compliance, cutting out all unnecessary middlemen and waiting times.",
                iconName: "hugeicons:renewable-energy",
              },
            ].map((item, index) => (
              <div key={index} className="mb-6 flex gap-3">
               <div className="bg-[#2389E31C] rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
  <Icon icon={item.iconName} className="h-6 w-6 text-[#2388E1]" />
</div>

                <div>
                  <p className="text-lg text-[#05203DB2]">
                    <b className="text-[#05203D]">{item.title}:</b>
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-18 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="text-[#05243F]">
            <h2 className="text-[32px] font-bold">Guranteed Quality Service:</h2>
            <p className="text-2xl">Trust & Reliability</p>
          </div>
          <div>
            {[
              {
                title: "Vetted Vendor Marketplace:",
                content:
                  " Browse a curated network of mechanics, vulcanizers, and parts dealers who have been thoroughly verified for quality and fair pricing. No more guesswork—book services with confidence.",
                iconName: "iconoir:shop",
              },
              
            ].map((item, index) => (
              <div key={index} className="mb-6 flex gap-3">
               <div className="bg-[#2389E31C] rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
  <Icon icon={item.iconName} className="h-6 w-6 text-[#2388E1]" />
</div>

                <div>
                  <p className="text-lg text-[#05203DB2]">
                    <b className="text-[#05203D]">{item.title}:</b>
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Whyus;
