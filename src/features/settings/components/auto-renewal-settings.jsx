"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { useGetCars } from "../../car/useCar"
import AutoModeIcon from "../../../assets/images/ic_round-auto-mode.png"
import {
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  initiateTokenization
} from "../../../services/apiSubscription"

export default function AutoRenewalSettings({ onNavigate }) {
  const { cars: carsData, isLoading } = useGetCars()
  const queryClient = useQueryClient()
  const [loadingId, setLoadingId] = useState(null) // subscription id being acted on

  // Cars that have an active subscription
  const allCars = Object.values(carsData?.cars || {})
  const carsWithSub = allCars.filter(c => c.active_subscription)

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
      const authUrl = result?.data?.payment?.authorization_url
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
      ) : carsWithSub.length === 0 ? (
        <div className="rounded-lg bg-white p-6 shadow-md text-center">
          <img src={AutoModeIcon} alt="Auto-renewal" className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm font-medium text-[#05243F]">No auto-renewals set up</p>
          <p className="mt-1 text-xs text-gray-500">
            After a successful payment, you'll be prompted to enable auto-renewal for that car.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {carsWithSub.map(car => {
            const sub = car.active_subscription
            const isActive = sub.status === "active"
            const busy = loadingId === sub.id

            return (
              <div key={sub.id} className="rounded-lg bg-white p-4 shadow-md">
                {/* Car header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src={AutoModeIcon} alt="" className="h-5 w-5 object-contain" />
                    <div>
                      <p className="text-sm font-semibold text-[#05243F]">
                        {car.vehicle_make} {car.vehicle_model}
                      </p>
                      <p className="text-xs text-gray-400">{car.registration_no || car.plate_number}</p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isActive}
                      disabled={busy}
                      onChange={() => handleToggle(car)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {/* Card on file */}
                {sub.card_last4 && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
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

                {/* Cancel link */}
                <div className="mt-2 text-right">
                  <button
                    onClick={() => handleCancel(sub)}
                    disabled={busy}
                    className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    Cancel auto-renewal
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
