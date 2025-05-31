"use client"

import { Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { ProductId } from "@/types/product"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

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
}

export function CreditPackPrices({
  currency,
  creditPacks,
  handlePurchase,
  isPending,
  loadingProductId,
  redirectToPricingPage = false,
}: CreditPackPricesProps) {
  const router = useRouter()

  return (
    <div
      className="relative rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-6 shadow-sm"
    >
      <div id="credit-packs" className="absolute -top-24" />

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Need more credits? Purchase additional credit packs starting at just{" "}
        {currency.symbol}
        {(creditPacks[0]?.basePriceUSD * currency.rate || 0).toLocaleString()}
        . Available to all tiers, these credit packs provide flexibility for your
        usage needs. <strong>Credits purchased do not expire.</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {creditPacks.map((pack) => {
          const price = pack.basePriceUSD * currency.rate
          const savings = pack.discountUSD * currency.rate
          const isCurrentCardLoading = isPending && loadingProductId === pack.productId

          return (
            <Card
              key={pack.productId}
              className="relative flex flex-col h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md dark:hover:border-primary/70 border dark:border-gray-800 bg-white dark:bg-gray-900/20"
            >
              <CardHeader className="pb-1">
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {pack.baseCredits.toLocaleString()}
                  {" "}
                  <span className="text-muted-foreground text-sm">credits</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pb-4">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {currency.symbol}
                    {price.toLocaleString()}
                  </span>
                  {savings > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-1">
                      Save {currency.symbol}{(() => {
                        if (savings > 1000) {
                          return (savings / 1000) + 'k'
                        }
                        return savings.toLocaleString()
                      })()}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  Credits never expire!
                </div>
              </CardContent>
              <CardFooter>
                {redirectToPricingPage ? (
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => router.push("/pricing")}
                  >
                    See Details
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handlePurchase(pack.productId)}
                    disabled={isPending}
                  >
                    {isCurrentCardLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Purchasing...
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}