"use client"

import { Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { ProductId } from "@/types/product"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useState, useTransition } from "react"
import { useSnapStore } from "@/stores/use-snap-store"
import { PaymentOptionsDialog } from "./payment-options-dialog"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { CREDIT_PACKS } from "@/constants/pricing"
import { CurrencyData } from "@/types/pricing"

interface CreditPackPricesProps {
  currency: CurrencyData
  redirectToPricingPage?: boolean
}

export function CreditPackPrices({
  currency,
  redirectToPricingPage = false,
}: CreditPackPricesProps) {
  const router = useRouter()
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

        const packData = CREDIT_PACKS.find(p => p.productId === productId)
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
    <div className="relative rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-6 shadow-sm">
      <div id="credit-packs" className="absolute -top-24" />

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Need more credits? Purchase additional credit packs starting at just{" "}
        {currency.symbol}
        {(CREDIT_PACKS[0]?.basePriceUSD * currency.rate || 0).toLocaleString()}
        . These credit packs provide flexibility for your
        usage needs. Credits valid for a whole year from purchase!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CREDIT_PACKS.map((pack) => {
          const price = pack.basePriceUSD * currency.rate
          const savings = pack.discountUSD * currency.rate
          const isCurrentCardLoading = isPending && loadingProductId === pack.productId

          return (
            <Card
              key={pack.productId}
              className="relative border-t-4 border-t-blue-500 border-r border-b border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 rounded-md shadow-sm hover:border-blue-400 hover:dark:border-blue-600 transition-colors duration-200"
            >
              <CardHeader className="pb-0 pt-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Pack</span>
                  {savings > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                      Save {currency.symbol}{(() => {
                        if (savings > 1000) {
                          return (savings / 1000) + 'k'
                        }
                        return savings.toLocaleString()
                      })()}
                    </span>
                  )}
                </div>
                <div className="text-xl font-medium text-gray-900 dark:text-white">
                  {pack.baseCredits.toLocaleString()}
                  <span className="text-gray-500 dark:text-gray-400 text-sm"> credits</span>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-4">
                <div className="flex items-center gap-2">
                  {savings > 0 ? (
                    <>
                      <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                        {currency.symbol}{(() => {
                          const originalPrice = price + savings
                          if (originalPrice > 1000) {
                            return (originalPrice / 1000) + 'k'
                          }
                          return originalPrice.toLocaleString()
                        })()}
                      </span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {currency.symbol}{price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {currency.symbol}{price.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                {redirectToPricingPage ? (
                  <Button
                    className="w-full bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-500 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
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