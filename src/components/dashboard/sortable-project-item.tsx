"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Headphones,
  Clock,
  GripVertical,
  Trash2,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { Project } from "@/types/project"
import { useProjectStore } from "@/stores/data/use-project-store"

export interface SortableProjectItemProps {
  project: Project
  isHorizontal: boolean
  onDelete: (projectId: string) => Promise<void>
}

export const SortableProjectItem = ({ project, isHorizontal, onDelete }: SortableProjectItemProps) => {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  const handleDelete = async () => {
    await onDelete(project.id)
    setIsDeleteDialogOpen(false)
  }

  const handleProjectClick = () => {
    setCurrentProject(project)
    router.push("/project")
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-card/80 transition-colors",
          isDragging && "opacity-50"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex-1 cursor-pointer"
            onClick={handleProjectClick}
          >
            {isHorizontal ? (
              <div className="flex items-center gap-2">
                {project.transcriptions.length > project.translations.length &&
                  project.transcriptions.length > project.extractions.length ? (
                  <Headphones className="h-4 w-4 text-green-500" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium truncate">{project.name}</span>
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
                  {project.transcriptions.length > project.translations.length &&
                    project.transcriptions.length > project.extractions.length ? (
                    <Headphones className="h-4 w-4 text-green-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {project.transcriptions.length > project.translations.length &&
                      project.transcriptions.length > project.extractions.length ? "AAC/WAV" : "SRT/ASS"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
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
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded-md"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
