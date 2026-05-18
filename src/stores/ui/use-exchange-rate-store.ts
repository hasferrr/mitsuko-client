import { create } from 'zustand'
import { getFallbackUsdToIdrRate } from '@/constants/pricing'
import { fetchExchangeRate } from '@/lib/api/exchange-rate'

interface ExchangeRateStore {
  idrRate: number
  isIdrRateLoading: boolean
  hasFetchedIdrRate: boolean
  fetchIdrRate: () => Promise<number>
}

let idrRatePromise: Promise<number> | null = null

export const useExchangeRateStore = create<ExchangeRateStore>()((set, get) => ({
  idrRate: getFallbackUsdToIdrRate(),
  isIdrRateLoading: false,
  hasFetchedIdrRate: false,
  fetchIdrRate: async () => {
    const state = get()

    if (state.hasFetchedIdrRate) return state.idrRate
    if (idrRatePromise) return idrRatePromise

    set({ isIdrRateLoading: true })
    idrRatePromise = fetchExchangeRate()
      .then((rate) => {
        set({ idrRate: rate, hasFetchedIdrRate: true })
        return rate
      })
      .finally(() => {
        idrRatePromise = null
        set({ isIdrRateLoading: false })
      })

    return idrRatePromise
  },
}))
