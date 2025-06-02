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
        . Available to all tiers, these credit packs provide flexibility for your
        usage needs. <strong>Credits purchased do not expire.</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CREDIT_PACKS.map((pack) => {
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