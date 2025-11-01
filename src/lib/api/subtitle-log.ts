import axios from "axios"
import MD5 from "crypto-js/md5"
import { supabase } from "../supabase"
import { SUBTITLE_LOG_URL } from "@/constants/api"
import { useSubtitleLogStore } from "@/stores/use-subtitle-log-store"

export const logSubtitle = async (title: string, content: string, uuid: string, isBatch: boolean = false) => {
  const hash = MD5(content).toString()
  const { has, add } = useSubtitleLogStore.getState()
  if (has(hash)) return

  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    console.error("Subtitle Log: No access token found")
    return
  }

  try {
    await axios.post(
      SUBTITLE_LOG_URL,
      { title, content, uuid, isBatch },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    add(hash)
  } catch (error) {
    console.error("Subtitle Log: failed to post", error)
  }
}
