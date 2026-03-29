import React, { useMemo, useState } from "react";

export default function PartialRenewalPromptModal({
  isOpen,
  skippedDocs = [],
  onConfirm,
  onSkip,
}) {
  const [answers, setAnswers] = useState({});

  const docs = useMemo(
    () => (Array.isArray(skippedDocs) ? skippedDocs.filter(Boolean) : []),
    [skippedDocs],
  );

  if (!isOpen) return null;

  const setReason = (doc, reason) => {
    setAnswers((prev) => ({
      ...prev,
      [doc]: {
        ...(prev[doc] || {}),
        reason,
      },
    }));
  };

  const setField = (doc, key, value) => {
    setAnswers((prev) => ({
      ...prev,
      [doc]: {
        ...(prev[doc] || {}),
        [key]: value,
      },
    }));
  };

  const buildPayload = () =>
    docs.map((doc) => {
      const answer = answers[doc] || {};
      const reason = answer.reason || "skipped";
      return {
        document_name: doc,
        reason,
        expiry_date: answer.expiry_date || null,
        custom_reason: reason === "custom" ? answer.custom_reason || null : null,
      };
    });

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={(e) => {
        e.stopPropagation();
        onSkip();
      }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-[#05243F]">You've skipped some documents</h3>
        <p className="mt-1 text-sm text-[#697C8C]">
          Tell us why, or skip and pay now. We can remind you later.
        </p>

        <div className="mt-5 max-h-[52vh] space-y-4 overflow-y-auto pr-1">
          {docs.map((doc) => {
            const row = answers[doc] || {};
            const reason = row.reason || "";
            return (
              <div key={doc} className="rounded-xl border border-[#E5E7EB] p-4">
                <div className="text-sm font-semibold text-[#05243F]">{doc}</div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`reason-${doc}`}
                      checked={reason === "not_expired"}
                      onChange={() => setReason(doc, "not_expired")}
                    />
                    Not expired yet
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`reason-${doc}`}
                      checked={reason === "already_handled"}
                      onChange={() => setReason(doc, "already_handled")}
                    />
                    Already handled
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`reason-${doc}`}
                      checked={reason === "custom"}
                      onChange={() => setReason(doc, "custom")}
                    />
                    Other reason
                  </label>
                </div>

                {(reason === "not_expired" || reason === "custom") && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-[#697C8C]">Expiry date (optional)</label>
                    <input
                      type="date"
                      value={row.expiry_date || ""}
                      onChange={(e) => setField(doc, "expiry_date", e.target.value)}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:border-[#2389E3]"
                    />
                  </div>
                )}

                {reason === "custom" && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-[#697C8C]">Custom reason</label>
                    <input
                      type="text"
                      value={row.custom_reason || ""}
                      onChange={(e) => setField(doc, "custom_reason", e.target.value)}
                      placeholder="Tell us why you skipped this one"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:border-[#2389E3]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-[#D1D5DB] px-5 py-2 text-sm font-medium text-[#05243F] hover:bg-[#F9FAFB]"
          >
            Skip &amp; Pay
          </button>
          <button
            type="button"
            onClick={() => onConfirm(buildPayload())}
            className="rounded-full bg-[#2284DB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B6CB3]"
          >
            Confirm &amp; Pay
          </button>
        </div>
      </div>
    </div>
  );
}
