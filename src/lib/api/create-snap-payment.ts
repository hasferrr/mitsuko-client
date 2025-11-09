import { ProductId } from "@/types/product"
import { SnapPaymentResult } from "@/types/snap"
import { PAYMENT_CREATE_LEMONSQUEEZY_URL, PAYMENT_CREATE_SNAP_URL } from "@/constants/api"
import { supabase } from "../supabase"
import axios from "axios"

type PaymentType = "snap" | "lemonsqueezy"

export async function createPaymentLink(productId: ProductId, quantity: number, type: PaymentType): Promise<SnapPaymentResult> {
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error("No access token found")
  }

  const url = type === "snap" ? PAYMENT_CREATE_SNAP_URL : PAYMENT_CREATE_LEMONSQUEEZY_URL
  const { data } = await axios.post<{ data: SnapPaymentResult }>(url, { productId, quantity }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return data.data
}
