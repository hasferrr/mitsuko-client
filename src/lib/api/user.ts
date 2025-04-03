import { supabase } from "../supabase"
import { UserData } from "@/types/user"

export async function fetchUserData(): Promise<UserData> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    throw new Error("No user ID found")
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single<UserData>()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("User not found")
  }

  return data
}