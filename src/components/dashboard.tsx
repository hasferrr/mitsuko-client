"use client"

import { useEffect, useState } from "react"
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
import { DashboardItemList } from "./dashboard-item-list"
import { useProjectStore } from "@/stores/use-project-store"
import { EditDialogue } from "./ui-custom/edit-dialogue"
import { DeleteDialogue } from "./ui-custom/delete-dialogue"
import { db } from "@/lib/db/db"
import { createTranslation, deleteTranslation, updateTranslation } from "@/lib/db/translation"
import { createTranscription, deleteTranscription, updateTranscription } from "@/lib/db/transcription"
import { createExtraction, deleteExtraction, updateExtraction } from "@/lib/db/extraction"

export const Dashboard = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const loadProjects = useProjectStore((state) => state.loadProjects)
  const currentProject = useProjectStore((state) => state.currentProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)

  const [translations, setTranslations] = useState<Translation[]>([])
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [extractions, setExtractions] = useState<Extraction[]>([])

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

  const translationComponentList = translations.map((translation) => (
    <DashboardItemList
      key={translation.id}
      id={translation.id}
      type="translation"
      icon={<Globe className="h-5 w-5 text-blue-500" />}
      title={translation.title}
      description={`${translation.parsed.type.toUpperCase()} • ${translation.subtitles.length} Lines`}
      date={translation.updatedAt.toLocaleDateString()}
      handleEdit={async (newName) => {
        await updateTranslation(translation.id, { title: newName })
        loadProjects()
        // TODO: handle when current item is processing (also below)
      }}
      handleDelete={async () => {
        await deleteTranslation(currentProject!.id, translation.id)
        loadProjects()
        // TODO: handle when current item is processing (also below)
      }}
    />
  ))

  const transcriptionComponentList = transcriptions.map((transcription) => (
    <DashboardItemList
      key={transcription.id}
      id={transcription.id}
      type="transcription"
      icon={<Headphones className="h-5 w-5 text-green-500" />}
      title={transcription.title}
      description={`${transcription.transcriptSubtitles.length} segments`}
      date={transcription.createdAt.toLocaleDateString()}
      handleEdit={async (newName) => {
        await updateTranscription(transcription.id, { title: newName })
        loadProjects()
      }}
      handleDelete={async () => {
        await deleteTranscription(currentProject!.id, transcription.id)
        loadProjects()
      }}
    />
  ))

  const extractionComponentList = extractions.map((extraction) => (
    <DashboardItemList
      key={extraction.id}
      id={extraction.id}
      type="extraction"
      icon={<FileText className="h-5 w-5 text-purple-500" />}
      title={`Episode ${extraction.episodeNumber || "X"}`}
      description={extraction.contextResult}
      date={extraction.updatedAt.toLocaleDateString()}
      handleEdit={async (newName) => {
        await updateExtraction(extraction.id, { episodeNumber: newName })
        loadProjects()
      }}
      handleDelete={async () => {
        await deleteExtraction(currentProject!.id, extraction.id)
        loadProjects()
      }}
    />
  ))


  if (!currentProject) {
    return <div className="p-6">No Project Selected</div>
  }

  const handleSave = async (newName: string) => {
    updateProject(currentProject.id, newName.trim())
    setIsEditModalOpen(false)
  }

  const handleDelete = () => {
    deleteProject(currentProject.id)
    setIsDeleteModalOpen(false)
  }

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
        <TabsList className="bg-card border border-border p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-secondary rounded-md">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
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
              <h3 className="text-sm font-medium mb-4">Translations</h3>
              <div className="space-y-3">
                {translationComponentList}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Transcriptions</h3>
              <div className="space-y-3">
                {transcriptionComponentList}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Extractions</h3>
              <div className="space-y-3">
                {extractionComponentList}
              </div>
            </div>

          </div>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Translations</h3>
              <Button
                size="sm"
                variant="outline"
                className="line-clamp-2"
                onClick={async () => {
                  await createTranslation(currentProject.id, {
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
            </div>
            <div className="space-y-3">
              {translationComponentList}
            </div>
          </div>
        </TabsContent>

        {/* Transcriptions Tab */}
        <TabsContent value="transcriptions" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Transcriptions</h3>
              <Button
                size="sm"
                variant="outline"
                className="line-clamp-2"
                onClick={async () => {
                  await createTranscription(currentProject.id, {
                    title: `Audio ${new Date().toLocaleDateString()}`,
                    transcriptionText: "",
                    transcriptSubtitles: []
                  })
                  loadProjects()
                }}
              >
                New Transcription
              </Button>
            </div>
            <div className="space-y-3">
              {transcriptionComponentList}
            </div>
          </div>
        </TabsContent>

        {/* Extractions Tab */}
        <TabsContent value="context-extractor" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Extractions</h3>
              <Button
                size="sm"
                variant="outline"
                className="line-clamp-2"
                onClick={async () => {
                  await createExtraction(currentProject.id, {
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
            </div>
            <div className="space-y-3">
              {extractionComponentList}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
