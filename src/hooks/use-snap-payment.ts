"use client"

import { useCallback } from "react"
import { ProductId } from "@/types/product"
import { SnapTransactionResult } from "@/types/snap"
import { useSnapStore } from "@/stores/use-snap-store"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function useSnapPayment() {
  const removeSnapData = useSnapStore((state) => state.removeSnapData)
  const router = useRouter()

  const initiatePaymentPopup = useCallback((token: string, userId: string, productId: ProductId) => {
    if (!window.snap) {
      console.error('Snap.js script is not loaded yet.')
      toast.error("Payment service is currently unavailable. Please try again later.")
      return
    }

    toast.dismiss()
    window.snap.pay(token, {
      language: "en",
      onSuccess: (result: SnapTransactionResult) => {
        console.log("payment success!", result)
        removeSnapData(userId, productId)

        toast.success("Payment Successful!", {
          description: "Your credits have been added. Check your account details.",
          action: {
            label: "View Account",
            onClick: () => router.push('/auth/login')
          },
        })
      },
      onPending: (result: SnapTransactionResult) => {
        console.log("waiting your payment!", result)
        toast.dismiss()
      },
      onError: (result: SnapTransactionResult) => {
        console.error("payment failed!", result)
        toast.dismiss()
        toast.error("Payment Failed", {
          description: result.status_message || "An error occurred during payment. Please try again.",
        })
      },
      onClose: () => {
        console.log('you closed the popup without finishing the payment')
        toast.dismiss()
      }
    })
  }, [removeSnapData, router])

  return { initiatePaymentPopup }
}
