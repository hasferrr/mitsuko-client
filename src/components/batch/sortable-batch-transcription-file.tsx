"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  X,
  GripVertical,
  FileAudio,
  AlertTriangle,
} from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { BatchFile } from "@/types/batch"

interface SortableBatchTranscriptionFileProps {
  batchFile: BatchFile
  onDelete: (id: string) => void
  onDownload: (id: string) => void
  onClick: (id: string) => void
  selectMode?: boolean
  selected?: boolean
  onSelectToggle?: (id: string) => void
}

export function SortableBatchTranscriptionFile({
  batchFile,
  onDelete,
  onDownload,
  onClick,
  selectMode = false,
  selected = false,
  onSelectToggle,
}: SortableBatchTranscriptionFileProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: batchFile.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const handleTitleClick = () => {
    if (!selectMode) {
      onClick(batchFile.id)
    }
  }

  const handleCardClick = () => {
    if (selectMode) {
      onSelectToggle?.(batchFile.id)
    }
  }

  return (
    <Card
      ref={setNodeRef as unknown as React.RefObject<HTMLDivElement>}
      style={style}
      className={cn(
        "flex",
        selectMode && "select-none",
        selected && "bg-primary/5 dark:bg-primary/10"
      )}
      onClick={handleCardClick}
    >
      {selectMode ? (
        <div className="flex items-center ml-4">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation()
              onSelectToggle?.(batchFile.id)
            }}
          />
        </div>
      ) : (
        <div className="flex items-center ml-4 cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <CardContent className="p-4 flex-1 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileAudio className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p
              className={cn("text-sm break-words break-all pr-2 line-clamp-4 flex-1", !selectMode && "hover:underline cursor-pointer")}
              onClick={handleTitleClick}
              tabIndex={!selectMode ? 0 : undefined}
              role={!selectMode ? "button" : undefined}
            >
              {batchFile.title ? (
                batchFile.title
              ) : (
                <span className="italic">No title</span>
              )}
            </p>
          </div>
          <p
            className={cn(
              "text-sm break-words break-all pr-2 line-clamp-4 font-light ml-6",
              batchFile.descriptionColor === "green" && "text-green-600",
              batchFile.descriptionColor === "blue" && "text-blue-600",
              batchFile.descriptionColor === "red" && "text-red-600",
              batchFile.descriptionColor === "yellow" && "text-yellow-600",
              !batchFile.descriptionColor && "text-muted-foreground"
            )}
          >
            {batchFile.description}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {batchFile.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
          {batchFile.status === 'partial' && <Badge variant="outline">Partial</Badge>}
          {batchFile.status === 'uploading' && (
            <Badge variant="outline">
              {batchFile.progress > 0 ? `Uploading ${batchFile.progress.toFixed(0)}%` : "Uploading"}
            </Badge>
          )}
          {batchFile.status === 'processing' && <Badge variant="outline">Processing</Badge>}
          {batchFile.status === 'queued' && <Badge variant="secondary" className="bg-transparent">Queued</Badge>}
          {batchFile.status === 'done' && (
            <>
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDownload(batchFile.id) }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download Transcription</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge variant="default">Done</Badge>
            </>
          )}
          {batchFile.status === 'error' && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              Error
            </Badge>
          )}
          {!selectMode && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(batchFile.id) }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
