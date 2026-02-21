"use client"

import { Upload, FileAudio } from "lucide-react"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableBatchTranscriptionFile } from "./sortable-batch-transcription-file"
import { BatchFile } from "@/types/batch"

// Accepted audio formats
const ACCEPTED_AUDIO_FORMATS = [
  ".mp3",
  ".wav",
  ".flac",
  ".m4a",
  ".ogg",
  ".webm",
  ".aac",
]

interface BatchTranscriptionFileListProps {
  files: BatchFile[]
  order: string[]
  isProcessing: boolean
  selectMode: boolean
  selectedIds: Set<string>
  onDrop: (files: FileList | File[]) => void
  onDragEnd: (event: DragEndEvent) => void
  onDelete: (id: string) => void
  onDownload: (id: string) => void
  onClick: (id: string) => void
  onSelectToggle: (id: string) => void
  uploadInputId?: string
}

export function BatchTranscriptionFileList({
  files,
  order,
  isProcessing,
  selectMode,
  selectedIds,
  onDrop,
  onDragEnd,
  onDelete,
  onDownload,
  onClick,
  onSelectToggle,
  uploadInputId,
}: BatchTranscriptionFileListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const inputId = uploadInputId || "batch-transcription-file-upload-input"

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files)
      event.target.value = ""
      onDrop(filesArray)
    }
  }

  return (
    <DragAndDrop onDropFiles={onDrop} disabled={isProcessing}>
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_AUDIO_FORMATS.join(",")}
        hidden
        onChange={handleFileInputChange}
        multiple
      />
      <div className="space-y-2 h-[510px] pr-2 overflow-x-hidden overflow-y-auto">
        {files.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              {files.map(batchFile => (
                <SortableBatchTranscriptionFile
                  key={batchFile.id}
                  batchFile={batchFile}
                  onDelete={onDelete}
                  onDownload={onDownload}
                  onClick={onClick}
                  selectMode={selectMode}
                  selected={selectedIds.has(batchFile.id)}
                  onSelectToggle={onSelectToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <FileAudio className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Drag and drop audio files here, or click to select files.
              <br />
              {ACCEPTED_AUDIO_FORMATS.join(", ").toUpperCase()}
            </p>
          </div>
        )}
      </div>
    </DragAndDrop>
  )
}
