"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { SPLIT_SIZE_MIN, SPLIT_SIZE_MAX } from "@/constants/limits"

interface Props {
  advancedSettingsId: string
}

export const SplitSizeInput = memo(({ advancedSettingsId }: Props) => {
  const splitSize = useAdvancedSettingsStore((state) => state.getSplitSize(advancedSettingsId))
  const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
  const setSplitSize = (value: number) => setAdvancedSettingsValue(advancedSettingsId, "splitSize", value)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow only numbers, and handle empty string
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10) // Prevent NaN
      num = Math.min(num, SPLIT_SIZE_MAX)
      setSplitSize(value === "" ? 0 : num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSplitSize(Math.min(Math.max(parseInt(value, 10), SPLIT_SIZE_MIN), SPLIT_SIZE_MAX))
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Split Size</label>
      </div>
      <Input
        type="text"
        value={splitSize}
        onBlur={handleBlur}
        onChange={handleChange}
        min={SPLIT_SIZE_MIN}
        max={SPLIT_SIZE_MAX}
        step={10}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        Determines the number of dialogues to process in each chunk.
        Smaller chunks can help with reliability.
        Larger chunks increase efficiency and context management.
        ({SPLIT_SIZE_MIN}-{SPLIT_SIZE_MAX})
      </p>
    </div>
  )
})