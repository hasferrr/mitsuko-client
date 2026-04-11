"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ComingSoonTooltipWrapper } from "@/components/ui-custom/coming-soon-tooltip-wrapper"
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
      <Card className="overflow-hidden shadow-xs hover:shadow-md transition-shadow">
        <CardContent className="px-6 space-y-6">
          <h3 className="text-xl font-bold">Free</h3>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{currency.symbol}{pricingData.free.price}</span>
            <span className="text-muted-foreground mb-1">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Access to most features with some limitations. Purchase credits as needed.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" className="w-full">
              Get Started
            </Button>
          </Link>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Subtitle Translation
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Limited Audio Transcription
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Extract Context Feature
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Custom Model Integration
              </span>
            </div>
            <div className="flex items-start gap-2">
              <X className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                {pricingData.free.credits} Monthly Credits
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Tier */}
      <div className="rounded-xl bg-card border-2 border-blue-400 dark:border-blue-500 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-card-foreground">Basic</h3>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-3xl font-bold text-card-foreground">{currency.symbol}{pricingData.basic.price}</span>
            <span className="text-muted-foreground mb-1">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Fewer limitations and monthly credit grant. Email support included.
          </p>
          {redirectToPricingPage ? (
            <Button
              className="w-full mb-6"
              onClick={() => router.push("/pricing")}
            >
              Go to Pricing Page
            </Button>
          ) : (
            <ComingSoonTooltipWrapper>
              <Button
                disabled
                className={cn(
                  "w-full cursor-not-allowed opacity-50 mb-6"
                )}
                onClick={(e) => e.preventDefault()}
              >
                Coming Soon
              </Button>
            </ComingSoonTooltipWrapper>
          )}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                <strong>{pricingData.basic.credits}</strong> Monthly Credits
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Full Audio Transcription
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Priority Email Support
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Custom Model Integration
              </span>
            </div>
            <div className="flex items-start gap-2">
              <X className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Save to Cloud
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tier */}
      <Card className="overflow-hidden shadow-xs hover:shadow-md transition-shadow">
        <CardContent className="px-6 space-y-6">
          <h3 className="text-xl font-bold">Pro</h3>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{currency.symbol}{pricingData.pro.price}</span>
            <span className="text-muted-foreground mb-1">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Maximum features with priority support and cloud saving.
          </p>
          {redirectToPricingPage ? (
            <Button
              className="w-full"
              onClick={() => router.push("/pricing")}
            >
              Go to Pricing Page
            </Button>
          ) : (
            <ComingSoonTooltipWrapper>
              <Button
                disabled
                className={cn(
                  "w-full cursor-not-allowed opacity-50"
                )}
                onClick={(e) => e.preventDefault()}
              >
                Coming Soon
              </Button>
            </ComingSoonTooltipWrapper>
          )}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                <strong>{pricingData.pro.credits}</strong> Monthly Credits
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Full Audio Transcription
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Priority Email Support
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Custom Model Integration
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Save to Cloud
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

