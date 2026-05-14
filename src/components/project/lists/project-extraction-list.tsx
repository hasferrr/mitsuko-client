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
import { FileText, Loader2, Settings2, Plus, ListChecks } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectItemList } from "../project-item-list"
import { Extraction, Project } from "@/types/project"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useRouter } from "next/navigation"
import { ProjectItemSkeleton } from "../project-item-skeleton"
import { ItemType } from "@/hooks/project/use-project-item-selection"
import { ExtractionBadges } from "@/components/extract-context/extraction-badges"

interface ProjectExtractionListProps {
  currentProject: Project
  extractions: Extraction[]
  setExtractions: React.Dispatch<React.SetStateAction<Extraction[]>>
  isLoadingData: boolean
  onDragEnd: (event: DragEndEvent, type: 'translation' | 'transcription' | 'extraction') => void
  onOpenSettings: () => void
  title?: string
  selectMode?: boolean
  selectedIds: Map<string, ItemType>
  onSelectToggle: (id: string, type: ItemType) => void
  onToggleSelectMode: () => void
  isSelecting?: boolean
}

export function ProjectExtractionList({
  currentProject,
  extractions,
  setExtractions,
  isLoadingData,
  onDragEnd,
  onOpenSettings,
  title = "Extractions",
  selectMode = false,
  selectedIds,
  onSelectToggle,
  onToggleSelectMode,
  isSelecting = false,
}: ProjectExtractionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const createExtractionDb = useExtractionDataStore((state) => state.createExtractionDb)
  const setCurrentId = useExtractionDataStore((state) => state.setCurrentId)
  const updateExtractionDb = useExtractionDataStore((state) => state.updateExtractionDb)
  const deleteExtractionDb = useExtractionDataStore((state) => state.deleteExtractionDb)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

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
      badges={<ExtractionBadges extraction={extraction} runningIds={isExtractingSet} size="compact" className="shrink-0" />}
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
      selectMode={selectMode}
      selected={selectedIds.has(extraction.id)}
      onSelectToggle={() => onSelectToggle(extraction.id, "extraction")}
    />
  ))

  const itemsList = isLoadingData
    ? Array.from({ length: 3 }).map((_, i) => <ProjectItemSkeleton key={`extraction-skeleton-${i}`} />)
    : extractionComponentList

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isSelecting ? "secondary" : "outline"}
            onClick={onToggleSelectMode}
            title="Select mode"
          >
            <ListChecks className="size-4" />
            {isSelecting ? "Cancel" : "Select"}
          </Button>
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
            disabled={isCreating}
            onClick={async () => {
              setIsCreating(true)
              try {
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
                const storeProject = useProjectStore.getState().currentProject
                const base = storeProject && storeProject.id === currentProject.id ? storeProject.extractions : currentProject.extractions
                setCurrentId(created.id)
                router.push("/extract-context")
                updateProjectItems(currentProject.id, [...base, created.id], 'extraction')
              } catch {
                setIsCreating(false)
              }
            }}
          >
            {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            New Extraction
          </Button>
        </div>
      </div>
      {selectMode ? (
        <div className="space-y-3">
          {itemsList}
        </div>
      ) : (
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
            {itemsList}
          </div>
        </SortableContext>
      </DndContext>
      )}
      </CardContent>
    </Card>
  )
}
