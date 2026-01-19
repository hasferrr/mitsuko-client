"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Files,
  Plus,
  Loader2,
} from "lucide-react"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import BatchMain from "./batch-main"
import { SortableBatchCard } from "./sortable-batch-card"
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
  const batch = useProjectStore((state) => state.currentProject)
  const projects = useProjectStore((state) => state.projects)
  const loading = useProjectStore(state => state.loading)
  const hasLoaded = useProjectStore(state => state.hasLoaded)
  const createProject = useProjectStore((state) => state.createProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const reorderProjects = useProjectStore(state => state.reorderProjects)
  const batchProjects = projects.filter(p => p.isBatch)

  // Load data for selected batch
  const translationData = useTranslationDataStore((state) => state.data)
  const extractionData = useExtractionDataStore(state => state.data)
  const loadTranslations = useTranslationDataStore((state) => state.getTranslationsDb)
  const loadExtractions = useExtractionDataStore(state => state.getExtractionsDb)

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

  // Ensure translations are loaded for current batch project
  useEffect(() => {
    if (!batch || !batch.isBatch) return
    const missing = batch.translations.filter(id => !translationData[id])
    if (missing.length === 0) return
    loadTranslations(missing).catch(err => console.error('Failed to load translations', err))
  }, [batch, translationData, loadTranslations])

  // Ensure extractions are loaded for current batch project
  useEffect(() => {
    if (!batch || !batch.isBatch) return
    const missing = batch.extractions.filter(id => !extractionData[id])
    if (missing.length === 0) return
    loadExtractions(missing).catch(err => console.error('Failed to load extractions', err))
  }, [batch, extractionData, loadExtractions])

  const handleCreateBatch = async () => {
    const newBatch = await createProject(`Batch ${new Date().toLocaleDateString()}`, true)
    setCurrentProject(newBatch)
  }

  const BatchCardSkeleton = () => {
    return (
      <Card className="overflow-hidden border border-muted h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent className="pb-4 flex flex-col flex-1">
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
    const skeletonCount = batchProjects.length > 0 ? batchProjects.length : 3
    const showSkeletons = !hasLoaded
    const isCreateDisabled = !hasLoaded || loading
    return (
      <div className="flex flex-col gap-4 mx-auto container p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Select a Batch</h2>
          <Button onClick={handleCreateBatch} disabled={isCreateDisabled}>
            {isCreateDisabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Create New Batch
          </Button>
        </div>

        {showSkeletons ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <BatchCardSkeleton key={`batch-skeleton-${index}`} />
            ))}
          </div>
        ) : batchProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
            <Files className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2 text-center">Subtitle Batch Translation</h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create a new batch to translate multiple subtitles at once.
              <br />
              Translate SRT, VTT, and ASS files with a single click.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={batchProjects.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div translate="no" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batchProjects.map((b) => (
                  <SortableBatchCard key={b.id} project={b} onSelect={(id) => setCurrentProject(id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    )
  }

  if (!batch.defaultBasicSettingsId || !batch.defaultAdvancedSettingsId) {
    return <div className="p-4">Invalid settings data</div>
  }

  return (
    <BatchMain
      basicSettingsId={batch.defaultBasicSettingsId}
      advancedSettingsId={batch.defaultAdvancedSettingsId}
    />
  )
}
