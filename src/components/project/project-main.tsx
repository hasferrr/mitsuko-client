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
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Translation, Transcription, Extraction, Project } from "@/types/project"
import { ProjectItemList } from "./project-item-list"
import { useProjectStore } from "@/stores/data/use-project-store"
import { EditDialogue } from "../ui-custom/edit-dialogue"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { db } from "@/lib/db/db"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useRouter } from "next/navigation"
import { sleep } from "@/lib/utils"
import { SettingsDialogue } from "./settings-dialogue"
import { useSettings } from "@/hooks/use-settings"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { exportProject } from "@/lib/db/db-io"
import { toast } from "sonner"
import { Badge } from "../ui/badge"

const countTranslatedLines = (subtitles: Translation['subtitles']) => {
  if (!subtitles || subtitles.length === 0) {
    return 0
  }
  let count = 0
  for (const sub of subtitles) {
    if ((sub.translated && sub.translated.trim() !== "") ||
      (sub.content.trim() === "" && sub.translated.trim() === "")) {
      count++
    }
  }
  return count
}

interface ProjectMainProps {
  currentProject: Project
}

export const ProjectMain = ({ currentProject }: ProjectMainProps) => {
  const router = useRouter()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const loadProjects = useProjectStore((state) => state.loadProjects)
  const renameProject = useProjectStore((state) => state.renameProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  const [translations, setTranslations] = useState<Translation[]>([])
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [extractions, setExtractions] = useState<Extraction[]>([])

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

  const getBasicSettings = useSettingsStore((state) => state.getBasicSettings)
  const getAdvancedSettings = useAdvancedSettingsStore((state) => state.getAdvancedSettings)
  const applyModelDefaults = useAdvancedSettingsStore((state) => state.applyModelDefaults)
  const getModelDetail = useSettingsStore((state) => state.getModelDetail)

  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useSettings({
    basicSettingsId: currentProject?.defaultBasicSettingsId || "",
    advancedSettingsId: currentProject?.defaultAdvancedSettingsId || ""
  })

  useEffect(() => {
    if (!currentProject) return

    const loadData = async () => {
      const [translationsData, transcriptionsData, extractionsData] = await Promise.all([
        db.translations.bulkGet(currentProject.translations),
        db.transcriptions.bulkGet(currentProject.transcriptions),
        db.extractions.bulkGet(currentProject.extractions)
      ])

      setTranslations(translationsData.filter((t): t is Translation => !!t).reverse())
      setTranscriptions(transcriptionsData.filter((t): t is Transcription => !!t).reverse())
      setExtractions(extractionsData.filter((e): e is Extraction => !!e).reverse())
    }

    loadData()
  }, [currentProject])

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
    router.push("/dashboard")
    await sleep(1000)
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

  const translationComponentList = translations.map((translation) => {
    const totalLines = translation.subtitles.length

    const translatedLines = countTranslatedLines(translation.subtitles)
    const allTranslated = totalLines > 0 && totalLines === translatedLines
    const type = translation.parsed.type.toUpperCase()

    const description = allTranslated
      ? `${type} • ${totalLines} Lines`
      : `${type} • ${translatedLines}/${totalLines} Lines`

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
          await updateTranslationDb(translation.id, { title: newName })
          mutateTranslationData(translation.id, "title", newName)
          loadProjects()
        }}
        handleDelete={async () => {
          await deleteTranslationDb(currentProject.id, translation.id)
          removeTranslationData(translation.id)
          loadProjects()
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
        await updateTranscriptionDb(transcription.id, { title: newName })
        mutateTranscriptionData(transcription.id, "title", newName)
        loadProjects()
      }}
      handleDelete={async () => {
        await deleteTranscriptionDb(currentProject.id, transcription.id)
        removeTranscriptionData(transcription.id)
        loadProjects()
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
      description={extraction.contextResult}
      date={extraction.updatedAt.toLocaleDateString()}
      handleEdit={async (newName) => {
        await updateExtractionDb(extraction.id, { episodeNumber: newName })
        mutateExtractionData(extraction.id, "episodeNumber", newName)
        loadProjects()
      }}
      handleDelete={async () => {
        await deleteExtractionDb(currentProject.id, extraction.id)
        removeExtractionData(extraction.id)
        loadProjects()
      }}
    />
  ))

  const NewTranslationButton = (
    <Button
      size="sm"
      variant="outline"
      className="line-clamp-2"
      onClick={async () => {
        await createTranslationDb(
          currentProject.id,
          {
            title: `Subtitle ${new Date().toLocaleDateString()} ${crypto.randomUUID().slice(0, 5)}`,
            subtitles: [],
            parsed: {
              type: "srt",
              data: null
            }
          },
          getBasicSettings() ?? {},
          applyModelDefaults(
            getAdvancedSettings() ?? DEFAULT_ADVANCED_SETTINGS,
            getModelDetail() ?? null
          ),
        )
        loadProjects()
      }}
      disabled={currentProject.isBatch}
    >
      {currentProject.isBatch ? "Disabled in Batch Projects" : "New Translation"}
    </Button>
  )

  const NewTranscriptionButton = (
    <Button
      size="sm"
      variant="outline"
      className="line-clamp-2"
      onClick={async () => {
        await createTranscriptionDb(currentProject.id, {
          title: `Audio ${new Date().toLocaleDateString()} ${crypto.randomUUID().slice(0, 5)}`,
          transcriptionText: "",
          transcriptSubtitles: []
        })
        loadProjects()
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
        await createExtractionDb(
          currentProject.id,
          {
            episodeNumber: "",
            subtitleContent: "",
            previousContext: "",
            contextResult: ""
          },
          getBasicSettings() ?? {},
          getAdvancedSettings() ?? {},
        )
        loadProjects()
      }}
    >
      New Extraction
    </Button>
  )

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="text-2xl font-medium mb-2 flex gap-4 items-center">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentProject(null)}>
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
      />

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
                <h3 className="text-sm font-medium">Translations {currentProject.isBatch && "(Shared Settings)"}</h3>
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
                    {translationComponentList}
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
                    {transcriptionComponentList}
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
                    {extractionComponentList}
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
                  {translationComponentList}
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
                  {transcriptionComponentList}
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
                  {extractionComponentList}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}