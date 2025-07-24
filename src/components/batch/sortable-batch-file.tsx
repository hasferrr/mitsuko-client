"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  X,
  GripVertical,
} from "lucide-react"
import { DownloadOption, CombinedFormat } from "@/types/subtitles"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

interface BatchFile {
  id: string
  status: "pending" | "partial" | "translating" | "queued" | "done" | "error"
  progress: number
  title: string
  subtitlesCount: number
  translatedCount: number
  type: string
}

interface SortableBatchFileProps {
  batchFile: BatchFile
  onDelete: (id: string) => void
  onDownload: (id: string, option: DownloadOption, format: CombinedFormat) => void
  onClick: (id: string) => void
  selectMode?: boolean
  selected?: boolean
  onSelectToggle?: (id: string) => void
}

export function SortableBatchFile({
  batchFile,
  onDelete,
  onDownload,
  onClick,
  selectMode = false,
  selected = false,
  onSelectToggle,
}: SortableBatchFileProps) {
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
        <div>
          <p
            className={cn("text-sm", !selectMode && "hover:underline cursor-pointer")}
            onClick={handleTitleClick}
          >
            {batchFile.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {batchFile.translatedCount === batchFile.subtitlesCount
              ? `${batchFile.subtitlesCount} lines`
              : `${batchFile.translatedCount}/${batchFile.subtitlesCount} lines`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {batchFile.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
          {batchFile.status === 'partial' && <Badge variant="outline">Partial</Badge>}
          {batchFile.status === 'translating' && <Badge variant="outline">Translating ({batchFile.progress.toFixed(0)}%)</Badge>}
          {batchFile.status === 'queued' && <Badge variant="secondary" className="bg-transparent">Queued</Badge>}
          {batchFile.status === 'done' && (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDownload(batchFile.id, 'translated', 'o-n-t') }}>
                <Download className="h-4 w-4" />
              </Button>
              <Badge variant="default">Done</Badge>
            </>
          )}
          {batchFile.status === 'error' && <Badge variant="destructive">Error</Badge>}
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