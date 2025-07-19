"use client"

import { useEffect } from "react"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useSettings } from "@/hooks/use-settings"
import { useProjectStore } from "@/stores/data/use-project-store"
import SubtitleTranslatorMain from "./subtitle-translator-main"
import { Translation } from "@/types/project"

export default function SubtitleTranslator() {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const translation = (translationData[currentId ?? ""] || null) as Translation | null

  useSettings({
    basicSettingsId: translation?.basicSettingsId ?? null,
    advancedSettingsId: translation?.advancedSettingsId ?? null,
  })

  useEffect(() => {
    if (!currentId) return
    if (!translation) return
    if (translation.projectId !== useProjectStore.getState().currentProject?.id) {
      useProjectStore.getState().setCurrentProject(translation.projectId)
    }
  }, [currentId, translation])

  if (!currentId || !translation) {
    return <div className="p-4">No translation project selected</div>
  }

  if (!translation.basicSettingsId || !translation.advancedSettingsId) {
    return <div className="p-4">Invalid settings data</div>
  }

  return (
    <SubtitleTranslatorMain
      currentId={currentId}
      translation={translation}
    />
  )
}
