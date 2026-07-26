"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"

interface Props {
  settingsId: string
}

export const FullContextMemorySwitch = memo(({ settingsId }: Props) => {
  const isUseFullContextMemory = useSettingsStore((state) => state.getIsUseFullContextMemory(settingsId))
  const setAdvancedSettingsValue = useSettingsStore((state) => state.setAdvancedSettingsValue)
  const setIsUseFullContextMemory = (value: boolean) => setAdvancedSettingsValue(settingsId, "isUseFullContextMemory", value)

  const handleCheckedChange = (checked: boolean) => {
    setIsUseFullContextMemory(checked)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Full Context Memory</label>
        <Switch
          checked={isUseFullContextMemory}
          onCheckedChange={handleCheckedChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        When enabled, it uses all previous chunks as context to improve translation,
        but increases input token usage and may impact the performance as input length grows.
        Only for models with large context windows (1M tokens).
        When disabled, it includes only the last previous chunk.
      </p>
    </div>
  )
})