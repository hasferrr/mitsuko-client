"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSnapStore } from "@/stores/use-snap-store"
import { ProductId } from "@/types/product"
import { CreditCard, ExternalLink, Loader2 } from "lucide-react"
import { useSnapPayment } from "@/hooks/use-snap-payment"
import { toast } from "sonner"
import { useTransition, useState, useEffect } from "react"
import { sleep } from "@/lib/utils"
import { createSnapPayment } from "@/lib/api/create-snap-payment"

interface PaymentOptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  token: string | null
  redirectUrl: string | null
  userId: string
  productId: ProductId
}

export function PaymentOptionsDialog({
  isOpen,
  onClose,
  token: initialToken,
  redirectUrl: initialRedirectUrl,
  userId,
  productId,
}: PaymentOptionsDialogProps) {
  const [isResetting, startResetTransition] = useTransition()
  const [isFetchingPayment, setIsFetchingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const { removeSnapData, setSnapData } = useSnapStore()
  const { initiatePaymentPopup } = useSnapPayment()

  useEffect(() => {
    setPaymentError(null)
  }, [isOpen, initialToken, initialRedirectUrl])

  const fetchAndProceed = async (action: 'popup' | 'newTab') => {
    setIsFetchingPayment(true)
    setPaymentError(null)
    try {
      console.log(`Fetching new payment data for ${productId} before ${action}...`)
      const { data: apiResult } = await createSnapPayment(productId)
      setSnapData(userId, productId, apiResult)
      console.log(`Successfully fetched data for ${productId}. Proceeding with ${action}.`)
      if (action === 'popup') {
        onClose()
        initiatePaymentPopup(apiResult.token, userId, productId)
      } else {
        window.open(apiResult.redirect_url, '_blank')
        onClose()
      }
    } catch (error) {
      console.error("Failed to create/fetch payment link:", error)
      setPaymentError("Failed to prepare payment. Please try again or contact support.")
      toast.error("Failed to initiate payment.")
    } finally {
      setIsFetchingPayment(false)
    }
  }

  const handlePopup = () => {
    if (initialToken) {
      console.log("Using existing token for popup.")
      onClose()
      initiatePaymentPopup(initialToken, userId, productId)
    } else {
      fetchAndProceed('popup')
    }
  }

  const handleNewTab = () => {
    if (initialRedirectUrl) {
      console.log("Using existing redirect URL for new tab.")
      window.open(initialRedirectUrl, '_blank')
      onClose()
    } else {
      fetchAndProceed('newTab')
    }
  }

  const handleReset = () => {
    startResetTransition(async () => {
      removeSnapData(userId, productId)
      console.log(`Cleared payment data for user ${userId}, product ${productId}`)
      toast.info("Payment session reset.")
      await sleep(250)
      onClose()
    })
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>
            Please select a payment method to continue.
            {paymentError && <p className="text-red-500 text-sm mt-2">{paymentError}</p>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <button
            onClick={handlePopup}
            disabled={isFetchingPayment}
            className="flex items-start w-full p-4 border rounded-lg text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingPayment ? (
              <Loader2 className="w-6 h-6 mr-4 text-blue-500 flex-shrink-0 mt-1 animate-spin" />
            ) : (
              <CreditCard className="w-6 h-6 mr-4 text-blue-500 flex-shrink-0 mt-1" />
            )}
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">Pay in Popup Window</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">RECOMMENDED</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isFetchingPayment ? "Preparing secure payment..." : "Continue payment securely in a pop-up window using various methods (Card, VA, Bank Transfer, etc.)."}
              </p>
            </div>
          </button>

          <button
            onClick={handleNewTab}
            disabled={isFetchingPayment}
            className="flex items-start w-full p-4 border rounded-lg text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isFetchingPayment ? (
              <Loader2 className="w-6 h-6 mr-4 text-gray-500 flex-shrink-0 mt-1 animate-spin" />
            ) : (
              <ExternalLink className="w-6 h-6 mr-4 text-gray-500 flex-shrink-0 mt-1" />
            )}
            <div className="flex-grow">
              <div className="font-medium text-sm mb-1">Open Payment Link</div>
              <p className="text-xs text-muted-foreground">
                {isFetchingPayment ? "Preparing secure payment link..." : "Open the Midtrans payment page in new tab."}
              </p>
            </div>
          </button>
        </div>
        <DialogFooter className="flex flex-row justify-between w-full sm:justify-between">
          <Button onClick={handleReset} variant="destructive" size="sm" disabled={isResetting || isFetchingPayment}>
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Payment"
            )}
          </Button>
          <Button onClick={onClose} variant="ghost" size="sm">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}