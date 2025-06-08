import { supabase } from "@/lib/supabase"

export interface CreditBatch {
  id: string
  user_id: string
  transaction_id: string
  initial_amount: number
  remaining_amount: number
  created_at: string
  expires_at: string
}

export const fetchCreditBatches = async (): Promise<CreditBatch[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("credit_batches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data as CreditBatch[]
}