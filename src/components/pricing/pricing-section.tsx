"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { useEffect, useState } from "react"
import { PricingCards } from "./pricing-cards"
import { FeatureComparisonTable } from "./feature-comparison-table"
import { CreditPackPrices } from "./credit-pack-prices"
import { GeneralFeaturesSection } from "./general-features-section"
import { CURRENCIES, SUBSCRIPTION_PLANS } from "@/constants/pricing"
import { CurrencyData } from "@/types/pricing"
import { CurrencyTabs } from "./currency-tabs"
import { fetchExchangeRate } from "@/lib/api/exchange-rate"

interface Feature {
  feature: string
  free: React.ReactNode
  basic: React.ReactNode
  pro: React.ReactNode
  description: string
}

interface PricingSectionProps {
  useH1Title?: boolean
  redirectToPricingPage?: boolean
  showDescription?: boolean
  showLink?: boolean
  fetchIdrRateImmediately?: boolean
}

export default function PricingSection({
  useH1Title,
  redirectToPricingPage,
  showDescription,
  showLink,
  fetchIdrRateImmediately = false,
}: PricingSectionProps) {
  const [currency, setCurrency] = useState<CurrencyData>(CURRENCIES.USD)
  const [idrRate, setIdrRate] = useState<number>(CURRENCIES.IDR.rate)
  const [isIdrRateLoading, setIsIdrRateLoading] = useState(false)
  const [shouldFetchIdrRate, setShouldFetchIdrRate] = useState(fetchIdrRateImmediately)

  useEffect(() => {
    if (!fetchIdrRateImmediately && !shouldFetchIdrRate) return
    let cancelled = false
    setIsIdrRateLoading(true)
    fetchExchangeRate().then((rate) => {
      if (!cancelled) {
        setIdrRate(rate)
        setCurrency((prev) =>
          prev.symbol === CURRENCIES.IDR.symbol
            ? { ...prev, rate }
            : prev
        )
      }
    }).finally(() => {
      if (!cancelled) setIsIdrRateLoading(false)
    })
    return () => { cancelled = true }
  }, [shouldFetchIdrRate, fetchIdrRateImmediately])

  const handleCurrencyChange = (value: string) => {
    if (value === "$") {
      setCurrency(CURRENCIES.USD)
    } else {
      setShouldFetchIdrRate(true)
      setCurrency({ symbol: CURRENCIES.IDR.symbol, rate: idrRate })
    }
  }

  const pricingData = {
    free: {
      price: (SUBSCRIPTION_PLANS.free.basePriceUSD * currency.rate).toLocaleString(),
      credits: SUBSCRIPTION_PLANS.free.credits,
    },
    basic: {
      productId: SUBSCRIPTION_PLANS.basic.productId!,
      price: (SUBSCRIPTION_PLANS.basic.basePriceUSD * currency.rate).toLocaleString(),
      credits: SUBSCRIPTION_PLANS.basic.credits,
    },
    pro: {
      productId: SUBSCRIPTION_PLANS.pro.productId!,
      price: (SUBSCRIPTION_PLANS.pro.basePriceUSD * currency.rate).toLocaleString(),
      credits: SUBSCRIPTION_PLANS.pro.credits,
    },
  }

  const featuresData: Feature[] = [
    {
      feature: "Included Credits (Per Month)",
      free: "0",
      basic: pricingData.basic.credits,
      pro: pricingData.pro.credits,
      description: "Credits included in your monthly subscription."
    },
    {
      feature: "Credits Expiration",
      free: "Never Expire",
      basic: "Never Expire",
      pro: "Never Expire",
      description: "Monthly and credit packs never expire, even if the subscription ends."
    },
    {
      feature: "Subtitle Translation",
      free: <Check className="size-5 mx-auto text-muted-foreground" />,
      basic: <Check className="size-5 mx-auto text-blue-500" />,
      pro: <Check className="size-5 mx-auto text-blue-500" />,
      description: "Translate subtitle (SRT & ASS) using any AI models available."
    },
    {
      feature: "Extract Context Feature",
      free: <Check className="size-5 mx-auto text-muted-foreground" />,
      basic: <Check className="size-5 mx-auto text-blue-500" />,
      pro: <Check className="size-5 mx-auto text-blue-500" />,
      description: "Analyze content to extract characters, settings, plot, and relationships."
    },
    {
      feature: "Audio Transcription",
      free: "Limited",
      basic: <Check className="size-5 mx-auto text-blue-500" />,
      pro: <Check className="size-5 mx-auto text-blue-500" />,
      description: "Convert into subtitle text. Free tier supports up to 100MB (1 file at a time). Basic & Pro tiers up to 1GB file (5 files at a time). Basic & Pro tiers supports background processing."
    },
    {
      feature: "Supported Languages",
      free: "100+ Languages",
      basic: "100+ Languages",
      pro: "100+ Languages",
      description: "Support translation for over 100+ languages."
    },
    {
      feature: "Custom Model Integration",
      free: <Check className="size-5 mx-auto text-muted-foreground" />,
      basic: <Check className="size-5 mx-auto text-blue-500" />,
      pro: <Check className="size-5 mx-auto text-blue-500" />,
      description: "Use your own LLM API within the Mitsuko platform."
    },
    {
      feature: "Save to Cloud",
      free: <X className="size-5 mx-auto text-muted-foreground" />,
      basic: <X className="size-5 mx-auto text-muted-foreground" />,
      pro: <Check className="size-5 mx-auto text-blue-500" />,
      description: "Securely save your projects, translated files, extraction, and audio transcription file to cloud."
    },
    {
      feature: "Support",
      free: "Community",
      basic: "Priority Email",
      pro: "Priority Email",
      description: "Access support resources. Free tier relies on our Discord server, Basic and Pro gets priority email support."
    }
  ]

  return (
    <div id="pricing" className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          {useH1Title ? (
            <h1 className="text-4xl font-semibold mb-4 tracking-tight">
              Simple, Transparent Pricing
            </h1>
          ) : (
            <h2 className="text-4xl font-semibold mb-4 tracking-tight">
              Simple, Transparent Pricing
            </h2>
          )}
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Get exactly what you need with one-time credits. Zero subscriptions, zero hassle.
          </p>
        </div>

        <CurrencyTabs
          currentCurrencySymbol={currency.symbol}
          onCurrencyChange={handleCurrencyChange}
        />

        {false && <PricingCards
          currency={currency}
          pricingData={pricingData}
          redirectToPricingPage={redirectToPricingPage}
        />}

        {false && <FeatureComparisonTable
          currency={currency}
          pricingData={pricingData}
          featuresData={featuresData}
          showDescription={showDescription}
        />}

        <CreditPackPrices
          currency={currency}
          isIdrRateLoading={isIdrRateLoading}
          redirectToPricingPage={redirectToPricingPage}
        />

        <GeneralFeaturesSection />

        {showLink && (
          <div className="text-center text-sm text-muted-foreground mt-8">
            <Link href="/pricing" className="hover:underline hover:text-sidebar-primary">
              Click here to learn more about credits and pricing.
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}
