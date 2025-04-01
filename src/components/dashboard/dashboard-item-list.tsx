"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Edit, Trash, SquareArrowOutUpRight } from "lucide-react"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { EditDialogue } from "../ui-custom/edit-dialogue"
import { MoveDialogue } from "../ui-custom/move-dialogue"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { db } from "@/lib/db/db"

interface DashboardItemListProps {
  id: string
  projectId: string
  type: "translation" | "transcription" | "extraction"
  icon: React.ReactNode
  title: string
  description: string
  date: string
  handleEdit: (newName: string) => Promise<void>
  handleDelete: () => Promise<void>
}

export const DashboardItemList = ({
  id,
  projectId,
  type,
  icon,
  title,
  description,
  date,
  handleEdit,
  handleDelete,
}: DashboardItemListProps) => {
  const router = useRouter()
  const projects = useProjectStore((state) => state.projects)
  const loadProjects = useProjectStore((state) => state.loadProjects)

  const translationData = useTranslationDataStore((state) => state.data)
  const setCurrentTranslationId = useTranslationDataStore((state) => state.setCurrentId)
  const upsertTranslationData = useTranslationDataStore((state) => state.upsertData)

  const transcriptionData = useTranscriptionDataStore((state) => state.data)
  const setCurrentTranscriptionId = useTranscriptionDataStore((state) => state.setCurrentId)
  const upsertTranscriptionData = useTranscriptionDataStore((state) => state.upsertData)

  const extractionData = useExtractionDataStore((state) => state.data)
  const setCurrentExtractionId = useExtractionDataStore((state) => state.setCurrentId)
  const upsertExtractionData = useExtractionDataStore((state) => state.upsertData)

  const getTranslationDb = useTranslationDataStore((state) => state.getTranslationDb)
  const getExtractionDb = useExtractionDataStore((state) => state.getExtractionDb)
  const getTranscriptionDb = useTranscriptionDataStore((state) => state.getTranscriptionDb)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTitleClick = async () => {
    switch (type) {
      case "translation":
        if (!(id in translationData)) {
          const translation = await getTranslationDb(projectId, id)
          if (translation) {
            upsertTranslationData(id, translation)
          }
        }
        setCurrentTranslationId(id)
        router.push("/translate")
        break
      case "transcription":
        if (!(id in transcriptionData)) {
          const transcription = await getTranscriptionDb(projectId, id)
          if (transcription) {
            upsertTranscriptionData(id, transcription)
          }
        }
        setCurrentTranscriptionId(id)
        router.push("/transcribe")
        break
      case "extraction":
        if (!(id in extractionData)) {
          const extraction = await getExtractionDb(projectId, id)
          if (extraction) {
            upsertExtractionData(id, extraction)
          }
        }
        setCurrentExtractionId(id)
        router.push("/extract-context")
        break
    }
  }

  const handleConfirmDelete = async () => {
    setIsProcessing(true)
    await handleDelete()
    setIsDeleteOpen(false)
    setIsProcessing(false)
  }

  const handleMove = async (targetProjectId: string) => {
    setIsProcessing(true)
    await db.transaction('rw', [db.projects, db.translations, db.transcriptions, db.extractions], async () => {
      // Remove from current project
      await db.projects.update(projectId, project => {
        if (!project) return
        project[`${type}s`] = project[`${type}s`].filter(itemId => itemId !== id)
        project.updatedAt = new Date()
      })

      // Add to target project
      await db.projects.update(targetProjectId, project => {
        if (!project) return
        project[`${type}s`].push(id)
        project.updatedAt = new Date()
      })

      // Update item's projectId
      switch (type) {
        case "translation":
          await db.translations.update(id, { projectId: targetProjectId, updatedAt: new Date() })
          break
        case "transcription":
          await db.transcriptions.update(id, { projectId: targetProjectId, updatedAt: new Date() })
          break
        case "extraction":
          await db.extractions.update(id, { projectId: targetProjectId, updatedAt: new Date() })
          break
      }
    })

    // Update data in the store based on item type
    if (type === "translation") {
      if (translationData[id]) {
        const updatedData = { ...translationData[id], projectId: targetProjectId }
        upsertTranslationData(id, updatedData)
      }
    } else if (type === "transcription") {
      if (transcriptionData[id]) {
        const updatedData = { ...transcriptionData[id], projectId: targetProjectId }
        upsertTranscriptionData(id, updatedData)
      }
    } else if (type === "extraction") {
      if (extractionData[id]) {
        const updatedData = { ...extractionData[id], projectId: targetProjectId }
        upsertExtractionData(id, updatedData)
      }
    }

    await loadProjects()
    setIsMoveOpen(false)
    setIsProcessing(false)
  }

  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-2 rounded-lg">{icon}</div>
          <div>
            <h4
              className="text-sm font-medium line-clamp-2 hover:underline cursor-pointer"
              onClick={handleTitleClick}
            >
              {title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{date}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 min-w-6 p-0"
            onClick={() => setIsMoveOpen(true)}
            disabled={isProcessing}
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 min-w-6 p-0"
            onClick={() => setIsEditOpen(true)}
            disabled={isProcessing}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 min-w-6 p-0"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isProcessing}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditDialogue
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialValue={type === "extraction" && title.startsWith("Episode ") ? title.substring(8) : title}
        onSave={async (newValue) => {
          setIsProcessing(true)
          try {
            await handleEdit(newValue)
          } finally {
            setIsProcessing(false)
          }
        }}
        isProcessing={isProcessing}
      />

      <DeleteDialogue
        handleDelete={handleConfirmDelete}
        isDeleteModalOpen={isDeleteOpen}
        setIsDeleteModalOpen={setIsDeleteOpen}
        isProcessing={isProcessing}
      />

      <MoveDialogue
        isOpen={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        projects={projects}
        currentProjectId={projectId}
        onMove={handleMove}
        isProcessing={isProcessing}
      />
    </div>
  )
}
