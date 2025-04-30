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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Translation, Transcription, Extraction } from "@/types/project"
import { ProjectItemList } from "./project-item-list"
import { useProjectStore } from "@/stores/data/use-project-store"
import { EditDialogue } from "../ui-custom/edit-dialogue"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { db } from "@/lib/db/db"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { NoProjectSelected } from "./no-project-selected"

export const Project = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const loadProjects = useProjectStore((state) => state.loadProjects)
  const currentProject = useProjectStore((state) => state.currentProject)
  const renameProject = useProjectStore((state) => state.renameProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
        if (oldIndex !== -1 && newIndex !== -1) { // Ensure items are found
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

  if (!currentProject) {
    return <NoProjectSelected />
  }

  const handleSave = async (newName: string) => {
    renameProject(currentProject.id, newName.trim())
    setIsEditModalOpen(false)
  }

  const handleDelete = () => {
    deleteProject(currentProject.id)
    setIsDeleteModalOpen(false)
  }

  const translationComponentList = translations.map((translation) => (
    <ProjectItemList
      key={translation.id}
      id={translation.id}
      projectId={currentProject.id}
      type="translation"
      icon={<Globe className="h-5 w-5 text-blue-500" />}
      title={translation.title}
      description={`${translation.parsed.type.toUpperCase()} • ${translation.subtitles.length} Lines`}
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
  ))

  const transcriptionComponentList = transcriptions.map((transcription) => (
    <ProjectItemList
      key={transcription.id}
      id={transcription.id}
      projectId={currentProject.id}
      type="transcription"
      icon={<Headphones className="h-5 w-5 text-green-500" />}
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
      icon={<FileText className="h-5 w-5 text-purple-500" />}
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
        await createTranslationDb(currentProject.id, {
          title: `Subtitle ${new Date().toLocaleDateString()} ${crypto.randomUUID().slice(0, 5)}`,
          subtitles: [],
          parsed: {
            type: "srt",
            data: null
          }
        })
        loadProjects()
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
        await createExtractionDb(currentProject.id, {
          episodeNumber: "",
          subtitleContent: "",
          previousContext: "",
          contextResult: ""
        })
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
          <h1>{currentProject.name}</h1>
          <button onClick={() => setIsEditModalOpen(true)}>
            <Edit size={4 * 5} />
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)}>
            <Trash size={4 * 5} />
          </button>
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
