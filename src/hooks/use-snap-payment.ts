import { useCallback } from 'react'
import { ProductId } from "@/types/product"
import { SnapTransactionResult } from "@/types/snap"
import { useSnapStore } from "@/stores/use-snap-store"

/**
 * Custom hook to manage Midtrans Snap payment initiation.
 * Provides a function to open the Snap popup and handles callbacks.
 */
export function useSnapPayment() {
  const removeSnapData = useSnapStore((state) => state.removeSnapData)

  const initiatePaymentPopup = useCallback((token: string, userId: string, productId: ProductId) => {
    if (!window.snap) {
      console.error('Snap.js script is not loaded yet.')
      return
    }

    window.snap.pay(token, {
      language: "en",
      onSuccess: (result: SnapTransactionResult) => {
        console.log("payment success!", result)
        removeSnapData(userId, productId)
        // TODO: Add success feedback / redirection
      },
      onPending: (result: SnapTransactionResult) => {
        console.log("waiting your payment!", result)
        // TODO: Add pending feedback
      },
      onError: (result: SnapTransactionResult) => {
        console.error("payment failed!", result)
        removeSnapData(userId, productId)
        // TODO: Add error feedback
      },
      onClose: () => {
        console.log('you closed the popup without finishing the payment')
      }
    })
  }, [removeSnapData])

  return { initiatePaymentPopup }
}
