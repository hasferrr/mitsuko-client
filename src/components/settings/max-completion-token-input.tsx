"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { MAX_COMPLETION_TOKENS_MIN, MAX_COMPLETION_TOKENS_MAX } from "@/constants/limits"
import { SettingsParentType } from "@/types/project"

export const MaxCompletionTokenInput = memo(({ type }: { type: SettingsParentType }) => {
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.getMaxCompletionTokens())
  const setMaxCompletionTokens = useAdvancedSettingsStore((state) => state.setMaxCompletionTokens)
  const isMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.getIsMaxCompletionTokensAuto())
  const setIsMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.setIsMaxCompletionTokensAuto)

  const maxToken = isUseCustomModel || !modelDetail
    ? MAX_COMPLETION_TOKENS_MAX
    : modelDetail.maxOutput

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow only numbers, and handle empty string
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10) // Prevent NaN
      num = Math.min(num, maxToken)
      setMaxCompletionTokens(value === "" ? 0 : num, type)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxCompletionTokens(Math.min(Math.max(parseInt(value, 10), MAX_COMPLETION_TOKENS_MIN), maxToken), type)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Max Completion Token</label>
        <Switch
          checked={!isMaxCompletionTokensAuto}
          onCheckedChange={(checked) => setIsMaxCompletionTokensAuto(!checked, type)}
        />
      </div>
      <Input
        type="text"
        value={maxCompletionTokens}
        onBlur={handleBlur}
        onChange={handleChange}
        min={MAX_COMPLETION_TOKENS_MIN}
        max={maxToken}
        step={512}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
        disabled={isMaxCompletionTokensAuto}
      />
      <p className="text-xs text-muted-foreground">
        Maximum number of tokens the model can generate for each subtitle chunk.
        {isMaxCompletionTokensAuto ? " Currently set to auto." : ` (${MAX_COMPLETION_TOKENS_MIN}-${maxToken}).`}
      </p>
    </div>
  )
})