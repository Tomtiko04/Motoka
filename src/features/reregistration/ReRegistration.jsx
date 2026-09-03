import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useGetCars } from "../car/useCar";
import { useOCR } from "../../hooks/useOCR";
import UploadField from "./components/UploadField";
import {
  extractChassisCandidates,
  isFullVin,
  normaliseChassis,
} from "../../utils/chassisNumber";
import { RE_REGISTRATION_FEE_NAIRA } from "./fee";

// The vehicle and current-owner details are already on the car record, so this
// form does not ask for them again — it asks only for what re-registration
// actually adds: who the vehicle is going to, and the supporting documents.
const DOCUMENTS = [
  {
    key: "purchaseReceipt",
    label: "Purchase receipt",
    hint: "The receipt or invoice for the sale.",
  },
  {
    key: "proofOfOwnership",
    label: "Proof of ownership",
    hint: "The current Proof of Ownership Certificate.",
  },
  {
    key: "vehicleLicence",
    label: "Vehicle licence",
    hint: "The current vehicle licence, even if it has expired.",
  },
  {
    key: "ninSlip",
    label: "New owner’s NIN slip",
    hint: "The slip belonging to the person receiving the vehicle.",
  },
];

const FIELD =
  "w-full rounded-xl border border-[#E4E9F2] bg-white px-4 py-3 text-sm text-[#05243F] outline-none placeholder:text-[#05243F]/30 focus:border-[#2389E3]";

export default function ReRegistration() {
  const { cars, isLoading } = useGetCars();
  const { extractText } = useOCR();
  const carList = cars?.cars ?? [];

  const [carId, setCarId] = useState("");
  const [newOwner, setNewOwner] = useState({ name: "", address: "", phone: "" });
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [chassis, setChassis] = useState("");
  const [chassisSource, setChassisSource] = useState("record");
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const car = useMemo(
    () => carList.find((c) => String(c.id) === String(carId)),
    [carList, carId],
  );

  function selectCar(id) {
    setCarId(id);
    const picked = carList.find((c) => String(c.id) === String(id));
    setChassis(normaliseChassis(picked?.chassisNo ?? ""));
    setChassisSource("record");
  }

  // Typing seventeen characters off a stamped plate is the worst part of this
  // form, so the photo is read and the number offered back for confirmation.
  // It is never written silently — the owner sees where it came from.
  async function handleChassisImage(file, error) {
    setFileErrors((p) => ({ ...p, chassisImage: error }));
    if (!file) return;
    setFiles((p) => ({ ...p, chassisImage: file }));
    setReadError(null);
    setReading(true);
    try {
      const text = await extractText(file);
      const [best] = extractChassisCandidates(text);
      if (best) {
        setChassis(best);
        setChassisSource("photo");
      } else {
        setReadError(
          "Could not read a chassis number from that photo. Type it in below.",
        );
      }
    } catch {
      setReadError(
        "Could not read that photo. Type the chassis number in below.",
      );
    } finally {
      setReading(false);
    }
  }

  const missingDocs = DOCUMENTS.filter((d) => !files[d.key]).map((d) => d.label);
  const ready =
    car &&
    newOwner.name.trim() &&
    newOwner.address.trim() &&
    newOwner.phone.trim() &&
    chassis &&
    files.chassisImage &&
    missingDocs.length === 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#05243F]">Re-registration</h1>
        <p className="mt-1 text-sm text-[#05243F]/60">
          Transfer a vehicle to a new owner. We use the details already on your
          car, so you only fill in what changes.
        </p>
      </header>

      {/* The tile is live, so people arrive here before submissions work.
          Saying so up front is the difference between a preview and a trap —
          nobody should fill five uploads to find out at the end. */}
      <div className="mb-6 flex gap-3 rounded-xl bg-[#FDF3E2] p-4 text-sm text-[#A86A00]">
        <Icon
          icon="solar:info-circle-bold"
          fontSize={20}
          className="mt-0.5 shrink-0"
        />
        <p>
          <span className="font-semibold">Not accepting submissions yet.</span>{" "}
          You can fill this in and see what re-registration needs and costs,
          but nothing is sent, saved or charged until we connect it.
        </p>
      </div>

      {/* 1 — the vehicle */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-[#05243F]">
          1. Which vehicle
        </h2>
        {isLoading ? (
          <p className="text-sm text-[#05243F]/50">Loading your cars…</p>
        ) : carList.length === 0 ? (
          <p className="rounded-xl bg-[#FDF3E2] p-4 text-sm text-[#A86A00]">
            You need a car on your account before you can re-register one.
          </p>
        ) : (
          <select
            value={carId}
            onChange={(e) => selectCar(e.target.value)}
            className={FIELD}
            aria-label="Select the vehicle to re-register"
          >
            <option value="">Select a vehicle</option>
            {carList.map((c) => (
              <option key={c.id} value={c.id}>
                {[c.vehicleMake, c.vehicleModel].filter(Boolean).join(" ")} ·{" "}
                {c.registrationNo}
              </option>
            ))}
          </select>
        )}

        {car && (
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[#F4F5FC] p-4 text-sm">
            {[
              ["Plate number", car.registrationNo],
              ["Colour", car.vehicleColor],
              ["Engine number", car.engineNo],
              ["Current owner", car.ownerName],
              ["Owner address", car.address],
              ["Owner phone", car.phoneNo],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-[#05243F]/40">{k}</dt>
                <dd className="text-[#05243F]">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* 2 — chassis */}
      {car && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-[#05243F]">
            2. Chassis number
          </h2>
          <UploadField
            label="Chassis image"
            hint="Photograph the stamped chassis number. We will read it for you."
            file={files.chassisImage}
            error={fileErrors.chassisImage}
            busy={reading}
            onChange={handleChassisImage}
          />
          {reading && (
            <p className="mt-2 flex items-center gap-2 text-xs text-[#2389E3]">
              <Icon icon="svg-spinners:180-ring" fontSize={14} />
              Reading the chassis number…
            </p>
          )}
          {readError && (
            <p className="mt-2 text-xs text-[#A86A00]">{readError}</p>
          )}

          <label
            htmlFor="chassis"
            className="mt-4 mb-1 block text-xs text-[#05243F]/50"
          >
            Chassis number
          </label>
          <input
            id="chassis"
            value={chassis}
            onChange={(e) => {
              setChassis(normaliseChassis(e.target.value));
              setChassisSource("typed");
            }}
            placeholder="17 characters"
            maxLength={17}
            autoCapitalize="characters"
            spellCheck={false}
            className={`${FIELD} font-mono tracking-wider`}
          />
          <p className="mt-1 text-xs text-[#05243F]/45">
            {chassisSource === "photo"
              ? "Read from your photo — check it matches the stamp before continuing."
              : chassisSource === "record"
                ? "From your car record."
                : "Typed."}
            {chassis && !isFullVin(chassis) && (
              <span className="ml-1 text-[#A86A00]">
                This is {chassis.length} characters, not the usual 17. That is
                normal on older vehicles — confirm it is right.
              </span>
            )}
          </p>
        </section>
      )}

      {/* 3 — new owner */}
      {car && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-[#05243F]">
            3. New owner
          </h2>
          <div className="grid gap-3">
            {[
              ["name", "Full name", "text"],
              ["address", "Address", "text"],
              ["phone", "Phone number", "tel"],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label
                  htmlFor={`owner-${key}`}
                  className="mb-1 block text-xs text-[#05243F]/50"
                >
                  {label}
                </label>
                <input
                  id={`owner-${key}`}
                  type={type}
                  value={newOwner[key]}
                  onChange={(e) =>
                    setNewOwner((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className={FIELD}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 — documents */}
      {car && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-[#05243F]">
            4. Documents
          </h2>
          <div className="grid gap-3">
            {DOCUMENTS.map((d) => (
              <UploadField
                key={d.key}
                label={d.label}
                hint={d.hint}
                file={files[d.key]}
                error={fileErrors[d.key]}
                onChange={(file, error) => {
                  setFileErrors((p) => ({ ...p, [d.key]: error }));
                  if (file) setFiles((p) => ({ ...p, [d.key]: file }));
                }}
              />
            ))}
          </div>
        </section>
      )}

      {car && (
        <>
          <div className="mb-4 rounded-2xl border border-[#E4E9F2] bg-white p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#05243F]/60">
                Re-registration fee
              </span>
              <span className="text-lg font-bold text-[#05243F]">
                ₦{RE_REGISTRATION_FEE_NAIRA.toLocaleString("en-NG")}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#05243F]/45">
              The total, government fees and our service fee included. Payable
              once your details are confirmed — nothing is charged now.
            </p>
          </div>

          <button
            type="button"
            disabled={!ready}
            onClick={() => setSubmitted(true)}
            className="w-full rounded-full bg-[#2389E3] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B72C0] disabled:cursor-not-allowed disabled:bg-[#2389E3]/30"
          >
            Continue
          </button>

          {!ready && missingDocs.length > 0 && (
            <p className="mt-2 text-center text-xs text-[#05243F]/45">
              Still needed: {missingDocs.join(", ")}
            </p>
          )}

          {/* No endpoint accepts this yet. Saying so is better than a spinner
              that resolves into a success screen nothing received. */}
          {submitted && (
            <div className="mt-4 rounded-xl bg-[#FDF3E2] p-4 text-sm text-[#A86A00]">
              <p className="font-semibold">
                Everything needed is here — but nothing was sent.
              </p>
              <p className="mt-1">
                Re-registration submissions go live once the endpoint is
                connected. Your uploads have not been saved.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
