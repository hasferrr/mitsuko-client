"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { useState, useTransition, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { ProductId } from "@/types/product"
import { useSnapStore } from "@/stores/use-snap-store"
import { PaymentOptionsDialog } from "./payment-options-dialog"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { PricingCards } from "./pricing-cards"
import { FeatureComparisonTable } from "./feature-comparison-table"
import { CreditPackPrices } from "./credit-pack-prices"
import { GeneralFeaturesSection } from "./general-features-section"

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
  useH1Title?: boolean
  redirectToPricingPage?: boolean
  showDescription?: boolean
  showLink?: boolean
}

const USD = { symbol: "$", rate: 1 }
const IDR = { symbol: "Rp", rate: 17000 }

export default function PricingSection({
  useH1Title,
  redirectToPricingPage,
  showDescription,
  showLink,
}: PricingSectionProps) {
  const [currency, setCurrency] = useState<Currency>(USD)
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingProductId, setLoadingProductId] = useState<ProductId | null>(null)
  const [dialogData, setDialogData] = useState<{
    token: string | null
    redirectUrl: string | null
    userId: string | null
    productId: ProductId
    price: number
    credits: number
    currencySymbol: string
    currencyRate: number
  } | null>(null)

  const session = useSessionStore((state) => state.session)

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const handleCurrencyChange = (value: string) => {
    setCurrency(value === "$" ? USD : IDR)
  }

  const pricingData = {
    free: {
      price: (0 * currency.rate).toLocaleString(),
      credits: "0",
    },
    basic: {
      productId: "basic_monthly" as const,
      price: (5 * currency.rate).toLocaleString(),
      credits: "5,000,000",
    },
    pro: {
      productId: "pro_monthly" as const,
      price: (20 * currency.rate).toLocaleString(),
      credits: "22,000,000",
    },
  }

  const creditPacks = [
    {
      productId: "credit_pack_2m" as const,
      baseCredits: 2_000_000,
      basePriceUSD: 2,
      discountUSD: 0,
    },
    {
      productId: "credit_pack_10m" as const,
      baseCredits: 10_000_000,
      basePriceUSD: 10,
      discountUSD: 0,
    },
    {
      productId: "credit_pack_20m" as const,
      baseCredits: 20_000_000,
      basePriceUSD: 19, // Discounted price
      discountUSD: 1,
    },
    {
      productId: "credit_pack_50m" as const,
      baseCredits: 50_000_000,
      basePriceUSD: 45, // Discounted price
      discountUSD: 5,
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
      basic: "Priority Email",
      pro: "Priority Email",
      description: "Access support resources. Free tier relies on our Discord server, Basic and Pro gets priority email support."
    }
  ]

  const handlePurchase = async (productId: ProductId) => {
    const getSnapData = useSnapStore.getState().getSnapData
    const removeSnapData = useSnapStore.getState().removeSnapData
    const clearSnapData = useSnapStore.getState().clearSnapData

    setLoadingProductId(productId)
    startTransition(async () => {
      let token: string | null = null
      let redirectUrl: string | null = null
      let userId: string | null = null

      try {
        userId = session?.user.id ?? null

        const packData = creditPacks.find(p => p.productId === productId)
        if (!packData) {
          console.error(`Product data not found for productId: ${productId}`)
          toast.error("Product information not available. Please try again later.")
          return
        }

        if (userId) {
          const existingData = getSnapData(userId, productId)
          const isDataValid = !!existingData && existingData.expiresAt >= new Date()

          if (isDataValid) {
            console.log("Using existing valid Snap data for", productId)
            token = existingData.token
            redirectUrl = existingData.redirect_url
          } else {
            if (existingData) {
              console.log("Existing Snap data expired for", productId)
              removeSnapData(userId, productId)
            }
            console.log("No valid Snap data found for", productId, ". Dialog will fetch.")
            token = null
            redirectUrl = null
          }
        } else {
          clearSnapData()
          console.log("User not authenticated, skipping snap data check.")
          token = null
          redirectUrl = null
        }

        setDialogData({
          token: token,
          redirectUrl: redirectUrl,
          userId: userId,
          productId: productId,
          price: packData.basePriceUSD,
          credits: packData.baseCredits,
          currencySymbol: currency.symbol,
          currencyRate: currency.rate,
        })
        setIsDialogOpen(true)

      } catch (error) {
        console.error("Error during purchase preparation:", error)
        toast.error("An error occurred while preparing your purchase. Please try again.")
      } finally {
        setLoadingProductId(null)
      }
    })
  }

  return (
    <div id="pricing" ref={ref} className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          {useH1Title ? (
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Simple, Transparent <span className="text-blue-400">Pricing</span>
            </h1>
          ) : (
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Simple, Transparent <span className="text-blue-400">Pricing</span>
            </h2>
          )}
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Find the perfect plan for your needs. We offer monthly subscription and credit packs.
          </p>
        </motion.div>

        {/* Currency Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center mb-8"
        >
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
        </motion.div>

        {/* Pricing Cards */}
        {false && <PricingCards
          currency={currency}
          pricingData={pricingData}
          redirectToPricingPage={redirectToPricingPage}
          isInView={isInView}
        />}

        {/* Feature Comparison Table */}
        {false && <FeatureComparisonTable
          currency={currency}
          pricingData={pricingData}
          featuresData={featuresData}
          showDescription={showDescription}
          isInView={isInView}
        />}

        {/* Credit Pack Prices */}
        <CreditPackPrices
          currency={currency}
          creditPacks={creditPacks}
          handlePurchase={handlePurchase}
          isPending={isPending}
          loadingProductId={loadingProductId}
          redirectToPricingPage={redirectToPricingPage}
          isInView={isInView}
        />

        {/* Use the new GeneralFeaturesSection component */}
        <GeneralFeaturesSection isInView={isInView} />

        {/* More Information */}
        {showLink && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
            <Link href="/pricing" className="hover:underline hover:text-primary">
              Click here to learn more about credits and pricing.
            </Link>
          </div>
        )}
      </div>

      {/* Render the Dialog */}
      {dialogData && (
        <PaymentOptionsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          userId={dialogData.userId}
          productId={dialogData.productId}
          price={dialogData.price}
          credits={dialogData.credits}
          currencySymbol={dialogData.currencySymbol}
          currencyRate={dialogData.currencyRate}
        />
      )}
    </div>
  )
}

