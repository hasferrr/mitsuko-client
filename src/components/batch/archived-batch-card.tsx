"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArchiveRestore, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/types/project"

interface ArchivedBatchCardProps {
  project: Project
  onSelect: (id: string) => void
  onToggleArchive: (id: string, archive: boolean) => void
}

export function ArchivedBatchCard({ project, onSelect, onToggleArchive }: ArchivedBatchCardProps) {
  return (
    <Card
      className="cursor-pointer hover:ring-primary transition-colors overflow-hidden h-full flex flex-col opacity-60"
      onClick={() => onSelect(project.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{project.name}</CardTitle>
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
                onToggleArchive(project.id, false)
              }}
            >
              <ArchiveRestore className="size-4" />
              Unarchive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
