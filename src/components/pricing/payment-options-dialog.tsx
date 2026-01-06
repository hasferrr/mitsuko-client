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
import { CreditCard, Loader2, Minus, Plus } from "lucide-react"
import { useSnapPayment } from "@/hooks/use-snap-payment"
import { useLemonSqueezyCache } from "@/hooks/use-lemonsqueezy-cache"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { sleep } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPaymentLink } from "@/lib/api/create-snap-payment"
import LemonSqueezyLogo from "@/static/lemonsqueezy.svg"
import Image from "next/image"

const MIN_QUANTITY = 1
const MAX_QUANTITY = 10

interface PaymentOptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  productId: ProductId
  price: number
  credits: number
  currencySymbol: string
  currencyRate: number
}

export function PaymentOptionsDialog({
  isOpen,
  onClose,
  userId,
  productId,
  price,
  credits,
  currencySymbol,
  currencyRate,
}: PaymentOptionsDialogProps) {
  const [isResetting, setIsResetting] = useState(false)
  const [isFetchingPayment, setIsFetchingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [inputQuantity, setInputQuantity] = useState(1)
  const lemonSqueezyCache = useLemonSqueezyCache()

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const incrementIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const decrementIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { initiatePaymentPopup } = useSnapPayment()

  const getSnapData = useSnapStore((state) => state.getSnapData)
  const removeSnapData = useSnapStore((state) => state.removeSnapData)
  const setSnapData = useSnapStore((state) => state.setSnapData)

  const snapData = !!userId ? getSnapData(userId, productId) : undefined
  const currentQuantity = snapData?.quantity ?? inputQuantity
  const basePriceInCurrency = price * currencyRate
  const totalCost = basePriceInCurrency * currentQuantity
  const totalCredits = credits * currentQuantity

  useEffect(() => {
    if (snapData?.quantity) {
      setInputQuantity(snapData.quantity)
    }
  }, [snapData])

  useEffect(() => {
    setPaymentError(null)
  }, [isOpen, productId])

  const fetchAndProceed = async (paymentType: 'snap' | 'lemonsqueezy') => {
    if (!userId) {
      toast.error("Please sign in to proceed.")
      return
    }
    setPaymentError(null)
    setIsFetchingPayment(true)
    try {
      console.log(`Fetching new payment data for ${productId} (Qty: ${inputQuantity}) before ${paymentType}...`)
      const apiResult = await createPaymentLink(productId, inputQuantity, paymentType)
      if (paymentType === 'snap') {
        setSnapData(userId, productId, apiResult, inputQuantity)
      } else {
        lemonSqueezyCache.set(productId, inputQuantity, apiResult.redirect_url)
      }
      console.log(`Successfully fetched data for ${productId} (Qty: ${inputQuantity}). Proceeding with ${paymentType}.`)
      if (paymentType === 'snap') {
        onClose()
        await sleep(100)
        initiatePaymentPopup(apiResult.token, userId, productId)
      } else {
        window.open(apiResult.redirect_url, '_blank')
        onClose()
      }
    } catch (error) {
      console.error("Failed to create/fetch payment link:", error instanceof Error ? error.message : "")
      setPaymentError("Failed to prepare payment. Please try again or contact support.")
      if (paymentType === 'snap') {
        removeSnapData(userId, productId)
      }
      toast.error("Failed to initiate payment.")
    } finally {
      setIsFetchingPayment(false)
    }
  }

  const handlePopup = async () => {
    if (!userId) {
      toast.error("Please sign in to proceed.")
      return
    }
    if (snapData) {
      console.log("Using existing token for popup (Qty: 1).")
      onClose()
      initiatePaymentPopup(snapData.token, userId, productId)
    } else {
      await fetchAndProceed('snap')
    }
  }

  const handleNewTab = async () => {
    const cachedUrl = lemonSqueezyCache.get(`${productId}-${inputQuantity}`)
    if (cachedUrl) {
      window.open(cachedUrl, '_blank')
      onClose()
    } else {
      await fetchAndProceed('lemonsqueezy')
    }
  }

  const handleReset = () => {
    if (!userId) return
    setIsResetting(true)
    removeSnapData(userId, productId)
    lemonSqueezyCache.clear()
    console.log(`Cleared payment data for user ${userId}, product ${productId}`)
    setInputQuantity(1)
    toast.info("Payment session reset.")
    setIsResetting(false)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setInputQuantity(MIN_QUANTITY)
      setPaymentError(null)
      return
    }
    const newQuantity = parseInt(value, 10)
    if (!isNaN(newQuantity) && newQuantity >= MIN_QUANTITY && newQuantity <= MAX_QUANTITY) {
      setInputQuantity(newQuantity)
      setPaymentError(null)
    } else if (newQuantity < MIN_QUANTITY) {
      setInputQuantity(MIN_QUANTITY)
    } else if (newQuantity > MAX_QUANTITY) {
      setInputQuantity(MAX_QUANTITY)
    }
  }

  const handleDecrement = () => {
    setInputQuantity((prev) => Math.max(MIN_QUANTITY, prev - 1))
    setPaymentError(null)
  }

  const handleIncrement = () => {
    setInputQuantity((prev) => Math.min(MAX_QUANTITY, prev + 1))
    setPaymentError(null)
  }

  const clearTimers = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
    if (incrementIntervalRef.current) {
      clearInterval(incrementIntervalRef.current)
      incrementIntervalRef.current = null
    }
    if (decrementIntervalRef.current) {
      clearInterval(decrementIntervalRef.current)
      decrementIntervalRef.current = null
    }
  }

  const handleMouseDownDecrement = () => {
    clearTimers()
    handleDecrement() // Decrement once immediately
    holdTimeoutRef.current = setTimeout(() => {
      decrementIntervalRef.current = setInterval(() => {
        handleDecrement()
      }, 50) // Decrement every 100ms after initial hold
    }, 300) // Initial hold delay
  }

  const handleMouseDownIncrement = () => {
    clearTimers()
    handleIncrement() // Increment once immediately
    holdTimeoutRef.current = setTimeout(() => {
      incrementIntervalRef.current = setInterval(() => {
        handleIncrement()
      }, 50) // Increment every 100ms after initial hold
    }, 300) // Initial hold delay
  }

  const handleMouseUpOrLeave = () => {
    clearTimers()
  }

  // Cleanup timers on unmount or close
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{snapData ? "Continue Payment" : "Checkout"}</DialogTitle>
          <DialogDescription>
            Customize your purchase and select a payment method.
            <br />
            {paymentError && <span className="absolute text-red-500 text-sm">{paymentError}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-8 py-4 px-1 overflow-y-auto">
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
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
                  <span className="font-medium text-sm">Pay in IDR</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">RECOMMENDED</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFetchingPayment ? "Preparing secure payment..." : "Continue payment securely in IDR with no additional fee."}
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
                <Image
                  src={LemonSqueezyLogo}
                  alt="Lemon Squeezy"
                  width={24}
                  height={24}
                  className="w-6 h-6 mr-4 flex-shrink-0 mt-1"
                />
              )}
              <div className="flex-grow">
                <div className="font-medium text-sm mb-1">Pay with Lemon Squeezy</div>
                <p className="text-xs text-muted-foreground">
                  {isFetchingPayment ? "Preparing secure payment..." : "Proceed to Lemon Squeezy. A small fee applies."}
                </p>
              </div>
            </button>
          </div>

          <div className="flex-1 space-y-4 sm:border-l border-border sm:pl-8 px-2">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <p className="text-sm font-medium">{credits.toLocaleString()} Credit Pack</p>
              <p className="text-xs text-muted-foreground">
                Base Price: {currencySymbol}{(basePriceInCurrency).toLocaleString(undefined, {
                  minimumFractionDigits: currencySymbol === '$' ? 2 : 0,
                  maximumFractionDigits: currencySymbol === '$' ? 2 : 0
                })} / {credits.toLocaleString()} Credits per pack
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onMouseDown={handleMouseDownDecrement}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  disabled={inputQuantity <= MIN_QUANTITY || isFetchingPayment || isResetting || !!snapData}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min={MIN_QUANTITY.toString()}
                  max={MAX_QUANTITY.toString()}
                  value={snapData ? snapData.quantity : inputQuantity}
                  onChange={snapData ? undefined : handleQuantityChange}
                  className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={isFetchingPayment || isResetting || !!snapData}
                  aria-live="polite"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onMouseDown={handleMouseDownIncrement}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  disabled={inputQuantity >= MAX_QUANTITY || isFetchingPayment || isResetting || !!snapData}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Credits:</span>
                <span className="font-semibold">{totalCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Cost:</span>
                <span className="font-semibold">
                  {currencySymbol}{(totalCost).toLocaleString(undefined, {
                    minimumFractionDigits: currencySymbol === '$' ? 2 : 0,
                    maximumFractionDigits: currencySymbol === '$' ? 2 : 0
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between w-full sm:justify-between pt-4 border-t border-border mt-auto">
          <Button onClick={handleReset} variant="destructive" size="sm" disabled={isResetting || isFetchingPayment || (!snapData && lemonSqueezyCache.size === 0)}>
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Payment"
            )}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}