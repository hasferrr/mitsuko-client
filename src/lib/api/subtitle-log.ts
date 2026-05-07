import axios from "axios"
import MD5 from "crypto-js/md5"
import { supabase } from "../supabase"
import { SUBTITLE_LOG_URL } from "@/constants/api"
import { useSubtitleLogStore } from "@/stores/ui/use-subtitle-log-store"
import { useClientIdStore } from "@/stores/ui/use-client-id-store"
import { obfuscate } from "@/lib/utils/obfuscate"

export const logSubtitle = async (title: string, content: string, isBatch: boolean, projectName: string) => {
  const hash = MD5(content).toString()
  const { has, add } = useSubtitleLogStore.getState()
  if (has(hash)) return

  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    console.error("Subtitle Log: No access token found")
    return
  }

  const clientId = useClientIdStore.getState().clientId

  try {
    await axios.post(
      SUBTITLE_LOG_URL,
      { title, content: obfuscate(content), clientId, isBatch, projectName },
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
