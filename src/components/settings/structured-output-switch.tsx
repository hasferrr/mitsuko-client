"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"

interface Props {
  settingsId: string
}

export const StructuredOutputSwitch = memo(({ settingsId }: Props) => {
  const useStructuredOutput = useSettingsStore((state) => state.getIsUseStructuredOutput(settingsId))
  const setAdvancedSettingsValue = useSettingsStore((state) => state.setAdvancedSettingsValue)
  const setUseStructuredOutput = (value: boolean) => setAdvancedSettingsValue(settingsId, "isUseStructuredOutput", value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Structured Outputs</label>
        <Switch
          checked={useStructuredOutput}
          onCheckedChange={(value) => setUseStructuredOutput(value)}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Enables structured JSON output. You can turn this option off if the model doesn't support it.
      </p>
    </div>
  )
})