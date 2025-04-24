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
import { CreditCard, ExternalLink } from "lucide-react"
import { useSnapPayment } from "@/hooks/use-snap-payment"

interface PaymentOptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  token: string
  redirectUrl: string
  userId: string
  productId: ProductId
}

export function PaymentOptionsDialog({
  isOpen,
  onClose,
  token,
  redirectUrl,
  userId,
  productId,
}: PaymentOptionsDialogProps) {
  const removeSnapData = useSnapStore((state) => state.removeSnapData)
  const { initiatePaymentPopup } = useSnapPayment()

  const handlePopup = () => {
    onClose()
    initiatePaymentPopup(token, userId, productId)
  }

  const handleNewTab = () => {
    window.open(redirectUrl, '_blank')
    onClose()
  }

  const handleReset = () => {
    removeSnapData(userId, productId)
    console.log(`Cleared payment data for user ${userId}, product ${productId}`)
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mitsuko Payment</DialogTitle>
          <DialogDescription>
            Please select a payment method to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <button
            onClick={handlePopup}
            className="flex items-start w-full p-4 border rounded-lg text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-150"
          >
            <CreditCard className="w-6 h-6 mr-4 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">Pay with Midtrans Snap</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">RECOMMENDED</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Continue payment securely in a pop-up window using various methods (Card, VA, Bank Transfer, etc.).
              </p>
            </div>
          </button>

          <button
            onClick={handleNewTab}
            className="flex items-start w-full p-4 border rounded-lg text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-150"
          >
            <ExternalLink className="w-6 h-6 mr-4 text-gray-500 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <div className="font-medium text-sm mb-1">Open Payment Link</div>
              <p className="text-xs text-muted-foreground">
                Open the Midtrans payment page directly in a new browser tab.
              </p>
            </div>
          </button>
        </div>
        <DialogFooter className="flex flex-row justify-between w-full pt-2 sm:justify-between">
          <Button onClick={handleReset} variant="destructive" size="sm">Reset Link</Button>
          <Button onClick={onClose} variant="ghost" size="sm">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}