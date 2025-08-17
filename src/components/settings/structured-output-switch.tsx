"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { SettingsParentType } from "@/types/project"

interface Props {
  basicSettingsId: string
  advancedSettingsId: string
  parent: SettingsParentType
}

export const StructuredOutputSwitch = memo(({ basicSettingsId, advancedSettingsId, parent }: Props) => {
  const modelDetail = useSettingsStore((state) => state.getModelDetail(basicSettingsId))
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(basicSettingsId))
  const useStructuredOutput = useAdvancedSettingsStore((state) => state.getIsUseStructuredOutput(advancedSettingsId))
  const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
  const setUseStructuredOutput = (value: boolean, parent: SettingsParentType) => setAdvancedSettingsValue(advancedSettingsId, "isUseStructuredOutput", value, parent)

  const disabled = !isUseCustomModel && !modelDetail?.structuredOutput

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Structured Outputs</label>
        <Switch
          disabled={disabled}
          checked={useStructuredOutput}
          onCheckedChange={(value) => setUseStructuredOutput(value, parent)}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Enables structured JSON output. You can turn this option off if the model doesn't support it.
      </p>
    </div>
  )
})