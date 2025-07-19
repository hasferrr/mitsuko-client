"use client"

import { useEffect } from "react"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useSettings } from "@/hooks/use-settings"
import { ContextExtractorMain } from "./context-extractor-main"
import { useProjectStore } from "@/stores/data/use-project-store"
import { Extraction } from "@/types/project"

export const ContextExtractor = () => {
  const currentId = useExtractionDataStore((state) => state.currentId)
  const extractionData = useExtractionDataStore((state) => state.data)
  const extraction = (extractionData[currentId ?? ""] || null) as Extraction | null

  useSettings({
    basicSettingsId: extraction?.basicSettingsId ?? null,
    advancedSettingsId: extraction?.advancedSettingsId ?? null,
  })

  useEffect(() => {
    if (!currentId || !extraction) return
    if (extraction.projectId !== useProjectStore.getState().currentProject?.id) {
      useProjectStore.getState().setCurrentProject(extraction.projectId)
    }
  }, [currentId, extraction])

  if (!currentId || !extraction) {
    return <div className="p-4">No extraction project selected</div>
  }

  if (!extraction.basicSettingsId || !extraction.advancedSettingsId) {
    return <div className="p-4">Invalid settings data</div>
  }

  return (
    <ContextExtractorMain currentId={currentId} />
  )
}
