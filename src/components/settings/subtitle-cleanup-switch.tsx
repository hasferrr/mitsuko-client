"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"

export const SubtitleCleanupSwitch = () => {
  const isSubtitleCleanupEnabled = useLocalSettingsStore((state) => state.isSubtitleCleanupEnabled)
  const setIsSubtitleCleanupEnabled = useLocalSettingsStore((state) => state.setIsSubtitleCleanupEnabled)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="subtitle-cleanup"
          checked={isSubtitleCleanupEnabled}
          onCheckedChange={setIsSubtitleCleanupEnabled}
        />
        <label htmlFor="subtitle-cleanup" className="text-xs text-muted-foreground">
          Cleanup subtitle lines, tags, and comments, reduces input token (global)
        </label>
      </div>
    </div>
  )
}
