import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useLadipoPaymentModalStore } from "../../../store/ladipoPaymentModalStore";

const BLUE = "#2185D5";
const CORAL = "#F06464";
const NAVY = "#001B39";
const GREY = "#9EABB7";
const PURPLE_BORDER = "#7E3AF2";
const MINT = "#3DDC97";
const ROW_LINE = "rgba(158, 171, 183, 0.35)";

function formatAmountNaira(kobo) {
  const n = Number(kobo);
  if (!Number.isFinite(n)) return "N0";
  return `N${(n / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function formatReceiptDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${h}:${mm}${ampm} ${day}-${month}-${year}`;
}

function paymentMethodLabel(order) {
  const raw = String(
    order?.payment_method || order?.payment_gateway || order?.gateway || "",
  ).toLowerCase();
  if (!raw) return "Paid online";
  if (
    raw.includes("monicredit") ||
    raw.includes("transfer") ||
    raw.includes("bank")
  ) {
    return "Transfer";
  }
  if (raw.includes("paystack")) return "Paystack";
  return (
    order?.payment_method ||
    order?.payment_gateway ||
    "Paid online"
  );
}

/** Full line-item text for receipt (e-commerce style). */
function itemsLineList(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) return "—";
  return items
    .map((i) => {
      const name = (i.name || "Item").trim();
      const q = Number(i.quantity) > 1 ? ` ×${i.quantity}` : "";
      return `${name}${q}`;
    })
    .filter(Boolean)
    .join(", ");
}

function buildReceiptRows(order) {
  const orderNo = order?.order_number
    ? String(order.order_number)
    : "—";
  return [
    { label: "Order type:", value: "Parts purchase" },
    { label: "Order No.:", value: orderNo },
    { label: "Items:", value: itemsLineList(order) },
    {
      label: "Transaction time:",
      value: formatReceiptDateTime(order?.paid_at || order?.created_at),
    },
    { label: "Payment method:", value: paymentMethodLabel(order) },
  ];
}

function ProcessingArc() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[180px] overflow-hidden">
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {/* Coral/Red arc - sweeps from bottom-left edge to center-right */}
        <path
          d="M 0 200 Q 150 30 380 170"
          fill="none"
          stroke={CORAL}
          strokeWidth="75"
          strokeLinecap="round"
        />
        {/* Blue arc - sweeps from center-left to bottom-right edge, overlaps on top */}
        <path
          d="M 20 170 Q 250 30 400 200"
          fill="none"
          stroke={BLUE}
          strokeWidth="75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function SuccessArc() {
  return (
    <svg
      viewBox="0 0 400 120"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none mx-auto h-24 w-full max-w-[300px] shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id="ladipoSuccessArc" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BLUE} />
          <stop offset="45%" stopColor={BLUE} />
          <stop offset="55%" stopColor={MINT} />
          <stop offset="100%" stopColor={MINT} />
        </linearGradient>
      </defs>
      <path
        d="M 40 100 Q 200 -20 360 100"
        fill="none"
        stroke="url(#ladipoSuccessArc)"
        strokeWidth="28"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Compact arc + side accents (blue / yellow wings). */
function ReceiptHeaderDecor() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-1 top-1/2 h-16 w-7 -translate-y-1/2 rounded-r-full opacity-90"
        style={{ background: `linear-gradient(180deg, ${BLUE}, #4A9FE8)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1 top-1/2 h-16 w-7 -translate-y-1/2 rounded-l-full opacity-90"
        style={{ background: "linear-gradient(180deg, #F5C84A, #F4B23D)" }}
        aria-hidden
      />
      <svg
        viewBox="0 0 360 100"
        preserveAspectRatio="xMidYMax meet"
        className="pointer-events-none absolute -bottom-1 left-1/2 h-16 w-[105%] max-w-[340px] -translate-x-1/2"
        aria-hidden
      >
        <defs>
          <linearGradient id="ladipoReceiptArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={BLUE} />
            <stop offset="12%" stopColor={BLUE} />
            <stop offset="12%" stopColor="#8FD99A" />
            <stop offset="70%" stopColor="#C8F0C4" />
            <stop offset="70%" stopColor="#F4B23D" />
            <stop offset="100%" stopColor="#F5C84A" />
          </linearGradient>
        </defs>
        <path
          d="M 28 88 A 152 152 0 0 1 332 88"
          fill="none"
          stroke="url(#ladipoReceiptArc)"
          strokeWidth="22"
          strokeLinecap="butt"
        />
      </svg>
    </>
  );
}

function LadipoReceiptModal({ order, amountKobo, onCloseReceipt }) {
  const amountLabel = formatAmountNaira(amountKobo);
  const rows = buildReceiptRows(order);

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-5 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ladipo-receipt-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="Dismiss receipt"
        onClick={onCloseReceipt}
      />
      <div
        className="relative flex max-h-[min(82vh,560px)] w-full max-w-[320px] flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-xl sm:max-w-[340px]"
        style={{ borderColor: PURPLE_BORDER }}
      >
        <button
          type="button"
          onClick={onCloseReceipt}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-[#8B98A5] transition-colors hover:bg-[#F0F3F6] hover:text-[#05243F]"
          aria-label="Close receipt"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>

        <div className="ladipo-receipt-scroll relative min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <div className="relative overflow-hidden px-6 pb-1 pt-12 text-center sm:px-7 sm:pt-14">
            <ReceiptHeaderDecor />
            <div className="relative z-10 flex flex-col items-center">
              <p
                id="ladipo-receipt-title"
                className="text-[12px] font-medium tracking-wide"
                style={{ color: GREY }}
              >
                Payment Receipt
              </p>
              <p
                className="mt-3.5 text-[1.35rem] font-semibold leading-none tracking-tight sm:text-[1.5rem]"
                style={{ color: BLUE }}
              >
                {amountLabel}
              </p>
              <h2
                className="mt-2 text-[15px] font-semibold leading-snug"
                style={{ color: NAVY }}
              >
                Payment Successful
              </h2>
              <p
                className="mt-1.5 max-w-[240px] pb-7 text-[12px] leading-relaxed sm:pb-8"
                style={{ color: GREY }}
              >
                Thanks for trusting us.
              </p>
            </div>
          </div>

          <div className="border-t border-[#EEF1F4] px-5 pb-6 pt-1 sm:px-6 sm:pb-7">
            <div className="flex flex-col">
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-3 py-3 text-left sm:gap-4 sm:py-3.5"
                  style={{
                    borderBottom: i < rows.length - 1 ? `1px solid ${ROW_LINE}` : undefined,
                  }}
                >
                  <span
                    className="w-[38%] shrink-0 text-[11px] font-normal leading-relaxed sm:text-[12px]"
                    style={{ color: GREY }}
                  >
                    {row.label}
                  </span>
                  <span
                    className="min-w-0 flex-1 break-words text-right text-[11px] font-medium leading-relaxed sm:text-[12px]"
                    style={{ color: NAVY }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LadipoPaymentStatusModals() {
  const navigate = useNavigate();
  const isOpen = useLadipoPaymentModalStore((s) => s.isOpen);
  const phase = useLadipoPaymentModalStore((s) => s.phase);
  const amountKobo = useLadipoPaymentModalStore((s) => s.amountKobo);
  const order = useLadipoPaymentModalStore((s) => s.order);
  const receiptOpen = useLadipoPaymentModalStore((s) => s.receiptOpen);
  const close = useLadipoPaymentModalStore((s) => s.close);
  const openReceipt = useLadipoPaymentModalStore((s) => s.openReceipt);
  const closeReceipt = useLadipoPaymentModalStore((s) => s.closeReceipt);

  if (!isOpen || !phase) return null;

  const amountLabel = formatAmountNaira(amountKobo);

  const handleCloseAll = () => {
    close();
    navigate("/ladipo");
  };

  if (receiptOpen && order) {
    return createPortal(
      <LadipoReceiptModal
        order={order}
        amountKobo={amountKobo}
        onCloseReceipt={closeReceipt}
      />,
      document.body,
    );
  }

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ladipo-payment-modal-title"
    >
      {phase === "success" ? (
        <button
          type="button"
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          aria-label="Dismiss overlay"
          onClick={handleCloseAll}
        />
      ) : (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" aria-hidden />
      )}
      <div
        className="relative w-full max-w-[320px] overflow-hidden rounded-3xl border-2 bg-white shadow-xl sm:max-w-[340px]"
        style={{ borderColor: PURPLE_BORDER }}
      >
        <button
          type="button"
          onClick={handleCloseAll}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#8B98A5] transition-colors hover:bg-[#F0F3F6] hover:text-[#05243F]"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>

        {phase === "processing" && (
          <>
            <div className="flex flex-col items-center px-6 pt-12 pb-0 text-center sm:px-7 sm:pt-14">
              <p
                className="text-[1.35rem] font-semibold leading-none tracking-tight sm:text-[1.5rem]"
                style={{ color: BLUE }}
              >
                {amountLabel}
              </p>
              <h2
                id="ladipo-payment-modal-title"
                className="mt-4 text-[15px] font-semibold leading-snug"
                style={{ color: NAVY }}
              >
                Processing Payment
              </h2>
              <p
                className="mt-1.5 max-w-[240px] text-[12px] leading-relaxed pb-[180px]"
                style={{ color: GREY }}
              >
                Kindly hold on for a second
              </p>
            </div>
            <ProcessingArc />
          </>
        )}

        {phase === "success" && (
          <div className="flex flex-col items-center px-6 pb-8 pt-12 text-center sm:px-7 sm:pb-9 sm:pt-14">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "#E8ECEF" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 12.5L10.5 17L18 8"
                  stroke={MINT}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p
              className="mt-4.5 text-[1.35rem] font-semibold leading-none tracking-tight sm:mt-5 sm:text-[1.5rem]"
              style={{ color: BLUE }}
            >
              {amountLabel}
            </p>
            <h2
              id="ladipo-payment-modal-title"
              className="mt-2 text-[15px] font-semibold leading-snug"
              style={{ color: NAVY }}
            >
              Payment Successful
            </h2>
            <p
              className="mt-1.5 max-w-[240px] text-[12px] leading-relaxed"
              style={{ color: GREY }}
            >
              Thanks for trusting us.
            </p>

            <div className="mt-7 flex w-full max-w-[260px] flex-col gap-2.5 sm:mt-8">
              <button
                type="button"
                onClick={() => openReceipt()}
                className="w-full rounded-full border-2 py-2.5 text-[13px] font-medium transition-colors hover:bg-[#F4F5FC]"
                style={{ borderColor: BLUE, color: BLUE }}
              >
                View receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate("/settings", { state: { settingsPage: "ladipo-orders" } });
                }}
                className="w-full rounded-full py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: BLUE }}
              >
                View orders
              </button>
            </div>

            <div className="mt-7 w-full sm:mt-8">
              <SuccessArc />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
