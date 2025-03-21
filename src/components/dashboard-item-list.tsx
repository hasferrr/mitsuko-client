"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Edit, Trash } from "lucide-react"
import { DeleteDialogue } from "./ui-custom/delete-dialogue"
import { EditDialogue } from "./ui-custom/edit-dialogue"
import { getExtraction } from "@/lib/db/extraction"
import { getTranslation } from "@/lib/db/translation"
import { getTranscription } from "@/lib/db/transcription"
import { useTranslationDataStore } from "@/stores/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/use-extraction-data-store"

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

  const {
    setCurrentId: setCurrentTranslationId,
    data: translationData,
    upsertData: upsertTranslationData,
  } = useTranslationDataStore()
  const {
    setCurrentId: setCurrentTranscriptionId,
    data: transcriptionData,
    upsertData: upsertTranscriptionData,
  } = useTranscriptionDataStore()
  const {
    setCurrentId: setCurrentExtractionId,
    data: extractionData,
    upsertData: upsertExtractionData,
  } = useExtractionDataStore()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTitleClick = async () => {
    switch (type) {
      case "translation":
        if (!(id in translationData)) {
          const translation = await getTranslation(projectId, id)
          if (translation) {
            upsertTranslationData(id, translation)
          }
        }
        setCurrentTranslationId(id)
        router.push("/translate")
        break
      case "transcription":
        if (!(id in transcriptionData)) {
          const transcription = await getTranscription(projectId, id)
          if (transcription) {
            upsertTranscriptionData(id, transcription)
          }
        }
        setCurrentTranscriptionId(id)
        router.push("/transcribe")
        break
      case "extraction":
        if (!(id in extractionData)) {
          const extraction = await getExtraction(projectId, id)
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
    try {
      await handleDelete()
      setIsDeleteOpen(false)
    } finally {
      setIsProcessing(false)
    }
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
        initialValue={title}
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
    </div>
  )
}
