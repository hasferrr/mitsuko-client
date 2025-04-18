import { supabase } from "../supabase"
import { SUBTITLE_LOG_URL } from "@/constants/api"

export const logSubtitle = async (title: string, content: string, uuid: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    console.error("Subtitle Log: No access token found")
    return
  }

  await fetch(SUBTITLE_LOG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title, content, uuid }),
  })
}
