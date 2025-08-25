import { useMemo } from "react"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { BatchFile } from "@/types/batch"

export const useBatchExtractionFiles = (order: string[], queueSet: Set<string>) => {
  const extractionData = useExtractionDataStore((state) => state.data)
  const isExtractingSet = useExtractionStore((state) => state.isExtractingSet)
  const currentProject = useProjectStore((state) => state.currentProject)

  const batchFiles: BatchFile[] = useMemo(() => {
    if (!currentProject?.isBatch) return []
    return order.map(id => {
      const extraction = extractionData[id]

      const partial = extraction?.contextResult && extraction.contextResult.trim() !== ""
      const extracted = partial && extraction.contextResult.trim().endsWith("<finished>")
      const progress = extracted ? 100 : 0

      let status: BatchFile["status"]

      if (isExtractingSet.has(id)) {
        status = "translating"
      } else if (queueSet.has(id)) {
        status = "queued"
      } else if (extracted) {
        status = "done"
      } else if (partial) {
        status = "partial"
      } else {
        status = "pending"
      }

      return {
        id,
        title: extraction?.episodeNumber || "Loading...",
        subtitlesCount: 0,
        translatedCount: 0,
        status,
        progress,
        type: "txt",
      }
    })
  }, [currentProject?.isBatch, order, extractionData, isExtractingSet, queueSet])

  const finishedCount = useMemo(() => {
    return batchFiles.filter(file => file.status === "done").length
  }, [batchFiles])

  const isBatchExtracting = useMemo(() => {
    return batchFiles.some(file => file.status === "translating" || file.status === "queued")
  }, [batchFiles])

  return { batchFiles, finishedCount, isBatchExtracting }
}