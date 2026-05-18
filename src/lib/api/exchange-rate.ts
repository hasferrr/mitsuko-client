import { getFallbackUsdToIdrRate } from "@/constants/pricing"
import { ExchangeRateResponse } from "@/types/pricing"

export async function fetchExchangeRate(): Promise<number> {
  try {
    const res = await fetch("/api/exchange-rate/usd-idr")
    if (!res.ok) return getFallbackUsdToIdrRate()

    const data: ExchangeRateResponse = await res.json()
    const effectiveRate = data.adjustedRate > 0 ? data.adjustedRate : data.rate
    return effectiveRate > 0 ? effectiveRate : getFallbackUsdToIdrRate()
  } catch {
    return getFallbackUsdToIdrRate()
  }
}
