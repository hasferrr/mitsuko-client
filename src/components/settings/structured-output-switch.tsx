"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"

export const StructuredOutputSwitch = memo(() => {
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const useStructuredOutput = useAdvancedSettingsStore((state) => state.getIsUseStructuredOutput())
  const setUseStructuredOutput = useAdvancedSettingsStore((state) => state.setIsUseStructuredOutput)

  const disabled = !isUseCustomModel && !modelDetail?.structuredOutput

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Structured Outputs</label>
        <Switch
          disabled={disabled}
          checked={useStructuredOutput}
          onCheckedChange={setUseStructuredOutput}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Enables structured JSON output. You can turn this option off if the model doesn't support it.
      </p>
    </div>
  )
})