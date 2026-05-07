"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"

interface Props {
  advancedSettingsId: string
}

export const FullContextMemorySwitch = memo(({ advancedSettingsId }: Props) => {
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory(advancedSettingsId))
  const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
  const setIsUseFullContextMemory = (value: boolean) => setAdvancedSettingsValue(advancedSettingsId, "isUseFullContextMemory", value)

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