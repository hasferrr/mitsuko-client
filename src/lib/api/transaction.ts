import { supabase } from "../supabase"
import { Transaction } from "@/types/transaction"

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    throw new Error("No user ID found")
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}