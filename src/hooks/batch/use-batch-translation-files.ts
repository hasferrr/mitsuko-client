import { useMemo } from "react"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { BatchFile } from "@/types/batch"
import { BatchTranslationStage } from "@/types/batch"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { getEffectiveExtractionStatus } from "@/lib/extraction/status"

export const useBatchTranslationFiles = (
  order: string[],
  queueSet: Set<string>,
  autoContextStageMap: Record<string, BatchTranslationStage> = {},
) => {
  const translationData = useTranslationDataStore((state) => state.data)
  const extractionData = useExtractionDataStore((state) => state.data)
  const isTranslatingSet = useTranslationStore((state) => state.isTranslatingSet)
  const isExtractingSet = useExtractionStore((state) => state.isExtractingSet)
  const currentProject = useProjectStore((state) => state.currentProject)

  const batchFiles: BatchFile[] = useMemo(() => {
    if (!currentProject?.isBatch) return []
    return order.map(id => {
      const translation = translationData[id]

      const totalSubtitles = translation?.subtitles?.length || 0
      const translatedCount = translation?.subtitles?.filter(s => s.translated && s.translated.trim() !== "").length || 0
      const progress = totalSubtitles ? (translatedCount / totalSubtitles) * 100 : 0
      const linkedExtraction = translation?.autoContextExtractionId
        ? extractionData[translation.autoContextExtractionId]
        : null
      const linkedExtractionStatus = linkedExtraction
        ? getEffectiveExtractionStatus(linkedExtraction, isExtractingSet)
        : null
      const inferredContextError = currentProject.isBatchAutoContextEnabled
        && translatedCount < totalSubtitles
        && linkedExtraction?.ownerTranslationId === id
        && (linkedExtractionStatus === "failed" || linkedExtractionStatus === "stopped")
      const translationStage = autoContextStageMap[id]

      let status: BatchFile["status"]

      if (translationStage === "context-error" || inferredContextError) {
        status = "error"
      } else if (
        translationStage === "extracting-context"
        || translationStage === "translating"
        || isTranslatingSet.has(id)
      ) {
        status = "processing"
      } else if (
        translationStage === "waiting-context"
        || translationStage === "queued-translation"
        || queueSet.has(id)
      ) {
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
        description: "",
        subtitlesCount: totalSubtitles,
        translatedCount,
        status,
        progress,
        type: translation?.parsed?.type || "srt",
        translationStage: translationStage ?? (isTranslatingSet.has(id) ? "translating" : inferredContextError ? "context-error" : undefined),
        linkedExtractionId: linkedExtraction?.id ?? null,
      }
    })
  }, [
    currentProject?.isBatch,
    currentProject?.isBatchAutoContextEnabled,
    order,
    translationData,
    extractionData,
    isTranslatingSet,
    isExtractingSet,
    queueSet,
    autoContextStageMap,
  ])

  const finishedCount = useMemo(() => {
    return batchFiles.filter(file => file.status === "done").length
  }, [batchFiles])

  const isBatchTranslating = useMemo(() => {
    return batchFiles.some(file => file.status === "processing" || file.status === "queued")
  }, [batchFiles])

  return { batchFiles, finishedCount, isBatchTranslating }
}
