"use client"

import { useEffect, useState } from "react"
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  Globe,
  Headphones,
  LayoutDashboard,
  FileText,
  Edit,
  Trash,
  Loader2,
  Settings,
  ArrowLeft,
  ArrowLeftRight,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Translation, Transcription, Extraction, Project } from "@/types/project"
import { ProjectItemList } from "./project-item-list"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useRouter } from "next/navigation"
import { EditDialogue } from "../ui-custom/edit-dialogue"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { db } from "@/lib/db/db"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { SettingsDialogue } from "../settings-dialogue"
import { exportProject } from "@/lib/db/db-io"
import { toast } from "sonner"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "../ui/dialog"
import { Skeleton } from "../ui/skeleton"

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

interface ProjectMainProps {
  currentProject: Project
}

export const ProjectMain = ({ currentProject }: ProjectMainProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [isProcessingConvert, setIsProcessingConvert] = useState(false)
  const router = useRouter()

  const renameProject = useProjectStore((state) => state.renameProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)
  const updateProjectStore = useProjectStore(state => state.updateProject)

  const [translations, setTranslations] = useState<Translation[]>([])
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [extractions, setExtractions] = useState<Extraction[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const mutateTranslationData = useTranslationDataStore((state) => state.mutateData)
  const removeTranslationData = useTranslationDataStore((state) => state.removeData)
  const mutateTranscriptionData = useTranscriptionDataStore((state) => state.mutateData)
  const removeTranscriptionData = useTranscriptionDataStore((state) => state.removeData)
  const mutateExtractionData = useExtractionDataStore((state) => state.mutateData)
  const removeExtractionData = useExtractionDataStore((state) => state.removeData)

  const createTranslationDb = useTranslationDataStore((state) => state.createTranslationDb)
  const updateTranslationDb = useTranslationDataStore((state) => state.updateTranslationDb)
  const deleteTranslationDb = useTranslationDataStore((state) => state.deleteTranslationDb)

  const createExtractionDb = useExtractionDataStore((state) => state.createExtractionDb)
  const updateExtractionDb = useExtractionDataStore((state) => state.updateExtractionDb)
  const deleteExtractionDb = useExtractionDataStore((state) => state.deleteExtractionDb)

  const createTranscriptionDb = useTranscriptionDataStore((state) => state.createTranscriptionDb)
  const updateTranscriptionDb = useTranscriptionDataStore((state) => state.updateTranscriptionDb)
  const deleteTranscriptionDb = useTranscriptionDataStore((state) => state.deleteTranscriptionDb)

  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      const [translationsData, transcriptionsData, extractionsData] = await Promise.all([
        db.translations.bulkGet(currentProject.translations),
        db.transcriptions.bulkGet(currentProject.transcriptions),
        db.extractions.bulkGet(currentProject.extractions)
      ])

      setTranslations(translationsData.filter((t): t is Translation => !!t).reverse())
      setTranscriptions(transcriptionsData.filter((t): t is Transcription => !!t).reverse())
      setExtractions(extractionsData.filter((e): e is Extraction => !!e).reverse())
      setIsLoadingData(false)
    }

    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id])

  // Drag and drop handlers
  function handleDragEnd(event: DragEndEvent, type: 'translation' | 'transcription' | 'extraction') {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const updateOrder = <T extends { id: string }>(
        items: T[],
        setItems: React.Dispatch<React.SetStateAction<T[]>>
      ) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(items, oldIndex, newIndex)
          setItems(newOrder)
          if (currentProject) {
            updateProjectItems(currentProject.id, newOrder.map((item) => item.id).toReversed(), type)
          }
        }
      }

      switch (type) {
        case 'translation':
          updateOrder(translations, setTranslations)
          break
        case 'transcription':
          updateOrder(transcriptions, setTranscriptions)
          break
        case 'extraction':
          updateOrder(extractions, setExtractions)
          break
      }
    }
  }

  const handleSave = async (newName: string) => {
    renameProject(currentProject.id, newName.trim())
    setIsEditModalOpen(false)
  }

  const handleDelete = async () => {
    setIsDeleteModalOpen(false)
    await deleteProject(currentProject.id)
  }

  const handleExportProject = async () => {
    try {
      const result = await exportProject(currentProject.id)
      if (result) {
        const blob = new Blob([result.content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mitsuko-project-${result.name.replace(/\s+/g, "_")}-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Project exported successfully")
      }
    } catch (error) {
      console.error("Error exporting project:", error)
      toast.error("Failed to export project")
    }
  }

  const handleBack = () => {
    if (currentProject.isBatch) router.push("/batch")
    else setCurrentProject(null)
  }

  const handleToggleBatch = async (): Promise<boolean> => {
    try {
      const updated = await updateProjectStore(currentProject.id, { isBatch: !currentProject.isBatch })
      if (updated) {
        setCurrentProject(updated)
        toast.success(`Converted to ${updated.isBatch ? 'Batch' : 'Normal'} project`)
        return true
      }
    } catch (error) {
      console.error('Failed to toggle batch mode', error)
      toast.error('Failed to convert project')
    }
    return false
  }

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
          mutateTranslationData(translation.id, "title", newName)
          setTranslations(prev => prev.map(t => t.id === translation.id ? updated : t))
        }}
        handleDelete={async () => {
          await deleteTranslationDb(currentProject.id, translation.id)
          removeTranslationData(translation.id)
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
        mutateTranscriptionData(transcription.id, "title", newName)
        setTranscriptions(prev => prev.map(t => t.id === transcription.id ? updated : t))
      }}
      handleDelete={async () => {
        await deleteTranscriptionDb(currentProject.id, transcription.id)
        removeTranscriptionData(transcription.id)
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

  const extractionComponentList = extractions.map((extraction) => (
    <ProjectItemList
      key={extraction.id}
      id={extraction.id}
      projectId={currentProject.id}
      type="extraction"
      icon={isExtractingSet.has(extraction.id)
        ? <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
        : <FileText className="h-5 w-5 text-purple-500" />}
      title={`Episode ${extraction.episodeNumber || "X"}`}
      subtitle={extraction.title}
      description={extraction.contextResult}
      date={extraction.updatedAt.toLocaleDateString()}
      handleEdit={async (newName) => {
        const updated = await updateExtractionDb(extraction.id, { episodeNumber: newName })
        mutateExtractionData(extraction.id, "episodeNumber", newName)
        setExtractions(prev => prev.map(e => e.id === extraction.id ? updated : e))
      }}
      handleDelete={async () => {
        await deleteExtractionDb(currentProject.id, extraction.id)
        removeExtractionData(extraction.id)
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

  const NewTranslationButton = (
    <Button
      size="sm"
      variant="outline"
      className="line-clamp-2"
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
      New Translation
    </Button>
  )

  const NewTranscriptionButton = (
    <Button
      size="sm"
      variant="outline"
      className="line-clamp-2"
      onClick={async () => {
        const created = await createTranscriptionDb(currentProject.id, {
          title: `Audio ${new Date().toLocaleDateString()} ${crypto.randomUUID().slice(0, 5)}`,
          transcriptionText: "",
          transcriptSubtitles: []
        })
        {
          const storeProject = useProjectStore.getState().currentProject
          const base = storeProject && storeProject.id === currentProject.id ? storeProject.transcriptions : currentProject.transcriptions
          await updateProjectItems(currentProject.id, [...base, created.id], 'transcription')
        }
        setTranscriptions(prev => [created, ...prev])
      }}
    >
      New Transcription
    </Button>
  )

  const NewExtractionButton = (
    <Button
      size="sm"
      variant="outline"
      className="line-clamp-2"
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
      New Extraction
    </Button>
  )

  const ProjectItemSkeleton = () => (
    <div className="border border-border rounded-lg p-3 bg-background">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="bg-secondary p-2 rounded-lg">
            <div className="h-5 w-5 rounded" />
          </Skeleton>
          <div className="space-y-1">
            <Skeleton className="h-[14px] w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
    </div>
  )

  const translationSkeletons = Array.from({ length: 3 }).map((_, i) => (
    <ProjectItemSkeleton key={`translation-skeleton-${i}`} />
  ))

  const transcriptionSkeletons = Array.from({ length: 3 }).map((_, i) => (
    <ProjectItemSkeleton key={`transcription-skeleton-${i}`} />
  ))

  const extractionSkeletons = Array.from({ length: 3 }).map((_, i) => (
    <ProjectItemSkeleton key={`extraction-skeleton-${i}`} />
  ))

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="text-2xl font-medium mb-2 flex gap-4 items-center">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1>{currentProject.name}</h1>
            {currentProject.isBatch && <Badge className="ml-2">Batch Project</Badge>}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 hover:underline"
            >
              <Edit size={4 * 5} />
              Rename
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 hover:underline"
            >
              <Settings size={4 * 5} />
              Settings
            </button>
            <button
              onClick={handleExportProject}
              className="flex items-center gap-2 hover:underline"
            >
              <Upload size={4 * 5} />
              Export
            </button>
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="flex items-center gap-2 hover:underline"
            >
              <ArrowLeftRight size={4 * 5} />
              Convert
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 hover:underline"
            >
              <Trash size={4 * 5} />
              Delete
            </button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Last updated: {currentProject.updatedAt.toLocaleDateString()}
        </p>
      </div>

      <EditDialogue
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialValue={currentProject.name}
        onSave={handleSave}
      />

      <DeleteDialogue
        handleDelete={handleDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
      />

      <SettingsDialogue
        isOpen={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        projectName={currentProject.name}
        basicSettingsId={currentProject.defaultBasicSettingsId}
        advancedSettingsId={currentProject.defaultAdvancedSettingsId}
      />

      {/* Convert Confirmation Dialog */}
      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Project</DialogTitle>
          </DialogHeader>
          <DialogDescription className="hidden" />
          <p className="text-sm">
            {`Are you sure you want to convert this project to ${currentProject.isBatch ? 'Normal' : 'Batch'} project?`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsProcessingConvert(true)
                const ok = await handleToggleBatch()
                setIsProcessingConvert(false)
                if (ok) setIsConvertModalOpen(false)
              }}
              disabled={isProcessingConvert}
            >
              {isProcessingConvert ? 'Converting...' : 'Convert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="bg-card border border-border p-1 rounded-lg w-fit h-fit flex flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-secondary rounded-md">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview ({translations.length + transcriptions.length + extractions.length})
          </TabsTrigger>
          <TabsTrigger value="translations" className="data-[state=active]:bg-secondary rounded-md">
            <Globe className="h-4 w-4 mr-2" />
            Translations ({translations.length})
          </TabsTrigger>
          <TabsTrigger value="transcriptions" className="data-[state=active]:bg-secondary rounded-md">
            <Headphones className="h-4 w-4 mr-2" />
            Transcriptions ({transcriptions.length})
          </TabsTrigger>
          <TabsTrigger value="context-extractor" className="data-[state=active]:bg-secondary rounded-md">
            <FileText className="h-4 w-4 mr-2" />
            Extractions ({extractions.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Translations</h3>
                {NewTranslationButton}
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'translation')}
              >
                <SortableContext
                  items={translations.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {isLoadingData ? translationSkeletons : translationComponentList}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Transcriptions</h3>
                {NewTranscriptionButton}
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'transcription')}
              >
                <SortableContext
                  items={transcriptions.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {isLoadingData ? transcriptionSkeletons : transcriptionComponentList}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Extractions</h3>
                {NewExtractionButton}
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'extraction')}
              >
                <SortableContext
                  items={extractions.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {isLoadingData ? extractionSkeletons : extractionComponentList}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Translations</h3>
              {NewTranslationButton}
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, 'translation')}
            >
              <SortableContext
                items={translations.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {isLoadingData ? translationSkeletons : translationComponentList}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </TabsContent>

        {/* Transcriptions Tab */}
        <TabsContent value="transcriptions" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Transcriptions</h3>
              {NewTranscriptionButton}
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, 'transcription')}
            >
              <SortableContext
                items={transcriptions.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {isLoadingData ? transcriptionSkeletons : transcriptionComponentList}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </TabsContent>

        {/* Extractions Tab */}
        <TabsContent value="context-extractor" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Extractions</h3>
              {NewExtractionButton}
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, 'extraction')}
            >
              <SortableContext
                items={extractions.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {isLoadingData ? extractionSkeletons : extractionComponentList}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}