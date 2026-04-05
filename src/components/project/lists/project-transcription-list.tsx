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
import { Headphones, Loader2, Settings2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectItemList } from "../project-item-list"
import { Transcription, Project } from "@/types/project"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { ProjectItemSkeleton } from "../project-item-skeleton"

interface ProjectTranscriptionListProps {
  currentProject: Project
  transcriptions: Transcription[]
  setTranscriptions: React.Dispatch<React.SetStateAction<Transcription[]>>
  isLoadingData: boolean
  onDragEnd: (event: DragEndEvent, type: 'translation' | 'transcription' | 'extraction') => void
  onOpenSettings: () => void
  title?: string
}

export function ProjectTranscriptionList({
  currentProject,
  transcriptions,
  setTranscriptions,
  isLoadingData,
  onDragEnd,
  onOpenSettings,
  title = "Transcriptions"
}: ProjectTranscriptionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)
  const createTranscriptionDb = useTranscriptionDataStore((state) => state.createTranscriptionDb)
  const updateTranscriptionDb = useTranscriptionDataStore((state) => state.updateTranscriptionDb)
  const deleteTranscriptionDb = useTranscriptionDataStore((state) => state.deleteTranscriptionDb)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)

  const transcriptionComponentList = transcriptions.map((transcription) => (
    <ProjectItemList
      key={transcription.id}
      id={transcription.id}
      projectId={currentProject.id}
      type="transcription"
      icon={isTranscribingSet.has(transcription.id)
        ? <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
        : <Headphones className="h-5 w-5 text-green-500" />}
      title={transcription.title}
      description={`${transcription.transcriptSubtitles.length} segments`}
      date={transcription.createdAt.toLocaleDateString()}
      handleEdit={async (newName) => {
        const updated = await updateTranscriptionDb(transcription.id, { title: newName })
        setTranscriptions(prev => prev.map(t => t.id === transcription.id ? updated : t))
      }}
      handleDelete={async () => {
        await deleteTranscriptionDb(currentProject.id, transcription.id)
        {
          const storeProject = useProjectStore.getState().currentProject
          const base = storeProject && storeProject.id === currentProject.id ? storeProject.transcriptions : currentProject.transcriptions
          await updateProjectItems(
            currentProject.id,
            base.filter(id => id !== transcription.id),
            'transcription'
          )
        }
        setTranscriptions(prev => prev.filter(t => t.id !== transcription.id))
      }}
    />
  ))

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenSettings}
            title="Transcription settings"
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const created = await createTranscriptionDb(currentProject.id, {
                title: `Audio ${new Date().toLocaleDateString()} ${crypto.randomUUID().slice(0, 5)}`,
                transcriptionText: "",
                transcriptSubtitles: [],
              })
              {
                const storeProject = useProjectStore.getState().currentProject
                const base = storeProject && storeProject.id === currentProject.id ? storeProject.transcriptions : currentProject.transcriptions
                await updateProjectItems(currentProject.id, [...base, created.id], 'transcription')
              }
              setTranscriptions(prev => [created, ...prev])
            }}
          >
            <Plus className="h-4 w-4" />
            New Transcription
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => onDragEnd(e, 'transcription')}
      >
        <SortableContext
          items={transcriptions.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {isLoadingData
              ? Array.from({ length: 3 }).map((_, i) => <ProjectItemSkeleton key={`transcription-skeleton-${i}`} />)
              : transcriptionComponentList}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
