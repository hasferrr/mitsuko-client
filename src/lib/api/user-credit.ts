import { supabase } from "../supabase"
import { UserCreditData } from "@/types/user"

export async function fetchUserCreditData(): Promise<UserCreditData> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    throw new Error("No user ID found")
  }

  const { data, error } = await supabase
    .from('users')
    .select('credit')
    .eq('id', session.user.id)
    .single<UserCreditData>()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("User not found")
  }

  return data
}