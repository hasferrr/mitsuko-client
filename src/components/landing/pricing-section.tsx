"use client"

import Link from "next/link"
import { Check, Info, X } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Currency {
  symbol: string
  rate: number
}

interface Feature {
  feature: string
  free: React.ReactNode
  basic: React.ReactNode
  pro: React.ReactNode
  description: string
}

interface PricingSectionProps {
  showDescription?: boolean
  showLink?: boolean
}

const USD = { symbol: "$", rate: 1 }
const IDR = { symbol: "Rp", rate: 16800 }

export default function PricingSection({
  showDescription = false,
  showLink = true,
}: PricingSectionProps) {
  const [currency, setCurrency] = useState<Currency>(IDR)

  const handleCurrencyChange = (value: string) => {
    setCurrency(value === "$" ? USD : IDR)
  }

  const pricingData = {
    free: {
      price: (0 * currency.rate).toLocaleString(),
      credits: "0",
    },
    basic: {
      price: (5 * currency.rate).toLocaleString(),
      credits: "5,000,000",
    },
    pro: {
      price: (20 * currency.rate).toLocaleString(),
      credits: "22,000,000",
    },
  }

  const creditPacks = [
    {
      credits: "2,000,000",
      price: (2 * currency.rate).toLocaleString(),
    },
    {
      credits: "10,000,000",
      price: (10 * currency.rate).toLocaleString(),
    },
    {
      credits: "20,000,000",
      price: (19 * currency.rate).toLocaleString(),
      discount: (1 * currency.rate).toLocaleString(),
    },
    {
      credits: "50,000,000",
      price: (45 * currency.rate).toLocaleString(),
      discount: (5 * currency.rate).toLocaleString(),
    },
  ]

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
      free: <Check className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400" />,
      basic: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      pro: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      description: "Translate subtitle (SRT & ASS) using any AI models available."
    },
    {
      feature: "Extract Context Feature",
      free: <Check className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400" />,
      basic: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      pro: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      description: "Analyze content to extract characters, settings, plot, and relationships."
    },
    {
      feature: "Audio Transcription",
      free: "Limited",
      basic: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      pro: <Check className="w-5 h-5 mx-auto text-blue-500" />,
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
      free: <Check className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400" />,
      basic: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      pro: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      description: "Use your own LLM API within the Mitsuko platform."
    },
    {
      feature: "Save to Cloud",
      free: <X className="w-5 h-5 mx-auto text-gray-400 dark:text-gray-500" />,
      basic: <X className="w-5 h-5 mx-auto text-gray-400 dark:text-gray-500" />,
      pro: <Check className="w-5 h-5 mx-auto text-blue-500" />,
      description: "Securely save your projects, translated files, extraction, and audio transcription file to cloud."
    },
    {
      feature: "Support",
      free: "Community",
      basic: "Email",
      pro: "Priority Email",
      description: "Access support resources. Free tier relies on community forums, Basic gets email support, Pro gets prioritized email support."
    }
  ]

  return (
    <div id="pricing" className="bg-gray-50 dark:bg-black py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Simple, Transparent <span className="text-blue-400">Pricing</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Find the perfect plan for your needs. We offer monthly subscription and credit packs.
          </p>
        </div>

        {/* Currency Tabs */}
        <div className="flex justify-center items-center mb-8">
          <span className="text-gray-600 dark:text-gray-400 mr-2">Show currency in</span>
          <Tabs
            defaultValue={USD.symbol}
            value={currency.symbol}
            onValueChange={handleCurrencyChange}
            className="w-auto"
          >
            <TabsList className="bg-gray-200 dark:bg-muted text-primary">
              <TabsTrigger value={USD.symbol}>USD</TabsTrigger>
              <TabsTrigger value={IDR.symbol}>IDR</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="relative grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div id="pricing-cards" className="absolute -top-24" />
          {/* Free Tier */}
          <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden">
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
          <div className="rounded-xl bg-white dark:bg-gray-900/30 border-2 border-blue-400 dark:border-blue-500 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Basic</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{currency.symbol}{pricingData.basic.price}</span>
                <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Fewer limitations and monthly credit grant. Email support included.
              </p>
              <div className="cursor-not-allowed">
                <Button disabled className="w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-6">
                  {/* Subscribe Now */}
                  Coming Soon
                </Button>
              </div>
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
                    Email Support
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
          <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pro</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{currency.symbol}{pricingData.pro.price}</span>
                <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Maximum features with priority support and cloud saving.
              </p>
              <div className="cursor-not-allowed">
                <Button disabled className="w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-6">
                  {/* Go Pro */}
                  Coming Soon
                </Button>
              </div>
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

        {/* Feature Comparison Table */}
        <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Feature Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/30">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Feature/Limit
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Free
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Basic ({currency.symbol}{pricingData.basic.price}/mo)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pro ({currency.symbol}{pricingData.pro.price}/mo)
                  </th>
                  {showDescription && (
                    <th className="w-72 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {featuresData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        {item.feature}
                        {!showDescription && (
                          <TooltipProvider delayDuration={50}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p>{item.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                    <td className={cn("px-4 py-3 text-sm text-center", typeof item.free !== "string" && "text-gray-600 dark:text-gray-400")}>
                      {item.free}
                    </td>
                    <td className={cn("px-4 py-3 text-sm text-center", typeof item.basic !== "string" && "text-gray-600 dark:text-gray-400")}>
                      {item.basic}
                    </td>
                    <td className={cn("px-4 py-3 text-sm text-center", typeof item.pro !== "string" && "text-gray-600 dark:text-gray-400")}>
                      {item.pro}
                    </td>
                    {showDescription && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left align-top">
                        <p>{item.description}</p>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Pack Prices */}
        <div className="relative rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-6">
          <div id="credit-packs" className="absolute -top-24" />
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            Credit Pack Prices
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Need more credits? Purchase additional credit packs starting at just {currency.symbol}{creditPacks[0].price}. Available to all tiers, these
            credit packs provide flexibility for your usage needs. <strong>Credits purchased do not expire.</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {creditPacks.map((pack, index) => (
              <div key={index} className="flex flex-col gap-1 justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800">
                <div className="flex gap-2 justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pack.credits} credits
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {currency.symbol}{pack.price}
                  </span>
                </div>
                {pack.discount && (
                  <div className="text-xs text-green-600 dark:text-green-400">Save {currency.symbol}{pack.discount}</div>
                )}
                <div className="cursor-not-allowed">
                  <Button disabled className="w-full mt-2 py-1.5 px-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm">
                    {/* Purchase */}
                    Coming Soon
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* More Information */}
        {showLink && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
            <Link href="/pricing" className="hover:underline hover:text-primary">
              Click here to learn more about credits and pricing.
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

