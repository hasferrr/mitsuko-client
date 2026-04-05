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
import { Globe, Loader2, Settings2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectItemList } from "../project-item-list"
import { Translation, Project } from "@/types/project"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { ProjectItemSkeleton } from "../project-item-skeleton"

const countTranslatedLines = (subtitles: Translation['subtitles']): { count: number, hasError: boolean } => {
  if (!subtitles || subtitles.length === 0) {
    return { count: 0, hasError: false }
  }

  let hasError = false
  let count = 0
  for (const sub of subtitles) {
    if (!sub || !sub.timestamp) {
      hasError = true
      continue
    }
    if ((sub.translated && sub.translated.trim() !== "") ||
      (sub.content.trim() === "" && sub.translated.trim() === "")) {
      count++
    }
  }
  return { count, hasError }
}

interface ProjectTranslationListProps {
  currentProject: Project
  translations: Translation[]
  setTranslations: React.Dispatch<React.SetStateAction<Translation[]>>
  isLoadingData: boolean
  onDragEnd: (event: DragEndEvent, type: 'translation' | 'transcription' | 'extraction') => void
  onOpenSettings: () => void
  title?: string
}

export function ProjectTranslationList({
  currentProject,
  translations,
  setTranslations,
  isLoadingData,
  onDragEnd,
  onOpenSettings,
  title = "Translations"
}: ProjectTranslationListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const createTranslationDb = useTranslationDataStore((state) => state.createTranslationDb)
  const updateTranslationDb = useTranslationDataStore((state) => state.updateTranslationDb)
  const deleteTranslationDb = useTranslationDataStore((state) => state.deleteTranslationDb)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)

  const translationComponentList = translations.map((translation) => {
    const totalLines = translation.subtitles.length
    const { count: translatedLines, hasError } = countTranslatedLines(translation.subtitles)
    const allTranslated = totalLines > 0 && totalLines === translatedLines
    const type = translation.parsed.type.toUpperCase()
    const errorBadge = hasError ? " (Unexpected error, please delete this translation)" : ""
    const description = allTranslated
      ? `${type} • ${totalLines} Lines` + errorBadge
      : `${type} • ${translatedLines}/${totalLines} Lines` + errorBadge

    return (
      <ProjectItemList
        key={translation.id}
        id={translation.id}
        projectId={currentProject.id}
        type="translation"
        icon={isTranslatingSet.has(translation.id)
          ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          : <Globe className="h-5 w-5 text-blue-500" />}
        title={translation.title}
        description={description}
        date={translation.updatedAt.toLocaleDateString()}
        handleEdit={async (newName) => {
          const updated = await updateTranslationDb(translation.id, { title: newName })
          setTranslations(prev => prev.map(t => t.id === translation.id ? updated : t))
        }}
        handleDelete={async () => {
          await deleteTranslationDb(currentProject.id, translation.id)
          {
            const storeProject = useProjectStore.getState().currentProject
            const base = storeProject && storeProject.id === currentProject.id ? storeProject.translations : currentProject.translations
            await updateProjectItems(
              currentProject.id,
              base.filter(id => id !== translation.id),
              'translation'
            )
          }
          setTranslations(prev => prev.filter(t => t.id !== translation.id))
        }}
      />
    )
  })

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenSettings}
            title="Translation settings"
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const created = await createTranslationDb(
                currentProject.id,
                {
                  title: `Subtitle ${new Date().toLocaleDateString()} ${crypto.randomUUID().slice(0, 5)}`,
                  subtitles: [],
                  parsed: {
                    type: "srt",
                    data: null
                  }
                },
                undefined,
                undefined,
              )
              {
                const storeProject = useProjectStore.getState().currentProject
                const base = storeProject && storeProject.id === currentProject.id ? storeProject.translations : currentProject.translations
                await updateProjectItems(currentProject.id, [...base, created.id], 'translation')
              }
              setTranslations(prev => [created, ...prev])
            }}
          >
            <Plus className="h-4 w-4" />
            New Translation
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => onDragEnd(e, 'translation')}
      >
        <SortableContext
          items={translations.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {isLoadingData
              ? Array.from({ length: 3 }).map((_, i) => <ProjectItemSkeleton key={`translation-skeleton-${i}`} />)
              : translationComponentList}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
