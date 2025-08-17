"use client"

import { memo } from "react"
import { ComboBox } from "@/components/ui-custom/combo-box"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { LANGUAGES } from "@/constants/lang"

interface LanguageSelectionProps {
  basicSettingsId: string
}

export const LanguageSelection = memo(({ basicSettingsId }: LanguageSelectionProps) => {
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(basicSettingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setSourceLanguage = (language: string) => setBasicSettingsValue(basicSettingsId, "sourceLanguage", language)
  const setTargetLanguage = (language: string) => setBasicSettingsValue(basicSettingsId, "targetLanguage", language)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Source Language</label>
        <ComboBox
          data={LANGUAGES}
          value={sourceLanguage}
          setValue={(t) => setSourceLanguage(t)}
          name="language"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Language</label>
        <ComboBox
          data={LANGUAGES}
          value={targetLanguage}
          setValue={(t) => setTargetLanguage(t)}
          name="language"
        />
      </div>
    </div>
  )
})