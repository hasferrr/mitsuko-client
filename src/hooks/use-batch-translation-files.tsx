import { useMemo } from "react"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { BatchFile } from "@/types/batch"

export const useBatchTranslationFiles = (order: string[], queueSet: Set<string>) => {
  const translationData = useTranslationDataStore((state) => state.data)
  const isTranslatingSet = useTranslationStore((state) => state.isTranslatingSet)
  const currentProject = useProjectStore((state) => state.currentProject)

  const batchFiles: BatchFile[] = useMemo(() => {
    if (!currentProject?.isBatch) return []
    return order.map(id => {
      const translation = translationData[id]

      const totalSubtitles = translation?.subtitles?.length || 0
      const translatedCount = translation?.subtitles?.filter(s => s.translated && s.translated.trim() !== "").length || 0
      const progress = totalSubtitles ? (translatedCount / totalSubtitles) * 100 : 0

      let status: BatchFile["status"]

      if (isTranslatingSet.has(id)) {
        status = "translating"
      } else if (queueSet.has(id)) {
        status = "queued"
      } else if (translatedCount === 0) {
        status = "pending"
      } else if (translatedCount < totalSubtitles) {
        status = "partial"
      } else {
        status = "done"
      }

      return {
        id,
        title: translation?.title || "",
        subtitlesCount: totalSubtitles,
        translatedCount,
        status,
        progress,
        type: translation?.parsed?.type || "srt",
      }
    })
  }, [currentProject?.isBatch, order, translationData, isTranslatingSet, queueSet])

  const finishedCount = useMemo(() => {
    return batchFiles.filter(file => file.status === "done").length
  }, [batchFiles])

  const isBatchTranslating = useMemo(() => {
    return batchFiles.some(file => file.status === "translating" || file.status === "queued")
  }, [batchFiles])

  return { batchFiles, finishedCount, isBatchTranslating }
}