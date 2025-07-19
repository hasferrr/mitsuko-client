"use client"

import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useSettings } from "@/hooks/use-settings"
import SubtitleTranslatorMain from "./subtitle-translator-main"

export default function SubtitleTranslator() {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)

  useSettings({
    basicSettingsId: translationData[currentId ?? ""]?.basicSettingsId ?? null,
    advancedSettingsId: translationData[currentId ?? ""]?.advancedSettingsId ?? null,
  })

  if (!currentId || !translationData[currentId]) {
    return <div className="p-4">No translation project selected</div>
  }

  if (!translationData[currentId].basicSettingsId || !translationData[currentId].advancedSettingsId) {
    return <div className="p-4">Invalid settings data</div>
  }

  return (
    <SubtitleTranslatorMain
      currentId={currentId}
      translation={translationData[currentId]}
    />
  )
}
