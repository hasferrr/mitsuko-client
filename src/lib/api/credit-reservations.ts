import { supabase } from "../supabase"

export async function fetchBackgroundTranscriptionCount(): Promise<number> {
  const { data: { session } } = await supabase.auth.getSession()
  const uid = session?.user?.id
  if (!uid) {
    throw new Error("No user ID found")
  }

  const { count, error } = await supabase
    .from('credit_reservations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
    .eq('operation', 'transcription')
    .eq('status', 'reserved')

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}
