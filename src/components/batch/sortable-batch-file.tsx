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

interface BatchFile {
  id: string
  status: "pending" | "translating" | "done" | "error"
  progress: number
  title: string
  subtitlesCount: number
  type: string
}

interface SortableBatchFileProps {
  batchFile: BatchFile
  onDelete: (id: string) => void
  onDownload: (id: string, option: DownloadOption, format: CombinedFormat) => void
  onClick: (id: string) => void
}

export function SortableBatchFile({
  batchFile,
  onDelete,
  onDownload,
  onClick,
}: SortableBatchFileProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: batchFile.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <Card ref={setNodeRef as unknown as React.RefObject<HTMLDivElement>} style={style} className="flex cursor-pointer" onClick={() => onClick(batchFile.id)}>
      <div className="flex items-center ml-4 cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <CardContent className="p-4 flex-1 flex items-center justify-between">
        <div>
          <p className="font-semibold">{batchFile.title}</p>
          <p className="text-sm text-muted-foreground">{batchFile.subtitlesCount} lines</p>
        </div>
        <div className="flex items-center gap-2">
          {batchFile.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
          {batchFile.status === 'translating' && <Badge variant="outline">Translating ({batchFile.progress.toFixed(0)}%)</Badge>}
          {batchFile.status === 'done' && (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDownload(batchFile.id, 'translated', 'o-n-t') }}>
                <Download className="h-4 w-4" />
              </Button>
              <Badge variant="default">Done</Badge>
            </>
          )}
          {batchFile.status === 'error' && <Badge variant="destructive">Error</Badge>}
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(batchFile.id) }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}