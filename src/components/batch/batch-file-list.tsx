"use client"

import { useId } from "react"
import { Upload } from "lucide-react"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableBatchFile } from "./sortable-batch-file"
import { BatchFile } from "@/types/batch"
import { SUBTITLE_NAME_MAP } from "@/constants/subtitle-formats"
import { DownloadOption } from "@/types/subtitles"

interface BatchFileListProps {
  files: BatchFile[]
  order: string[]
  isProcessing: boolean
  selectMode: boolean
  selectedIds: Set<string>
  downloadOption: DownloadOption
  onDrop: (files: FileList | File[]) => void
  onDragEnd: (event: DragEndEvent) => void
  onDelete: (id: string) => void
  onDownload: (id: string) => void
  onClick: (id: string) => void
  onSelectToggle: (id: string) => void
}

export function BatchFileList({
  files,
  order,
  isProcessing,
  selectMode,
  selectedIds,
  downloadOption,
  onDrop,
  onDragEnd,
  onDelete,
  onDownload,
  onClick,
  onSelectToggle,
}: BatchFileListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const id = useId()
  const inputId = `batch-file-upload-${id}`

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
        hidden
        onChange={handleFileInputChange}
        multiple
      />
      <div className="space-y-2 h-[510px] pr-2 overflow-x-hidden overflow-y-auto">
        {files.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              {files.map(batchFile => (
                <SortableBatchFile
                  key={batchFile.id}
                  batchFile={batchFile}
                  onDelete={onDelete}
                  onDownload={onDownload}
                  onClick={onClick}
                  selectMode={selectMode}
                  selected={selectedIds.has(batchFile.id)}
                  onSelectToggle={onSelectToggle}
                  downloadOption={downloadOption}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Drag and drop file here, or click to select a file.
              <br />
              {Array.from(SUBTITLE_NAME_MAP.keys()).join(", ").toUpperCase()} subtitles file.
            </p>
          </div>
        )}
      </div>
    </DragAndDrop>
  )
}
