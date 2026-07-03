import { useEffect, useRef } from "react"
import { useProcessingIndicatorStore } from "@/stores/ui/use-processing-indicator-store"
import { useLocalSettingsStore } from "@/stores/settings/use-local-settings-store"
import { playNotificationSound, showCompletionNotification } from "@/lib/utils/notification"

export function useProcessingCompleteNotification(): void {
  const items = useProcessingIndicatorStore((s) => s.items)
  const isCompletionNotificationEnabled = useLocalSettingsStore((s) => s.isCompletionNotificationEnabled)
  const prevCountRef = useRef(0)

  useEffect(() => {
    const count = Object.values(items).filter((i) => i.status === "processing").length
    if (prevCountRef.current > 0 && count === 0 && isCompletionNotificationEnabled) {
      playNotificationSound()
      showCompletionNotification()
    }
    prevCountRef.current = count
  }, [items, isCompletionNotificationEnabled])
}
