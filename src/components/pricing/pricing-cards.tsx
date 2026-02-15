"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { ComingSoonTooltipWrapper } from "@/components/coming-soon-tooltip-wrapper"
import { useRouter } from "next/navigation"

interface Currency {
  symbol: string
  rate: number
}

interface PricingData {
  free: { price: string; credits: string }
  basic: { productId: string; price: string; credits: string }
  pro: { productId: string; price: string; credits: string }
}

interface PricingCardsProps {
  currency: Currency
  pricingData: PricingData
  redirectToPricingPage?: boolean
}

export function PricingCards({
  currency,
  pricingData,
  redirectToPricingPage = false,
}: PricingCardsProps) {
  const router = useRouter()

  return (
    <div
      className="relative grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16"
    >
      <div id="pricing-cards" className="absolute -top-24" />
      {/* Free Tier */}
      <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Free</h3>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{currency.symbol}{pricingData.free.price}</span>
            <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Access to most features with some limitations. Purchase credits as needed.
          </p>
          <Link href="/dashboard">
            <Button className="w-full py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-6">
              Get Started
            </Button>
          </Link>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Subtitle Translation
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Limited Audio Transcription
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Extract Context Feature
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Custom Model Integration
              </span>
            </div>
            <div className="flex items-start gap-2">
              <X className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {pricingData.free.credits} Monthly Credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Tier */}
      <div className="rounded-xl bg-white dark:bg-gray-900/30 border-2 border-blue-400 dark:border-blue-500 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Basic</h3>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{currency.symbol}{pricingData.basic.price}</span>
            <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Fewer limitations and monthly credit grant. Email support included.
          </p>
          {redirectToPricingPage ? (
            <Button
              className={cn(
                "w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-6",
              )}
              onClick={() => router.push("/pricing")}
            >
              Go to Pricing Page
            </Button>
          ) : (
            <ComingSoonTooltipWrapper>
              <Button
                disabled
                className={cn(
                  "w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                  "cursor-not-allowed opacity-50 mb-6"
                )}
                onClick={(e) => e.preventDefault()}
              >
                Coming Soon
              </Button>
            </ComingSoonTooltipWrapper>
          )}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                <strong>{pricingData.basic.credits}</strong> Monthly Credits
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Full Audio Transcription
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Priority Email Support
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Custom Model Integration
              </span>
            </div>
            <div className="flex items-start gap-2">
              <X className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Save to Cloud
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tier */}
      <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pro</h3>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{currency.symbol}{pricingData.pro.price}</span>
            <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Maximum features with priority support and cloud saving.
          </p>
          {redirectToPricingPage ? (
            <Button
              className={cn(
                "w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-6",
              )}
              onClick={() => router.push("/pricing")}
            >
              Go to Pricing Page
            </Button>
          ) : (
            <ComingSoonTooltipWrapper>
              <Button
                disabled
                className={cn(
                  "w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                  "cursor-not-allowed opacity-50 mb-6"
                )}
                onClick={(e) => e.preventDefault()}
              >
                Coming Soon
              </Button>
            </ComingSoonTooltipWrapper>
          )}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                <strong>{pricingData.pro.credits}</strong> Monthly Credits
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Full Audio Transcription
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Priority Email Support
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Custom Model Integration
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Save to Cloud
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

