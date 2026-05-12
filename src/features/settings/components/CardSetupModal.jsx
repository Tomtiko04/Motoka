import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { setupAutoRenewal, getRenewalSchedule } from "../../../services/apiSubscription"

function formatNaira(kobo) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`
}

function formatDate(isoDate) {
  if (!isoDate) return ""
  const d = new Date(isoDate + "T00:00:00")
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
}

function chargeDate(expiryDateStr) {
  if (!expiryDateStr) return ""
  const d = new Date(expiryDateStr + "T00:00:00")
  d.setDate(d.getDate() - 14)
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
}

export default function CardSetupModal({ car, onClose, onSuccess }) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState("select") // select | loading | awaiting | success | error
  const [errorMsg, setErrorMsg] = useState("")
  const [items, setItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    getRenewalSchedule()
      .then((data) => {
        const fetched = data?.data || data?.items || []
        setItems(fetched)
        // Default: select all items
        setSelectedIds(fetched.map((i) => i.id))
      })
      .catch(() => {
        // Fall back to vehicle licence only if fetch fails
        setItems([{ id: "vehicle_licence", name: "Vehicle Licence", price: 470000, required: true }])
        setSelectedIds(["vehicle_licence"])
      })
      .finally(() => setLoadingItems(false))
  }, [])

  const total = items
    .filter((i) => selectedIds.includes(i.id))
    .reduce((sum, i) => sum + i.price, 0)

  const toggleItem = (id, required) => {
    if (required) return // can't deselect required items
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    setStep("loading")
    try {
      const result = await setupAutoRenewal({
        car_slug: car.slug,
        selected_items: selectedIds
      })

      const authUrl =
        result?.data?.payment?.authorization_url ||
        result?.payment?.authorization_url

      if (!authUrl) throw new Error("Could not get payment URL")

      const popup = window.open(authUrl, "_blank", "noopener,noreferrer,width=600,height=700")
      if (!popup) {
        toast.error("Please allow popups for this site to continue.")
        setStep("select")
        return
      }

      setStep("awaiting")

      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval)
          queryClient.invalidateQueries({ queryKey: ["cars"] })
          setStep("success")
        }
      }, 1000)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong"
      setErrorMsg(msg)
      setStep("error")
    }
  }

  const carLabel = `${car.vehicle_make} ${car.vehicle_model}${car.vehicle_year ? ` (${car.vehicle_year})` : ""}`
  const expiryDate = car.expiry_date || car.expiry_status?.expiry_date

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#EBB950] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
              <Icon icon="solar:card-bold" className="text-white" fontSize={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Set Up Auto-Renewal</p>
              <p className="text-xs text-white/80">{carLabel}</p>
            </div>
          </div>
          {step !== "awaiting" && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Icon icon="solar:close-bold" fontSize={14} />
            </button>
          )}
        </div>

        <div className="px-5 py-5">

          {/* SELECT step */}
          {step === "select" && (
            <>
              {/* Expiry info banner */}
              <div className="rounded-xl bg-[#F0F7FF] border border-[#2389E3]/20 px-4 py-3 mb-4">
                <p className="text-xs text-[#2389E3] font-medium">
                  Your car is valid until {formatDate(expiryDate)}.
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add your card now — we'll charge you on {chargeDate(expiryDate)}, 14 days before expiry.
                </p>
              </div>

              {/* Items */}
              {loadingItems ? (
                <div className="flex justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-[#2389E3]" />
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Select documents to auto-renew
                  </p>
                  {items.map((item) => {
                    const checked = selectedIds.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id, item.required)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-all text-left ${
                          checked
                            ? "border-[#2389E3] bg-[#EEF5FD]"
                            : "border-gray-200 bg-white"
                        } ${item.required ? "cursor-default" : "hover:border-[#2389E3]/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            checked ? "border-[#2389E3] bg-[#2389E3]" : "border-gray-300"
                          }`}>
                            {checked && <Icon icon="solar:check-bold" className="text-white" fontSize={10} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#05243F]">{item.name}</p>
                            {item.required && (
                              <p className="text-xs text-gray-400">Required</p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#05243F]">{formatNaira(item.price)}</p>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-4">
                <p className="text-sm text-gray-500">Total at renewal</p>
                <p className="text-base font-bold text-[#05243F]">{formatNaira(total)}</p>
              </div>

              {/* ₦50 disclaimer */}
              <p className="text-xs text-gray-400 text-center mb-4">
                We'll charge ₦50 now to verify your card — it's refunded immediately.
                Nothing else is charged today.
              </p>

              <button
                onClick={handleSubmit}
                disabled={!selectedIds.length || loadingItems}
                className="w-full rounded-full bg-[#EBB950] py-3 text-sm font-semibold text-white transition-all hover:bg-[#d4a43e] active:scale-95 disabled:opacity-40"
              >
                Add Card — Charge {formatNaira(total)} on {chargeDate(expiryDate)}
              </button>
            </>
          )}

          {/* LOADING step */}
          {step === "loading" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#EBB950] border-t-transparent" />
              <p className="text-sm text-gray-500">Setting up your auto-renewal…</p>
            </div>
          )}

          {/* AWAITING step */}
          {step === "awaiting" && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF8E8]">
                <Icon icon="solar:card-bold" className="text-[#EBB950]" fontSize={26} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#05243F]">Complete card entry in the popup</p>
                <p className="text-xs text-gray-400 mt-1">
                  The Paystack window should have opened. Complete the ₦50 verification — it will be refunded.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EBB950] [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EBB950] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EBB950] [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {/* SUCCESS step */}
          {step === "success" && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <Icon icon="solar:check-circle-bold" className="text-green-500" fontSize={34} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#05243F]">Auto-renewal is set up!</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your {carLabel} will be renewed automatically. We'll notify you before we charge.
                </p>
              </div>
              <button
                onClick={() => { onSuccess?.(); onClose() }}
                className="mt-2 rounded-full bg-[#EBB950] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d4a43e] transition-all"
              >
                Done
              </button>
            </div>
          )}

          {/* ERROR step */}
          {step === "error" && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Icon icon="solar:danger-bold" className="text-red-400" fontSize={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#05243F]">Something went wrong</p>
                <p className="text-xs text-gray-400 mt-1">{errorMsg}</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep("select")}
                  className="rounded-full border border-[#2389E3] px-4 py-2 text-xs font-semibold text-[#2389E3] hover:bg-[#EEF5FD] transition-all"
                >
                  Try again
                </button>
                <button
                  onClick={onClose}
                  className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
