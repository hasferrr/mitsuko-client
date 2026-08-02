"use client"

import { FileAudio, Loader2 } from "lucide-react"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableBatchTranscriptionFile } from "./sortable-batch-transcription-file"
import { BatchFile } from "@/types/batch"
import { TRANSCRIPTION_FILE_ACCEPT } from "@/constants/transcription"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { MediaPreparationProgress } from "@/lib/transcription/prepare-transcription-media"

interface BatchTranscriptionFileListProps {
  files: BatchFile[]
  order: string[]
  isProcessing: boolean
  preparation: {
    fileName: string
    itemIndex: number
    itemCount: number
    progress: MediaPreparationProgress
  } | null
  selectMode: boolean
  selectedIds: Set<string>
  onDrop: (files: FileList | File[]) => void
  onDragEnd: (event: DragEndEvent) => void
  onDelete: (id: string) => void
  onDownload: (id: string) => void
  onClick: (id: string) => void
  onSelectToggle: (id: string) => void
  uploadInputId?: string
  onCancelPreparation: () => void
}

export function BatchTranscriptionFileList({
  files,
  order,
  isProcessing,
  preparation,
  selectMode,
  selectedIds,
  onDrop,
  onDragEnd,
  onDelete,
  onDownload,
  onClick,
  onSelectToggle,
  uploadInputId,
  onCancelPreparation,
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
    <DragAndDrop onDropFiles={onDrop} disabled={isProcessing || Boolean(preparation)}>
      <input
        id={inputId}
        type="file"
        accept={TRANSCRIPTION_FILE_ACCEPT}
        disabled={isProcessing || Boolean(preparation)}
        hidden
        onChange={handleFileInputChange}
        multiple
      />
      <div className="flex h-[510px] flex-col gap-2 overflow-x-hidden overflow-y-auto pr-2">
        {preparation && (
          <div className="flex shrink-0 flex-col gap-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 shrink-0 animate-spin text-sidebar-primary" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-4 wrap-break-word break-all text-sm">{preparation.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {preparation.progress.stage === "inspecting" ? "Inspecting" : "Extracting audio"}
                  {` • ${preparation.itemIndex} of ${preparation.itemCount}`}
                  {preparation.progress.stage === "extracting" && preparation.progress.percentage !== null
                    ? ` • ${preparation.progress.percentage.toFixed(0)}%`
                    : ""}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onCancelPreparation}>Cancel</Button>
            </div>
            {preparation.progress.stage === "extracting" && preparation.progress.percentage !== null && (
              <Progress value={preparation.progress.percentage} />
            )}
          </div>
        )}
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
                  disabled={isProcessing || Boolean(preparation)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
            onClick={() => {
              if (!isProcessing && !preparation) document.getElementById(inputId)?.click()
            }}
          >
            <FileAudio className="size-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Drag and drop audio or video files here, or click to select files.
              <br />
              Video audio is extracted without re-encoding.
            </p>
          </div>
        )}
      </div>
    </DragAndDrop>
  )
}
