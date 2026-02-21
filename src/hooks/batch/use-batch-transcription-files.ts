import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useUploadStore } from "@/stores/use-upload-store"
import { useSessionStore } from "@/stores/use-session-store"
import { BatchFile } from "@/types/batch"
import { listUploads } from "@/lib/api/uploads"

export const useBatchTranscriptionFiles = (order: string[], queueSet: Set<string>) => {
  const transcriptionData = useTranscriptionDataStore((state) => state.data)
  const isTranscribingSet = useTranscriptionStore((state) => state.isTranscribingSet)
  const files = useTranscriptionStore((state) => state.files)
  const uploadProgressMap = useUploadStore((state) => state.uploadMap)
  const currentProject = useProjectStore((state) => state.currentProject)
  const session = useSessionStore((state) => state.session)

  const { data: uploads = [] } = useQuery({
    queryKey: ["uploads", session?.user?.id],
    queryFn: listUploads,
    staleTime: Infinity,
    enabled: !!session,
  })

  const batchFiles: BatchFile[] = useMemo(() => {
    if (!currentProject?.isBatch) return []
    return order.map(id => {
      const transcription = transcriptionData[id]
      const hasLocalFile = !!files[id]
      const uploadProgress = uploadProgressMap[id]
      const isUploading = !!uploadProgress
      const hasUploadId = !!transcription?.selectedUploadId
      const uploadExists = hasUploadId && uploads.some(u => u.uploadId === transcription?.selectedUploadId)
      const hasTranscriptionText = !!transcription?.transcriptionText && transcription.transcriptionText.length > 0
      const hasErrorTag = hasTranscriptionText && transcription.transcriptionText.includes("<error>")

      let status: BatchFile["status"]
      let progress = 0

      if (isUploading) {
        status = "uploading"
        progress = uploadProgress?.progress.percentage ?? 0
      } else if (isTranscribingSet.has(id)) {
        status = "processing"
      } else if (queueSet.has(id)) {
        status = "queued"
      } else if (hasErrorTag) {
        status = "error"
      } else if (hasTranscriptionText) {
        status = "done"
      } else if (!hasUploadId && !hasLocalFile) {
        status = "pending"
      } else if (hasUploadId || hasLocalFile) {
        status = "pending"
      } else {
        status = "pending"
      }

      const description = uploadExists ? "Uploaded, selected" : hasUploadId ? "Upload not found (file deleted)" : hasLocalFile ? "Ready to upload" : "No audio selected"
      const descriptionColor: BatchFile["descriptionColor"] = uploadExists ? "green" : hasUploadId ? "yellow" : hasLocalFile ? "blue" : "red"

      return {
        id,
        title: transcription?.title || "",
        description,
        descriptionColor,
        subtitlesCount: 0,
        translatedCount: 0,
        status,
        progress,
        type: "audio",
      }
    })
  }, [currentProject?.isBatch, order, transcriptionData, isTranscribingSet, files, uploadProgressMap, queueSet, uploads])

  const finishedCount = useMemo(() => {
    return batchFiles.filter(file => file.status === "done").length
  }, [batchFiles])

  const isBatchTranscribing = useMemo(() => {
    return batchFiles.some(file => file.status === "processing" || file.status === "queued")
  }, [batchFiles])

  return { batchFiles, finishedCount, isBatchTranscribing }
}
