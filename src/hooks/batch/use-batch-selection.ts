"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { BatchFile } from "@/types/batch"
import { cleanExtractionContent, getEffectiveExtractionStatus, hasExtractionError } from "@/lib/extraction/status"

interface UseBatchSelectionProps {
  batchFiles: BatchFile[]
  operationMode: "translation" | "extraction" | "transcription"
}

export function useBatchSelection({ batchFiles, operationMode }: UseBatchSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] = useState(false)

  const currentProject = useProjectStore((state) => state.currentProject)
  const removeTranslationFromBatch = useProjectStore((state) => state.removeTranslationFromBatch)
  const removeExtractionFromBatch = useProjectStore((state) => state.removeExtractionFromBatch)
  const removeTranscriptionFromBatch = useProjectStore((state) => state.removeTranscriptionFromBatch)

  const extractionData = useExtractionDataStore((state) => state.data)
  const mutateExtraction = useExtractionDataStore((state) => state.mutateData)
  const saveExtractionData = useExtractionDataStore((state) => state.saveData)

  const toggleSelectMode = () => {
    setIsSelecting(prev => {
      if (prev) {
        setSelectedIds(new Set())
      }
      return !prev
    })
  }

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (!currentProject) return
    for (const id of Array.from(selectedIds)) {
      try {
        if (operationMode === 'translation') {
          await removeTranslationFromBatch(currentProject.id, id)
        } else if (operationMode === 'extraction') {
          await removeExtractionFromBatch(currentProject.id, id)
        } else if (operationMode === 'transcription') {
          await removeTranscriptionFromBatch(currentProject.id, id)
        }
      } catch {
        toast.error('Failed to delete file')
      }
    }
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  const handleToggleMarkSelected = async () => {
    if (operationMode !== 'extraction') return
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    await Promise.all(ids.map(async (id) => {
      const extraction = extractionData[id]
      if (!extraction) return
      const status = getEffectiveExtractionStatus(extraction, new Set())
      if (status === "completed") {
        mutateExtraction(id, "status", "idle")
        mutateExtraction(id, "completedAt", null)
      } else if (!cleanExtractionContent(extraction.contextResult) || hasExtractionError(extraction.contextResult)) {
        toast.error("Only clean non-empty extraction results can be marked done")
        return
      } else {
        mutateExtraction(id, "status", "completed")
        mutateExtraction(id, "completedAt", new Date())
      }
      await saveExtractionData(id)
    }))
  }

  const handleSelectAllToggle = () => {
    if (selectedIds.size === batchFiles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(batchFiles.map(f => f.id)))
    }
  }

  return {
    isSelecting,
    setIsSelecting,
    selectedIds,
    setSelectedIds,
    isDeleteSelectedDialogOpen,
    setIsDeleteSelectedDialogOpen,
    toggleSelectMode,
    handleSelectToggle,
    handleDeleteSelected,
    handleToggleMarkSelected,
    handleSelectAllToggle
  }
}
