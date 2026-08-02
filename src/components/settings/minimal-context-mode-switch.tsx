"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"

interface Props {
  settingsId: string
}

export const MinimalContextModeSwitch = memo(({ settingsId }: Props) => {
  const isMinimalContextMode = useSettingsStore((state) => state.getIsMinimalContextMode(settingsId))
  const isUseFullContextMemory = useSettingsStore((state) => state.getIsUseFullContextMemory(settingsId))
  const setAdvancedSettingsValue = useSettingsStore((state) => state.setAdvancedSettingsValue)
  const setIsMinimalContextMode = (value: boolean) => setAdvancedSettingsValue(settingsId, "isMinimalContextMode", value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Minimal Context Mode</label>
        <Switch
          checked={isUseFullContextMemory ? false : isMinimalContextMode}
          onCheckedChange={setIsMinimalContextMode}
          disabled={isUseFullContextMemory}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Uses minimal context to reduce token usage and cost.
        When enabled, only 5 dialogs from the previous chunk are used as context.
        When disabled, it maintains a balanced approach using the last previous chunk.
      </p>
    </div>
  )
})
