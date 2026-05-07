"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArchiveRestore, MoreHorizontal, Trash, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"

interface ArchivedBatchCardProps {
  project: Project
  onSelect: (id: string) => void
  onToggleArchive: (id: string, archive: boolean) => void
  onExport: (id: string) => void
  onDelete: (id: string) => void
  selectMode?: boolean
  selected?: boolean
  onSelectToggle?: (id: string) => void
}

export function ArchivedBatchCard({ project, onSelect, onToggleArchive, onExport, onDelete, selectMode = false, selected = false, onSelectToggle }: ArchivedBatchCardProps) {
  const handleClick = () => {
    if (selectMode) {
      onSelectToggle?.(project.id)
    } else {
      onSelect(project.id)
    }
  }

  return (
    <Card
      className={cn(
        "cursor-pointer hover:ring-primary transition-colors overflow-hidden h-full flex flex-col opacity-60",
        selectMode && "select-none",
        selectMode && selected && "ring-primary bg-primary/5 dark:bg-primary/10 opacity-100"
      )}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {selectMode && (
            <Checkbox
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => onSelectToggle?.(project.id)}
              className="shrink-0"
            />
          )}
          <CardTitle className="truncate">{project.name}</CardTitle>
        </div>
        {!selectMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div className="rounded-md hover:bg-muted cursor-pointer">
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onExport(project.id)
                }}
              >
                <Upload className="size-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleArchive(project.id, false)
                }}
              >
                <ArchiveRestore className="size-4" />
                Unarchive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(project.id)
                }}
                className="text-destructive"
              >
                <Trash className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex-1"></div>
        <div className="flex flex-col gap-1 mt-auto">
          <p className="text-sm text-muted-foreground">
            {project.translations.length > 0 && `${project.translations.length} translation${project.translations.length === 1 ? "" : "s"}`}
            {project.extractions.length > 0 && `${project.translations.length > 0 ? ", " : ""}${project.extractions.length} extraction${project.extractions.length === 1 ? "" : "s"}`}
            {project.transcriptions.length > 0 && `${project.translations.length > 0 || project.extractions.length > 0 ? ", " : ""}${project.transcriptions.length} transcription${project.transcriptions.length === 1 ? "" : "s"}`}
            {project.translations.length === 0 && project.extractions.length === 0 && project.transcriptions.length === 0 && "No files"}
          </p>
          <p className="text-xs text-muted-foreground">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
