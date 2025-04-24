import { ProductId } from "@/types/product"
import { SnapPaymentResult } from "@/types/snap"
import { PAYMENT_CREATE_SNAP_URL } from "@/constants/api"
import { supabase } from "../supabase"

export async function createSnapPayment(productId: ProductId, quantity: number): Promise<{ data: SnapPaymentResult }> {
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error("No access token found")
  }

  // TODO: Change to axios, add error handling
  const response = await fetch(PAYMENT_CREATE_SNAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ productId, quantity }),
  })

  return response.json() as Promise<{ data: SnapPaymentResult }>
}
