"use client"

import { memo } from "react"
import { ComboBox } from "@/components/ui-custom/combo-box"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { LANGUAGES } from "@/constants/lang"
import { SettingsParentType } from "@/types/project"

export const LanguageSelection = memo(({ type }: { type: SettingsParentType }) => {
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage())
  const setSourceLanguage = useSettingsStore((state) => state.setSourceLanguage)
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage())
  const setTargetLanguage = useSettingsStore((state) => state.setTargetLanguage)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Source Language</label>
        <ComboBox
          data={LANGUAGES}
          value={sourceLanguage}
          setValue={(t) => setSourceLanguage(t, type)}
          name="language"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Language</label>
        <ComboBox
          data={LANGUAGES}
          value={targetLanguage}
          setValue={(t) => setTargetLanguage(t, type)}
          name="language"
        />
      </div>
    </div>
  )
})