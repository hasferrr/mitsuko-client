"use client"

import { useEffect, useState, useRef, useEffectEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Files,
  Plus,
  Loader2,
  Archive,
  ChevronDown,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useProjectActions } from "@/hooks/project/use-project-actions"
import { useCardGridSelection } from "@/hooks/project/use-card-grid-selection"
import { CardGridSelectionBar } from "@/components/shared/card-grid-selection-bar"
import { ConfirmDialogue } from "@/components/shared/confirm-dialogue"
import { DeleteDialogue } from "@/components/ui-custom/delete-dialogue"
import BatchMain from "./batch-main"
import { SortableBatchCard } from "./sortable-batch-card"
import { ArchivedBatchCard } from "./archived-batch-card"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"

export default function Batch() {
  const [archivedCollapsed, setArchivedCollapsed] = useState(true)
  const archivedCollapsedBeforeSelect = useRef(true)
  const batch = useProjectStore((state) => state.currentProject)
  const projects = useProjectStore((state) => state.projects)
  const loading = useProjectStore(state => state.loading)
  const hasLoaded = useProjectStore(state => state.hasLoaded)
  const createProject = useProjectStore((state) => state.createProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const reorderProjects = useProjectStore(state => state.reorderProjects)
  const batchProjects = projects.filter(p => p.isBatch)
  const activeBatchProjects = batchProjects.filter(p => !p.isArchived)
  const archivedBatchProjects = batchProjects.filter(p => p.isArchived)

  const {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    promptDelete,
    handleConfirmDelete,
    handleExport,
    handleArchive,
  } = useProjectActions()

  const selection = useCardGridSelection({
    activeItems: activeBatchProjects,
    archivedItems: archivedBatchProjects,
    itemType: "batch",
  })

  const onArchivedCollapseSync = useEffectEvent(() => {
    if (selection.isSelecting) {
      archivedCollapsedBeforeSelect.current = archivedCollapsed
      setArchivedCollapsed(false)
    } else {
      setArchivedCollapsed(archivedCollapsedBeforeSelect.current)
    }
  })

  useEffect(() => {
    onArchivedCollapseSync()
  }, [selection.isSelecting])

  const onEscapeKey = useEffectEvent(() => {
    selection.toggleSelectMode()
  })

  useEffect(() => {
    if (!selection.isSelecting) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeKey()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selection.isSelecting])

  const translationData = useTranslationDataStore((state) => state.data)
  const extractionData = useExtractionDataStore(state => state.data)
  const transcriptionData = useTranscriptionDataStore(state => state.data)
  const loadTranslations = useTranslationDataStore((state) => state.getTranslationsDb)
  const loadExtractions = useExtractionDataStore(state => state.getExtractionsDb)
  const loadTranscriptions = useTranscriptionDataStore(state => state.getTranscriptionsDb)
  const loadTranscription = useTranscriptionDataStore(state => state.getTranscriptionDb)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex(p => p.id === active.id)
      const newIndex = projects.findIndex(p => p.id === over.id)
      const newOrder = arrayMove(projects.map(p => p.id), oldIndex, newIndex)
      await reorderProjects(newOrder)
    }
  }

  useEffect(() => {
    if (!batch || !batch.isBatch) return
    const missing = batch.translations.filter(id => !translationData[id])
    if (missing.length === 0) return
    loadTranslations(missing).catch(err => console.error('Failed to load translations', err))
  }, [batch, translationData, loadTranslations])

  useEffect(() => {
    if (!batch || !batch.isBatch) return
    const missing = batch.extractions.filter(id => !extractionData[id])
    if (missing.length === 0) return
    loadExtractions(missing).catch(err => console.error('Failed to load extractions', err))
  }, [batch, extractionData, loadExtractions])

  useEffect(() => {
    if (!batch || !batch.isBatch) return
    const missing = batch.transcriptions.filter(id => !transcriptionData[id])
    if (missing.length === 0) return
    loadTranscriptions(missing).catch(err => console.error('Failed to load transcriptions', err))
  }, [batch, transcriptionData, loadTranscriptions])

  useEffect(() => {
    if (!batch || !batch.isBatch || !batch.defaultTranscriptionId) return
    if (!transcriptionData[batch.defaultTranscriptionId]) {
      loadTranscription(batch.defaultTranscriptionId).catch(err => {
        console.error('Failed to load default transcription:', err)
      })
    }
  }, [batch, transcriptionData, loadTranscription])

  const handleCreateBatch = async () => {
    const newBatch = await createProject(`Batch ${new Date().toLocaleDateString()}`, true)
    setCurrentProject(newBatch)
  }

  const BatchCardSkeleton = () => {
    return (
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="size-4" />
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="flex-1" />
          <div className="flex flex-col gap-1 mt-auto">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!batch || !batch.isBatch) {
    const skeletonCount = activeBatchProjects.length > 0 ? activeBatchProjects.length : 3
    const showSkeletons = !hasLoaded
    const isCreateDisabled = !hasLoaded || loading
    const hasAnyCards = activeBatchProjects.length > 0 || archivedBatchProjects.length > 0
    return (
      <div className="flex flex-col gap-4 mx-auto container p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Select a Batch</h2>
          <div className="flex gap-2">
            {hasAnyCards && !showSkeletons && (
              <Button
                variant="outline"
                onClick={selection.toggleSelectMode}
              >
                <CheckSquare className="size-4" />
                {selection.isSelecting ? "Cancel" : "Select"}
              </Button>
            )}
            <Button onClick={handleCreateBatch} disabled={isCreateDisabled || selection.isSelecting}>
              {isCreateDisabled ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Create New Batch
            </Button>
          </div>
        </div>

        {showSkeletons ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <BatchCardSkeleton key={`batch-skeleton-${index}`} />
            ))}
          </div>
        ) : activeBatchProjects.length === 0 && archivedBatchProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
            <Files className="size-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2 text-center">Batch Projects</h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create a new batch to translate, transcribe, or extract multiple files at once.
              <br />
              Supports subtitles, audio files, and more.
            </p>
          </div>
        ) : (
          <>
            {activeBatchProjects.length > 0 && (
              selection.isSelecting ? (
                <div translate="no" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBatchProjects.map((b) => (
                    <SortableBatchCard
                      key={b.id}
                      project={b}
                      onSelect={() => {}}
                      onToggleArchive={handleArchive}
                      onExport={handleExport}
                      onDelete={promptDelete}
                      selectMode
                      selected={selection.selectedIds.has(b.id)}
                      onSelectToggle={selection.handleSelectToggle}
                    />
                  ))}
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={activeBatchProjects.map(p => p.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div translate="no" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeBatchProjects.map((b) => (
                        <SortableBatchCard key={b.id} project={b} onSelect={(id) => setCurrentProject(id)} onToggleArchive={handleArchive} onExport={handleExport} onDelete={promptDelete} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )
            )}

            {archivedBatchProjects.length > 0 && (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setArchivedCollapsed(v => !v)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", archivedCollapsed && "-rotate-90")} />
                  <Archive className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Archived</h3>
                  <span className="text-xs text-muted-foreground">({archivedBatchProjects.length})</span>
                </button>
                {!archivedCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedBatchProjects.map(b => (
                      <ArchivedBatchCard
                        key={b.id}
                        project={b}
                        onSelect={(id) => setCurrentProject(id)}
                        onToggleArchive={handleArchive}
                        onExport={handleExport}
                        onDelete={promptDelete}
                        selectMode={selection.isSelecting}
                        selected={selection.selectedIds.has(b.id)}
                        onSelectToggle={selection.handleSelectToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <CardGridSelectionBar
          open={selection.isSelecting}
          selectedCount={selection.selectedIds.size}
          activeSelectedCount={selection.activeSelectedCount}
          archivedSelectedCount={selection.archivedSelectedCount}
          isProcessing={selection.isProcessing}
          allSelected={selection.allSelected}
          hasActiveItems={activeBatchProjects.length > 0}
          hasArchivedItems={archivedBatchProjects.length > 0}
          onDelete={() => selection.setIsDeleteDialogOpen(true)}
          onArchive={() => selection.setIsArchiveDialogOpen(true)}
          onUnarchive={() => selection.setIsUnarchiveDialogOpen(true)}
          onExport={selection.handleExportSelected}
          onSelectAllToggle={selection.handleSelectAllToggle}
          onSelectActiveOnly={selection.handleSelectActiveOnly}
          onSelectArchivedOnly={selection.handleSelectArchivedOnly}
          onCancel={selection.toggleSelectMode}
        />

        <DeleteDialogue
          handleDelete={handleConfirmDelete}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          isProcessing={isDeleting}
        />

        <DeleteDialogue
          handleDelete={selection.handleDeleteSelected}
          isDeleteModalOpen={selection.isDeleteDialogOpen}
          setIsDeleteModalOpen={selection.setIsDeleteDialogOpen}
          isProcessing={selection.isProcessing}
        />

        <ConfirmDialogue
          open={selection.isArchiveDialogOpen}
          onOpenChange={selection.setIsArchiveDialogOpen}
          title="Confirm Archive"
          description={`Are you sure you want to archive ${selection.activeSelectedCount} batch${selection.activeSelectedCount > 1 ? "es" : ""}?`}
          confirmLabel="Archive"
          onConfirm={selection.handleArchiveSelected}
          isProcessing={selection.isProcessing}
        />

        <ConfirmDialogue
          open={selection.isUnarchiveDialogOpen}
          onOpenChange={selection.setIsUnarchiveDialogOpen}
          title="Confirm Unarchive"
          description={`Are you sure you want to unarchive ${selection.archivedSelectedCount} batch${selection.archivedSelectedCount > 1 ? "es" : ""}?`}
          confirmLabel="Unarchive"
          onConfirm={selection.handleUnarchiveSelected}
          isProcessing={selection.isProcessing}
        />
      </div>
    )
  }

  return <BatchMain />
}
