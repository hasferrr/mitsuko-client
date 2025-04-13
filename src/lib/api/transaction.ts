import { supabase } from "../supabase"
import { Transaction } from "@/types/transaction"

export type AmountFilter = "all" | "positive" | "negative" | "zero"

export type PaginatedTransactions = {
  data: Transaction[]
  count: number
}

export async function fetchTransactions(
  page: number = 1,
  limit: number = 10,
  amountFilter: AmountFilter = "all"
): Promise<PaginatedTransactions> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    throw new Error("No user ID found")
  }

  // Calculate range start and end
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Start building the query
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', session.user.id)

  if (amountFilter === "positive") {
    query = query.gt('amount', 0)
  } else if (amountFilter === "negative") {
    query = query.lt('amount', 0)
  } else if (amountFilter === "zero") {
    query = query.eq('amount', 0)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: data || [],
    count: count || 0
  }
}