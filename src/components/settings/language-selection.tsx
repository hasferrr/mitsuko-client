"use client"

import { memo } from "react"
import { ComboBox } from "@/components/ui-custom/combo-box"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { LANGUAGES } from "@/constants/lang"

interface LanguageSelectionProps {
  settingsId: string
}

export const LanguageSelection = memo(({ settingsId }: LanguageSelectionProps) => {
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(settingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(settingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setSourceLanguage = (language: string) => setBasicSettingsValue(settingsId, "sourceLanguage", language)
  const setTargetLanguage = (language: string) => setBasicSettingsValue(settingsId, "targetLanguage", language)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Source Language</label>
        <ComboBox
          data={LANGUAGES}
          value={sourceLanguage}
          setValue={(t) => setSourceLanguage(t)}
          name="language"
        />
      </div>
      <div className="flex flex-col gap-2">
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