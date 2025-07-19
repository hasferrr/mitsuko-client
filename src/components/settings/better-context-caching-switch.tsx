"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { SettingsParentType } from "@/types/project"

interface Props {
  parent: SettingsParentType
}

export const BetterContextCachingSwitch = memo(({ parent }: Props) => {
  const isBetterContextCaching = useAdvancedSettingsStore((state) => state.getIsBetterContextCaching())
  const setIsBetterContextCaching = useAdvancedSettingsStore((state) => state.setIsBetterContextCaching)
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory())

  const isMinimalContextMode = !isBetterContextCaching

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Minimal Context Mode</label>
        <Switch
          checked={isUseFullContextMemory ? false : isMinimalContextMode}
          onCheckedChange={(value) => setIsBetterContextCaching(!value, parent)}
          disabled={isUseFullContextMemory}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Uses minimal context to significantly reduce token usage and cost.
        When enabled, it will only use 5 dialogues from the previous chunk as context.
        When disabled, it maintains a balanced approach using the last previous chunk.
      </p>
    </div>
  )
})