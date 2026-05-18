import { getFallbackUsdToIdrRate } from "@/constants/pricing"
import { ExchangeRateResponse } from "@/types/pricing"

export async function fetchExchangeRate(): Promise<number> {
  try {
    const res = await fetch("/api/exchange-rate/usd-idr")
    if (!res.ok) return getFallbackUsdToIdrRate()

    const data: ExchangeRateResponse = await res.json()
    return data.rate > 0 ? data.rate : getFallbackUsdToIdrRate()
  } catch {
    return getFallbackUsdToIdrRate()
  }
}
