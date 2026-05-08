import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Translation, Transcription, Extraction } from "@/types/project"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"

export type ItemType = "translation" | "transcription" | "extraction"

interface UseProjectItemSelectionProps {
  translations: Translation[]
  transcriptions: Transcription[]
  extractions: Extraction[]
  currentProjectId: string
  currentTab: string
  setTranslations: React.Dispatch<React.SetStateAction<Translation[]>>
  setTranscriptions: React.Dispatch<React.SetStateAction<Transcription[]>>
  setExtractions: React.Dispatch<React.SetStateAction<Extraction[]>>
}

export function useProjectItemSelection({
  translations,
  transcriptions,
  extractions,
  currentProjectId,
  currentTab,
  setTranslations,
  setTranscriptions,
  setExtractions,
}: UseProjectItemSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Map<string, ItemType>>(new Map())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const deleteTranslationDb = useTranslationDataStore(state => state.deleteTranslationDb)
  const deleteTranscriptionDb = useTranscriptionDataStore(state => state.deleteTranscriptionDb)
  const deleteExtractionDb = useExtractionDataStore(state => state.deleteExtractionDb)
  const moveTranslationDb = useTranslationDataStore(state => state.moveTranslationDb)
  const moveTranscriptionDb = useTranscriptionDataStore(state => state.moveTranscriptionDb)
  const moveExtractionDb = useExtractionDataStore(state => state.moveExtractionDb)
  const updateProjectItems = useProjectStore(state => state.updateProjectItems)
  const loadProjects = useProjectStore(state => state.loadProjects)
  const projects = useProjectStore(state => state.projects)

  const allIds = useMemo(() => {
    if (currentTab === "overview") {
      return [
        ...translations.map(t => t.id),
        ...transcriptions.map(t => t.id),
        ...extractions.map(e => e.id),
      ]
    }
    if (currentTab === "translations") return translations.map(t => t.id)
    if (currentTab === "transcriptions") return transcriptions.map(t => t.id)
    if (currentTab === "context-extractor") return extractions.map(e => e.id)
    return []
  }, [currentTab, translations, transcriptions, extractions])

  const selectedCounts = useMemo(() => {
    let tc = 0, sc = 0, ec = 0
    for (const [, type] of selectedIds) {
      if (type === "translation") tc++
      else if (type === "transcription") sc++
      else ec++
    }
    return { translations: tc, transcriptions: sc, extractions: ec }
  }, [selectedIds])

  const allSelected = useMemo(() => {
    return allIds.length > 0 && allIds.every(id => selectedIds.has(id))
  }, [allIds, selectedIds])

  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)

  const hasActiveOperations = useMemo(() => {
    for (const [id, type] of selectedIds) {
      if (type === "translation" && isTranslatingSet.has(id)) return true
      if (type === "transcription" && isTranscribingSet.has(id)) return true
      if (type === "extraction" && isExtractingSet.has(id)) return true
    }
    return false
  }, [selectedIds, isTranslatingSet, isTranscribingSet, isExtractingSet])

  const hasTranslations = translations.length > 0
  const hasTranscriptions = transcriptions.length > 0
  const hasExtractions = extractions.length > 0

  const exitSelectMode = useCallback(() => {
    setIsSelecting(false)
    setSelectedIds(new Map())
  }, [])

  const toggleSelectMode = useCallback(() => {
    setIsSelecting(prev => {
      if (prev) {
        setSelectedIds(new Map())
      }
      return !prev
    })
  }, [])

  const handleSelectToggle = useCallback((id: string, type: ItemType) => {
    setSelectedIds(prev => {
      const next = new Map(prev)
      if (next.has(id)) next.delete(id)
      else next.set(id, type)
      return next
    })
  }, [])

  const handleSelectAllToggle = useCallback(() => {
    setSelectedIds(prev => {
      if (allIds.length > 0 && allIds.every(id => prev.has(id))) {
        return new Map()
      }
      const next = new Map<string, ItemType>()
      if (currentTab === "overview" || currentTab === "translations")
        for (const t of translations) next.set(t.id, "translation")
      if (currentTab === "overview" || currentTab === "transcriptions")
        for (const t of transcriptions) next.set(t.id, "transcription")
      if (currentTab === "overview" || currentTab === "context-extractor")
        for (const e of extractions) next.set(e.id, "extraction")
      return next
    })
  }, [allIds, currentTab, translations, transcriptions, extractions])

  const handleSelectTypeOnly = useCallback((type: ItemType) => {
    const next = new Map<string, ItemType>()
    if (type === "translation") {
      for (const t of translations) next.set(t.id, "translation")
    } else if (type === "transcription") {
      for (const t of transcriptions) next.set(t.id, "transcription")
    } else {
      for (const e of extractions) next.set(e.id, "extraction")
    }
    setSelectedIds(next)
  }, [translations, transcriptions, extractions])

  const handleDeleteSelected = useCallback(async () => {
    setIsProcessing(true)
    let errorCount = 0

    const storeProject = useProjectStore.getState().currentProject
    const baseProject = storeProject && storeProject.id === currentProjectId ? storeProject : null

    const translationIds: string[] = []
    const transcriptionIds: string[] = []
    const extractionIds: string[] = []

    for (const [id, type] of selectedIds) {
      if (type === "translation") translationIds.push(id)
      else if (type === "transcription") transcriptionIds.push(id)
      else extractionIds.push(id)
    }

    const deletedTranslationIds: string[] = []
    for (const id of translationIds) {
      try {
        await deleteTranslationDb(currentProjectId, id)
        deletedTranslationIds.push(id)
      } catch {
        errorCount++
      }
    }
    if (deletedTranslationIds.length > 0) {
      const remaining = (baseProject?.translations ?? translations.map(t => t.id)).filter(tid => !deletedTranslationIds.includes(tid))
      await updateProjectItems(currentProjectId, remaining, "translations")
      setTranslations(prev => prev.filter(t => !deletedTranslationIds.includes(t.id)))
    }

    const deletedTranscriptionIds: string[] = []
    for (const id of transcriptionIds) {
      try {
        await deleteTranscriptionDb(currentProjectId, id)
        deletedTranscriptionIds.push(id)
      } catch {
        errorCount++
      }
    }
    if (deletedTranscriptionIds.length > 0) {
      const remaining = (baseProject?.transcriptions ?? transcriptions.map(t => t.id)).filter(tid => !deletedTranscriptionIds.includes(tid))
      await updateProjectItems(currentProjectId, remaining, "transcriptions")
      setTranscriptions(prev => prev.filter(t => !deletedTranscriptionIds.includes(t.id)))
    }

    const deletedExtractionIds: string[] = []
    for (const id of extractionIds) {
      try {
        await deleteExtractionDb(currentProjectId, id)
        deletedExtractionIds.push(id)
      } catch {
        errorCount++
      }
    }
    if (deletedExtractionIds.length > 0) {
      const remaining = (baseProject?.extractions ?? extractions.map(e => e.id)).filter(eid => !deletedExtractionIds.includes(eid))
      await updateProjectItems(currentProjectId, remaining, "extractions")
      setExtractions(prev => prev.filter(e => !deletedExtractionIds.includes(e.id)))
    }

    setIsProcessing(false)
    setIsDeleteDialogOpen(false)
    await loadProjects()

    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} item${errorCount > 1 ? "s" : ""}`)
    } else {
      const parts: string[] = []
      if (deletedTranslationIds.length > 0) parts.push(`${deletedTranslationIds.length} translation${deletedTranslationIds.length > 1 ? "s" : ""}`)
      if (deletedTranscriptionIds.length > 0) parts.push(`${deletedTranscriptionIds.length} transcription${deletedTranscriptionIds.length > 1 ? "s" : ""}`)
      if (deletedExtractionIds.length > 0) parts.push(`${deletedExtractionIds.length} extraction${deletedExtractionIds.length > 1 ? "s" : ""}`)
      toast.success(`${parts.join(", ")} deleted`)
    }

    setSelectedIds(new Map())
    setIsSelecting(false)
  }, [selectedIds, currentProjectId, translations, transcriptions, extractions, deleteTranslationDb, deleteTranscriptionDb, deleteExtractionDb, updateProjectItems, loadProjects, setTranslations, setTranscriptions, setExtractions])

  const handleMoveSelected = useCallback(async (targetProjectId: string) => {
    setIsProcessing(true)
    let errorCount = 0

    const storeProject = useProjectStore.getState().currentProject
    const baseProject = storeProject && storeProject.id === currentProjectId ? storeProject : null

    const translationIds = (baseProject?.translations ?? translations.map(t => t.id)).filter(id => selectedIds.has(id))
    const transcriptionIds = (baseProject?.transcriptions ?? transcriptions.map(t => t.id)).filter(id => selectedIds.has(id))
    const extractionIds = (baseProject?.extractions ?? extractions.map(e => e.id)).filter(id => selectedIds.has(id))

    const orderedItems: [string, ItemType][] = [
      ...translationIds.map(id => [id, "translation"] as [string, ItemType]),
      ...transcriptionIds.map(id => [id, "transcription"] as [string, ItemType]),
      ...extractionIds.map(id => [id, "extraction"] as [string, ItemType]),
    ]

    const movedTranslationIds: string[] = []
    const movedTranscriptionIds: string[] = []
    const movedExtractionIds: string[] = []

    for (const [id, type] of orderedItems) {
      try {
        if (type === "translation") {
          await moveTranslationDb(currentProjectId, targetProjectId, id)
          movedTranslationIds.push(id)
        } else if (type === "transcription") {
          await moveTranscriptionDb(currentProjectId, targetProjectId, id)
          movedTranscriptionIds.push(id)
        } else {
          await moveExtractionDb(currentProjectId, targetProjectId, id)
          movedExtractionIds.push(id)
        }
      } catch {
        errorCount++
      }
    }

    if (movedTranslationIds.length > 0) {
      const remaining = (baseProject?.translations ?? translations.map(t => t.id)).filter(tid => !movedTranslationIds.includes(tid))
      await updateProjectItems(currentProjectId, remaining, "translations")
      setTranslations(prev => prev.filter(t => !movedTranslationIds.includes(t.id)))
    }
    if (movedTranscriptionIds.length > 0) {
      const remaining = (baseProject?.transcriptions ?? transcriptions.map(t => t.id)).filter(tid => !movedTranscriptionIds.includes(tid))
      await updateProjectItems(currentProjectId, remaining, "transcriptions")
      setTranscriptions(prev => prev.filter(t => !movedTranscriptionIds.includes(t.id)))
    }
    if (movedExtractionIds.length > 0) {
      const remaining = (baseProject?.extractions ?? extractions.map(e => e.id)).filter(eid => !movedExtractionIds.includes(eid))
      await updateProjectItems(currentProjectId, remaining, "extractions")
      setExtractions(prev => prev.filter(e => !movedExtractionIds.includes(e.id)))
    }

    await loadProjects()

    setIsProcessing(false)
    setIsMoveDialogOpen(false)

    if (errorCount > 0) {
      toast.error(`Failed to move ${errorCount} item${errorCount > 1 ? "s" : ""}`)
    } else {
      const parts: string[] = []
      if (movedTranslationIds.length > 0) parts.push(`${movedTranslationIds.length} translation${movedTranslationIds.length > 1 ? "s" : ""}`)
      if (movedTranscriptionIds.length > 0) parts.push(`${movedTranscriptionIds.length} transcription${movedTranscriptionIds.length > 1 ? "s" : ""}`)
      if (movedExtractionIds.length > 0) parts.push(`${movedExtractionIds.length} extraction${movedExtractionIds.length > 1 ? "s" : ""}`)
      toast.success(`${parts.join(", ")} moved`)
    }

    setSelectedIds(new Map())
    setIsSelecting(false)
  }, [selectedIds, currentProjectId, translations, transcriptions, extractions, moveTranslationDb, moveTranscriptionDb, moveExtractionDb, updateProjectItems, loadProjects, setTranslations, setTranscriptions, setExtractions])

  const deleteMessage = useMemo(() => {
    const parts: string[] = []
    if (selectedCounts.translations > 0) parts.push(`${selectedCounts.translations} translation${selectedCounts.translations > 1 ? "s" : ""}`)
    if (selectedCounts.transcriptions > 0) parts.push(`${selectedCounts.transcriptions} transcription${selectedCounts.transcriptions > 1 ? "s" : ""}`)
    if (selectedCounts.extractions > 0) parts.push(`${selectedCounts.extractions} extraction${selectedCounts.extractions > 1 ? "s" : ""}`)
    if (parts.length === 0) return "Are you sure you want to delete the selected item?"
    if (parts.length === 1) return `Are you sure you want to delete ${parts[0]}?`
    const last = parts.pop()
    return `Are you sure you want to delete ${parts.join(", ")} and ${last}?`
  }, [selectedCounts])

  return {
    isSelecting,
    selectedIds,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    isProcessing,
    selectedCounts,
    allSelected,
    hasActiveOperations,
    hasTranslations,
    hasTranscriptions,
    hasExtractions,
    deleteMessage,
    projects,
    exitSelectMode,
    toggleSelectMode,
    handleSelectToggle,
    handleSelectAllToggle,
    handleSelectTypeOnly,
    handleDeleteSelected,
    handleMoveSelected,
    selectedCount: selectedIds.size,
  }
}
