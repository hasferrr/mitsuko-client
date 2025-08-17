"use client"

import { memo } from "react"
import { ComboBox } from "@/components/ui-custom/combo-box"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { LANGUAGES } from "@/constants/lang"
import { SettingsParentType } from "@/types/project"

interface LanguageSelectionProps {
  basicSettingsId: string
  parent: SettingsParentType
}

export const LanguageSelection = memo(({ basicSettingsId, parent }: LanguageSelectionProps) => {
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(basicSettingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setSourceLanguage = (language: string, parent: SettingsParentType) => setBasicSettingsValue(basicSettingsId, "sourceLanguage", language, parent)
  const setTargetLanguage = (language: string, parent: SettingsParentType) => setBasicSettingsValue(basicSettingsId, "targetLanguage", language, parent)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Source Language</label>
        <ComboBox
          data={LANGUAGES}
          value={sourceLanguage}
          setValue={(t) => setSourceLanguage(t, parent)}
          name="language"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Language</label>
        <ComboBox
          data={LANGUAGES}
          value={targetLanguage}
          setValue={(t) => setTargetLanguage(t, parent)}
          name="language"
        />
      </div>
    </div>
  )
})