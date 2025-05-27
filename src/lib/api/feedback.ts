import { supabase } from "../supabase"
import { FEEDBACK_URL } from "@/constants/api"

export const submitFeedback = async (type: string, feedback: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    console.error("Feedback: No access token found")
    return
  }

  await fetch(FEEDBACK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ type, feedback }),
  })
}
