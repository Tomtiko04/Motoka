import React from "react";

function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShipmentTracker({
  progress,
  loading = false,
  compact = false,
  admin = false,
  labelUrl = null,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-[#F4F5FC]" />
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-[#F4F5FC]" />
      </div>
    );
  }

  if (!progress) return null;

  const steps = progress.steps || [];
  const events = progress.events || [];

  return (
    <div className={compact ? "" : "rounded-2xl bg-white p-5 shadow-sm"}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#697C8C]">
            {progress.has_delivery ? "Package status" : "Order status"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-[#05243F]">
            {progress.current_label}
          </h3>
          <p className="mt-1 text-sm text-[#697C8C]">{progress.current_description}</p>
        </div>
        {progress.cancelled && (
          <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            Cancelled
          </span>
        )}
      </div>

      <ol className="space-y-0">
        {steps.map((step, index) => {
          const done = step.done;
          const current = step.current;
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    done
                      ? "bg-[#2389E3] text-white"
                      : current
                        ? "border-2 border-[#2389E3] bg-white text-[#2389E3]"
                        : "border border-[#D7DEE8] bg-white text-[#97A6B4]"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </span>
                {index < steps.length - 1 && (
                  <span className={`min-h-[22px] w-px flex-1 ${done ? "bg-[#2389E3]" : "bg-[#E1E6F4]"}`} />
                )}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-medium ${current || done ? "text-[#05243F]" : "text-[#97A6B4]"}`}>
                  {step.label}
                </p>
                {current && (
                  <p className="mt-0.5 text-xs text-[#697C8C]">{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {(progress.waybill_number || progress.tracking_url || (admin && labelUrl)) && (
        <div className="mt-1 space-y-2 rounded-xl bg-[#F4F5FC] p-3">
          {progress.waybill_number && (
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-[#697C8C]">Waybill</span>
              <span className="font-medium text-[#05243F]">{progress.waybill_number}</span>
            </div>
          )}
          {progress.carrier_name && (
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-[#697C8C]">Courier</span>
              <span className="font-medium text-[#05243F]">{progress.carrier_name}</span>
            </div>
          )}
          {progress.tracking_url && (
            <a
              href={progress.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-[#2389E3]"
            >
              Open courier tracking
            </a>
          )}
          {admin && labelUrl && (
            <a
              href={labelUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-semibold text-[#2389E3]"
            >
              Download shipping label
            </a>
          )}
        </div>
      )}

      {progress.has_delivery && !progress.waybill_number && (
        <p className="mt-3 text-xs text-[#697C8C]">
          Tracking details appear here as soon as Motoka books the courier and generates a waybill.
        </p>
      )}

      {events.length > 0 && (
        <div className="mt-4 border-t border-[#F4F5FC] pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#697C8C]">Courier updates</p>
          <ul className="space-y-2">
            {events.slice().reverse().map((event, index) => (
              <li key={`${event.at}-${index}`} className="text-sm">
                <p className="font-medium text-[#05243F]">{event.description || event.status}</p>
                <p className="text-xs text-[#697C8C]">
                  {[event.location, formatWhen(event.at)].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
