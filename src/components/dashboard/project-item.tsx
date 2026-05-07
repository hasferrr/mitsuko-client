"use client"

import { useRouter } from "next/navigation"
import {
  Archive,
  ArchiveRestore,
  FileText,
  Headphones,
  Clock,
  Trash,
  Upload,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Project } from "@/types/project"
import { useProjectStore } from "@/stores/data/use-project-store"

export interface ProjectItemProps {
  project: Project
  isHorizontal: boolean
  onExport: (projectId: string) => void
  onArchive: (projectId: string) => void
  onDelete: (projectId: string) => void
}

export const ProjectItem = ({ project, isHorizontal, onExport, onArchive, onDelete }: ProjectItemProps) => {
  const router = useRouter()
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  const handleProjectClick = () => {
    setCurrentProject(project)
    router.push("/project")
  }

  return (
    <Card
      className={cn(
        "hover:ring-primary/50 hover:bg-card/80 transition-colors",
      )}
    >
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex-1 cursor-pointer"
            onClick={handleProjectClick}
          >
            {isHorizontal ? (
              <div className="flex items-center gap-2">
                <div className="size-4">
                  {project.transcriptions.length > project.translations.length &&
                    project.transcriptions.length > project.extractions.length ? (
                    <Headphones className="size-4 text-green-500" />
                  ) : (
                    <FileText className="size-4 text-blue-500" />
                  )}
                </div>
                <span className="text-sm font-medium line-clamp-1">{project.name}</span>
                <span className="text-xs text-muted-foreground mx-2">•</span>
                <span className="text-xs text-muted-foreground">
                  {project.transcriptions.length > project.translations.length &&
                    project.transcriptions.length > project.extractions.length ? "AAC/WAV" : "SRT/ASS"}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {project.updatedAt.toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-4">
                    {project.transcriptions.length > project.translations.length &&
                      project.transcriptions.length > project.extractions.length ? (
                      <Headphones className="size-4 text-green-500" />
                    ) : (
                      <FileText className="size-4 text-blue-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium line-clamp-1">{project.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {project.transcriptions.length > project.translations.length &&
                      project.transcriptions.length > project.extractions.length ? "AAC/WAV" : "SRT/ASS"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{project.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent"
                >
                  <MoreHorizontal className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport(project.id)}>
                  <Upload className="size-4" />
                  Export
                </DropdownMenuItem>
                {project.isArchived ? (
                  <DropdownMenuItem onClick={() => onArchive(project.id)}>
                    <ArchiveRestore className="size-4" />
                    Unarchive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onArchive(project.id)}>
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-destructive"
                >
                  <Trash className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
