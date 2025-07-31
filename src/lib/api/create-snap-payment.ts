import { ProductId } from "@/types/product"
import { SnapPaymentResult } from "@/types/snap"
import { PAYMENT_CREATE_LEMONSQUEEZY_URL, PAYMENT_CREATE_SNAP_URL } from "@/constants/api"
import { supabase } from "../supabase"

type PaymentType = "snap" | "lemonsqueezy"

export async function createSnapPayment(productId: ProductId, quantity: number, type: PaymentType): Promise<{ data: SnapPaymentResult }> {
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error("No access token found")
  }

  const response = await fetch(type === "snap"
    ? PAYMENT_CREATE_SNAP_URL
    : PAYMENT_CREATE_LEMONSQUEEZY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ productId, quantity }),
  })

  return response.json() as Promise<{ data: SnapPaymentResult }>
}
