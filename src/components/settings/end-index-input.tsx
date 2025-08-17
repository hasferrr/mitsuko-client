"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"

interface Props {
  advancedSettingsId: string
}

export const EndIndexInput = memo(({ advancedSettingsId }: Props) => {
  const startIndex = useAdvancedSettingsStore((state) => state.getStartIndex(advancedSettingsId))
  const endIndex = useAdvancedSettingsStore((state) => state.getEndIndex(advancedSettingsId))

  const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
  const setEndIndex = (value: number) => setAdvancedSettingsValue(advancedSettingsId, "endIndex", value)
  const setStartIndex = (value: number) => setAdvancedSettingsValue(advancedSettingsId, "startIndex", value)

  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const subtitles = currentId ? translationData[currentId]?.subtitles ?? [] : []

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10)
      num = Math.min(num, subtitles.length)
      num = value === "" ? 0 : num
      setEndIndex(num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setEndIndex(Math.min(Math.max(parseInt(value, 10), 1), subtitles.length))
    if (endIndex < startIndex) {
      setStartIndex(Math.max(1, endIndex))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">End Index</label>
      </div>
      <Input
        type="text"
        value={endIndex}
        onBlur={handleBlur}
        onChange={handleChange}
        min={1}
        max={subtitles.length}
        step={1}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        End translation at this subtitle index. This index will also be translated. (1-{subtitles.length})
      </p>
    </div>
  )
})