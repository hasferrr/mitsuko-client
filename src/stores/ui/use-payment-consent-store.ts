import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PaymentConsentStore {
  hasConsented: boolean
  setHasConsented: (hasConsented: boolean) => void
}

export const usePaymentConsentStore = create<PaymentConsentStore>()(
  persist(
    (set) => ({
      hasConsented: false,
      setHasConsented: (hasConsented) => set({ hasConsented }),
    }),
    {
      name: "payment-consent-store",
    }
  )
)
