"use client"

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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { FileText, Loader2, Settings2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectItemList } from "../project-item-list"
import { Extraction, Project } from "@/types/project"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { ProjectItemSkeleton } from "../project-item-skeleton"

interface ProjectExtractionListProps {
  currentProject: Project
  extractions: Extraction[]
  setExtractions: React.Dispatch<React.SetStateAction<Extraction[]>>
  isLoadingData: boolean
  onDragEnd: (event: DragEndEvent, type: 'translation' | 'transcription' | 'extraction') => void
  onOpenSettings: () => void
  title?: string
}

export function ProjectExtractionList({
  currentProject,
  extractions,
  setExtractions,
  isLoadingData,
  onDragEnd,
  onOpenSettings,
  title = "Extractions"
}: ProjectExtractionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const createExtractionDb = useExtractionDataStore((state) => state.createExtractionDb)
  const updateExtractionDb = useExtractionDataStore((state) => state.updateExtractionDb)
  const deleteExtractionDb = useExtractionDataStore((state) => state.deleteExtractionDb)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)

  const extractionComponentList = extractions.map((extraction) => (
    <ProjectItemList
      key={extraction.id}
      id={extraction.id}
      projectId={currentProject.id}
      type="extraction"
      icon={isExtractingSet.has(extraction.id)
        ? <Loader2 className="size-5 text-purple-500 animate-spin" />
        : <FileText className="size-5 text-purple-500" />}
      title={`Episode ${extraction.episodeNumber || "X"}`}
      subtitle={extraction.title}
      description={extraction.contextResult}
      date={extraction.updatedAt.toLocaleDateString()}
      handleEdit={async (newName) => {
        const updated = await updateExtractionDb(extraction.id, { episodeNumber: newName })
        setExtractions(prev => prev.map(e => e.id === extraction.id ? updated : e))
      }}
      handleDelete={async () => {
        await deleteExtractionDb(currentProject.id, extraction.id)
        {
          const storeProject = useProjectStore.getState().currentProject
          const base = storeProject && storeProject.id === currentProject.id ? storeProject.extractions : currentProject.extractions
          await updateProjectItems(
            currentProject.id,
            base.filter(id => id !== extraction.id),
            'extraction'
          )
        }
        setExtractions(prev => prev.filter(e => e.id !== extraction.id))
      }}
    />
  ))

  return (
    <Card size="sm">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenSettings}
            title="Extraction settings"
          >
            <Settings2 className="size-4" />
            Settings
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const created = await createExtractionDb(
                currentProject.id,
                {
                  title: "",
                  episodeNumber: "",
                  subtitleContent: "",
                  previousContext: "",
                  contextResult: ""
                },
                undefined,
                undefined,
              )
              {
                const storeProject = useProjectStore.getState().currentProject
                const base = storeProject && storeProject.id === currentProject.id ? storeProject.extractions : currentProject.extractions
                await updateProjectItems(currentProject.id, [...base, created.id], 'extraction')
              }
              setExtractions(prev => [created, ...prev])
            }}
          >
            <Plus className="size-4" />
            New Extraction
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => onDragEnd(e, 'extraction')}
      >
        <SortableContext
          items={extractions.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {isLoadingData
              ? Array.from({ length: 3 }).map((_, i) => <ProjectItemSkeleton key={`extraction-skeleton-${i}`} />)
              : extractionComponentList}
          </div>
        </SortableContext>
      </DndContext>
      </CardContent>
    </Card>
  )
}
