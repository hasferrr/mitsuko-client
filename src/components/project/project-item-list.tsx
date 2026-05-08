"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Edit, Trash, SquareArrowOutUpRight, GripVertical } from "lucide-react"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { EditDialogue } from "../ui-custom/edit-dialogue"
import { MoveDialogue } from "../ui-custom/move-dialogue"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface ProjectItemListProps {
  id: string
  projectId: string
  type: "translation" | "transcription" | "extraction"
  icon: React.ReactNode
  title: string
  subtitle?: string
  description: string
  date: string
  handleEdit: (newName: string) => Promise<void>
  handleDelete: () => Promise<void>
  selectMode?: boolean
  selected?: boolean
  onSelectToggle?: () => void
}

export const ProjectItemList = ({
  id,
  projectId,
  type,
  icon,
  title,
  subtitle,
  description,
  date,
  handleEdit,
  handleDelete,
  selectMode = false,
  selected = false,
  onSelectToggle,
}: ProjectItemListProps) => {
  const router = useRouter()
  const projects = useProjectStore((state) => state.projects)
  const loadProjects = useProjectStore((state) => state.loadProjects)

  const translationData = useTranslationDataStore((state) => state.data)
  const setCurrentTranslationId = useTranslationDataStore((state) => state.setCurrentId)
  const moveTranslationDb = useTranslationDataStore((state) => state.moveTranslationDb)

  const transcriptionData = useTranscriptionDataStore((state) => state.data)
  const setCurrentTranscriptionId = useTranscriptionDataStore((state) => state.setCurrentId)
  const moveTranscriptionDb = useTranscriptionDataStore((state) => state.moveTranscriptionDb)

  const extractionData = useExtractionDataStore((state) => state.data)
  const setCurrentExtractionId = useExtractionDataStore((state) => state.setCurrentId)
  const moveExtractionDb = useExtractionDataStore((state) => state.moveExtractionDb)

  const getTranslationDb = useTranslationDataStore((state) => state.getTranslationDb)
  const getExtractionDb = useExtractionDataStore((state) => state.getExtractionDb)
  const getTranscriptionDb = useTranscriptionDataStore((state) => state.getTranscriptionDb)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id, disabled: selectMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTitleClick = async () => {
    if (selectMode) return
    switch (type) {
      case "translation":
        if (!(id in translationData)) {
          await getTranslationDb(id)
        }
        setCurrentTranslationId(id)
        router.push("/translate")
        break
      case "transcription":
        if (!(id in transcriptionData)) {
          await getTranscriptionDb(id)
        }
        setCurrentTranscriptionId(id)
        router.push("/transcribe")
        break
      case "extraction":
        if (!(id in extractionData)) {
          await getExtractionDb(id)
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
    if (type === "translation") {
      await moveTranslationDb(projectId, targetProjectId, id)
    } else if (type === "transcription") {
      await moveTranscriptionDb(projectId, targetProjectId, id)
    } else {
      await moveExtractionDb(projectId, targetProjectId, id)
    }
    await loadProjects()
    setIsMoveOpen(false)
    setIsProcessing(false)
  }

  return (
    <Card
      size="sm"
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 touch-none",
        selectMode && "select-none",
        selected && "ring-primary bg-primary/5 dark:bg-primary/10"
      )}
      onClick={selectMode ? (e) => { e.stopPropagation(); onSelectToggle?.() } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {selectMode ? (
            <Checkbox
              checked={selected}
              onCheckedChange={onSelectToggle}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <button {...attributes} {...listeners} className="cursor-grab">
              <GripVertical className="size-5 text-muted-foreground" />
            </button>
          )}
          <div className="bg-secondary p-2 rounded-lg">{icon}</div>
          <div
            className="cursor-pointer hover:bg-muted/50 rounded-lg py-1 -my-1 px-2 -mx-1 group/title"
            onClick={handleTitleClick}
          >
            <div className="flex items-center gap-2">
              <h4 className={cn("text-sm font-medium wrap-break-word break-all line-clamp-1 min-w-fit group-hover/title:underline cursor-pointer", (!title || title === "Episode X") && "italic pr-1")}>
                {title || "No title"}
              </h4>
              {subtitle && (
                <span className="text-xs text-muted-foreground font-extralight wrap-break-word break-all line-clamp-1">
                  {subtitle}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 wrap-break-word" style={{ overflowWrap: "anywhere" }}>
              {description.substring(0, 250)}
            </p>
            <p className="text-xs text-muted-foreground sm:hidden block">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground sm:block hidden">{date}</p>
          {!selectMode && (
          <>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsMoveOpen(true)}
            disabled={isProcessing}
          >
            <SquareArrowOutUpRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsEditOpen(true)}
            disabled={isProcessing}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isProcessing}
          >
            <Trash className="size-4" />
          </Button>
          </>
          )}
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
    </Card>
  )
}
