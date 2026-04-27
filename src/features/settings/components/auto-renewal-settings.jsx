"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useGetCars } from "../../car/useCar"
import AutoModeIcon from "../../../assets/images/ic_round-auto-mode.png"
import {
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  initiateTokenization
} from "../../../services/apiSubscription"

function Toggle({ checked, disabled, onChange, busy }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center flex-shrink-0">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled || busy}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 disabled:opacity-50" />
    </label>
  )
}

export default function AutoRenewalSettings({ onNavigate }) {
  const { cars: carsData, isLoading } = useGetCars()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [loadingId, setLoadingId] = useState(null)

  const allCars = Object.values(carsData?.cars || {})

  const handleToggle = async (car) => {
    const sub = car.active_subscription
    if (!sub) return

    setLoadingId(sub.id)
    try {
      if (sub.status === "active") {
        await pauseSubscription(sub.id)
        toast.success("Auto-renewal paused")
      } else {
        await resumeSubscription(sub.id)
        toast.success("Auto-renewal resumed")
      }
      queryClient.invalidateQueries({ queryKey: ["cars"] })
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update subscription")
    } finally {
      setLoadingId(null)
    }
  }

  const handleChangeCard = async (sub) => {
    setLoadingId(sub.id)
    try {
      const result = await initiateTokenization(sub.id)
      const authUrl = result?.data?.payment?.authorization_url || result?.payment?.authorization_url
      if (!authUrl) throw new Error("Could not get payment URL")

      const popup = window.open(authUrl, "_blank", "noopener,noreferrer,width=600,height=700")
      if (!popup) {
        toast.error("Please allow popups for this site to continue.")
        return
      }
      toast.success("Complete the card verification in the popup")
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval)
          queryClient.invalidateQueries({ queryKey: ["cars"] })
        }
      }, 1000)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not initiate card change")
    } finally {
      setLoadingId(null)
    }
  }

  const handleCancel = async (sub) => {
    if (!window.confirm("Cancel auto-renewal for this car? You can re-enable it any time.")) return
    setLoadingId(sub.id)
    try {
      await cancelSubscription(sub.id, "User cancelled via settings")
      toast.success("Auto-renewal cancelled")
      queryClient.invalidateQueries({ queryKey: ["cars"] })
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not cancel subscription")
    } finally {
      setLoadingId(null)
    }
  }

  const handleEnableForCar = (car) => {
    // Send them to the renewal flow for this car — auto-renewal gets set up after payment
    navigate("/licenses/renew", { state: { carSlug: car.slug, enableAutoRenewal: true } })
  }

  return (
    <div>
      <div className="flex items-center mb-4 md:mb-6">
        <button onClick={() => onNavigate("payment")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base md:text-lg font-medium">Auto Renewal Settings</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[#2389E3]" />
        </div>
      ) : allCars.length === 0 ? (
        <div className="rounded-lg bg-white p-6 shadow-md text-center">
          <img src={AutoModeIcon} alt="Auto-renewal" className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm font-medium text-[#05243F]">No cars registered</p>
          <p className="mt-1 text-xs text-gray-500">Add a car first to set up auto-renewal.</p>
          <button
            onClick={() => navigate("/garage")}
            className="mt-4 rounded-full bg-[#2389E3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a6dba] transition-all"
          >
            Go to Garage
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {allCars.map(car => {
            const sub = car.active_subscription
            const isActive = sub?.status === "active"
            const isPaused = sub?.status === "paused"
            const hasSub = !!sub
            const busy = sub && loadingId === sub.id

            return (
              <div key={car.id} className="rounded-xl bg-white p-4 shadow-sm border border-[#F0F4FA]">
                {/* Car header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={AutoModeIcon} alt="" className="h-5 w-5 object-contain" />
                    <div>
                      <p className="text-sm font-semibold text-[#05243F]">
                        {car.vehicle_make} {car.vehicle_model}
                        {car.vehicle_year ? ` (${car.vehicle_year})` : ""}
                      </p>
                      <p className="text-xs text-gray-400">{car.registration_no || "No plate"}</p>
                    </div>
                  </div>

                  {hasSub ? (
                    <Toggle
                      checked={isActive}
                      busy={busy}
                      onChange={() => handleToggle(car)}
                    />
                  ) : (
                    <button
                      onClick={() => handleEnableForCar(car)}
                      className="rounded-full border border-[#2389E3] px-3 py-1 text-xs font-semibold text-[#2389E3] transition-all hover:bg-[#EEF5FD] active:scale-95"
                    >
                      Enable
                    </button>
                  )}
                </div>

                {/* Status pill */}
                <div className="mt-2">
                  {isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Active — renews automatically
                    </span>
                  )}
                  {isPaused && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                      Paused
                    </span>
                  )}
                  {!hasSub && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      Not set up — renew to enable
                    </span>
                  )}
                </div>

                {/* Card on file */}
                {sub?.card_last4 && (
                  <div className="flex items-center justify-between border-t border-gray-100 mt-3 pt-3">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-[#05243F]">
                        {sub.card_type || "Card"} ···· {sub.card_last4}
                      </span>
                      {sub.card_bank && (
                        <span className="ml-1 text-gray-400">({sub.card_bank})</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleChangeCard(sub)}
                      disabled={busy}
                      className="text-xs font-medium text-[#2389E3] hover:underline disabled:opacity-50"
                    >
                      {busy ? "…" : "Change card"}
                    </button>
                  </div>
                )}

                {/* Next billing date */}
                {sub?.next_billing_date && isActive && (
                  <p className="mt-2 text-xs text-gray-400">
                    Next charge: {new Date(sub.next_billing_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}

                {/* Cancel */}
                {hasSub && (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => handleCancel(sub)}
                      disabled={busy}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      Cancel auto-renewal
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
