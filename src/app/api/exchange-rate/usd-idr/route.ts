import { NextResponse } from "next/server"
import { getFallbackUsdToIdrRate } from "@/constants/pricing"
import { revalidateTag } from "next/cache"
import { z } from "zod"

const CACHE_TAG = "exchange-rate-usd-idr"

const exchangeRateSchema = z.object({
  rate: z.number().positive(),
  adjustedRate: z.number().positive(),
  expiresAt: z.string().nullable(),
})

type UpstreamExchangeRateResponse = z.infer<typeof exchangeRateSchema>

function fallback() {
  return { rate: getFallbackUsdToIdrRate() }
}

function parseExchangeRate(data: unknown): UpstreamExchangeRateResponse {
  const parsed = exchangeRateSchema.safeParse(data)
  if (!parsed.success) throw new Error("upstream response shape invalid")
  return parsed.data
}

function hasExpired(expiresAt: string | null): boolean {
  const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : NaN
  return !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()
}

async function fetchUpstreamExchangeRate(upstreamUrl: string, apiSecret: string) {
  const res = await fetch(upstreamUrl, {
    cache: "force-cache",
    headers: { Authorization: `Bearer ${apiSecret}` },
    next: { revalidate: false, tags: [CACHE_TAG] },
  })

  if (!res.ok) {
    throw new Error(`upstream returned ${res.status}`)
  }

  return parseExchangeRate(await res.json())
}

export async function GET() {
  const apiSecret = process.env.API_SECRET
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiSecret || !baseUrl) {
    return NextResponse.json(fallback())
  }

  const trimmedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const upstreamUrl = `${trimmedBase}/api/exchange-rate/usd-idr`

  try {
    let response = await fetchUpstreamExchangeRate(upstreamUrl, apiSecret)
    if (hasExpired(response.expiresAt)) {
      revalidateTag(CACHE_TAG, { expire: 0 })
      response = await fetchUpstreamExchangeRate(upstreamUrl, apiSecret)
    }
    return NextResponse.json({ rate: response.adjustedRate })
  } catch {
    revalidateTag(CACHE_TAG, { expire: 0 })
    return NextResponse.json(fallback())
  }
}
