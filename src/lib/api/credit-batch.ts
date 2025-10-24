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

export type PaginatedCreditBatches = {
  data: CreditBatch[]
  count: number
}

export async function fetchCreditBatches(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedCreditBatches> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    throw new Error("No user ID found")
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from("credit_batches")
    .select("*", { count: "exact" })
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: data || [],
    count: count || 0
  }
}