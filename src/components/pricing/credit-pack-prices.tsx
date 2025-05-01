"use client"

import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { ProductId } from "@/types/product"

interface Currency {
  symbol: string
  rate: number
}

interface CreditPack {
  productId: ProductId
  baseCredits: number
  basePriceUSD: number
  discountUSD: number
}

interface CreditPackPricesProps {
  currency: Currency
  creditPacks: CreditPack[]
  handlePurchase: (productId: ProductId) => void
  isPending: boolean
  loadingProductId: ProductId | null
  redirectToPricingPage?: boolean
  isInView: boolean
}

export function CreditPackPrices({
  currency,
  creditPacks,
  handlePurchase,
  isPending,
  loadingProductId,
  redirectToPricingPage = false,
  isInView,
}: CreditPackPricesProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-6 shadow-sm"
    >
      <div id="credit-packs" className="absolute -top-24" />
      <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        Credit Pack Prices
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Need more credits? Purchase additional credit packs starting at just {currency.symbol}{(creditPacks[0].basePriceUSD * currency.rate).toLocaleString()}. Available to all tiers, these
        credit packs provide flexibility for your usage needs. <strong>Credits purchased do not expire.</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {creditPacks.map((pack, index) => (
          <div key={index} className="flex flex-col gap-1 justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800">
            <div className="flex gap-2 justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {pack.baseCredits.toLocaleString()} credits
              </span>
              <span className="text-gray-900 dark:text-white font-bold">
                {currency.symbol}{(pack.basePriceUSD * currency.rate).toLocaleString()}
              </span>
            </div>
            {pack.discountUSD > 0 && (
              <div className="text-xs text-green-600 dark:text-green-400">Save {currency.symbol}{(pack.discountUSD * currency.rate).toLocaleString()}</div>
            )}
            {redirectToPricingPage ? (
              <Button
                className="w-full mt-2 py-1.5 px-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm"
                onClick={() => router.push("/pricing")}
              >
                Go to Pricing Page
              </Button>
            ) : (
              <Button
                className="w-full mt-2 py-1.5 px-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm"
                onClick={() => handlePurchase(pack.productId)}
                disabled={isPending}
              >
                {isPending && loadingProductId === pack.productId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Purchasing...
                  </>
                ) : (
                  "Purchase"
                )}
              </Button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}