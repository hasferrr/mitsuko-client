"use client"

import { Plus, FileText, GripVertical, MoreHorizontal, Trash, Upload, Loader2, Archive, ArchiveRestore, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjectStore } from "@/stores/data/use-project-store"
import { ProjectMain } from "./project-main"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { exportProject } from "@/lib/db/db-io"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { useState } from "react"
import { hasActiveOperations } from "@/stores/utils/active-operations"

export const Project = () => {
  const projects = useProjectStore(state => state.projects)
  const nonBatchProjects = projects.filter(p => !p.isBatch)
  const activeProjects = nonBatchProjects.filter(p => !p.isArchived)
  const archivedProjects = nonBatchProjects.filter(p => p.isArchived)
  const currentProject = useProjectStore(state => state.currentProject)
  const loading = useProjectStore(state => state.loading)
  const hasLoaded = useProjectStore(state => state.hasLoaded)
  const createProject = useProjectStore(state => state.createProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)
  const reorderProjects = useProjectStore(state => state.reorderProjects)
  const deleteProject = useProjectStore(state => state.deleteProject)
  const updateProject = useProjectStore(state => state.updateProject)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [archivedCollapsed, setArchivedCollapsed] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleCreateProject = async () => {
    const newProject = await createProject(`Project ${new Date().toLocaleDateString()}`)
    setCurrentProject(newProject)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex(p => p.id === active.id)
      const newIndex = projects.findIndex(p => p.id === over.id)
      const newOrder = arrayMove(projects.map(p => p.id), oldIndex, newIndex)
      await reorderProjects(newOrder)
    }
  }

  const handleExportProject = async (projectId: string) => {
    try {
      const result = await exportProject(projectId)
      if (result) {
        const blob = new Blob([result.content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mitsuko-project-${result.name.replace(/\s+/g, "_")}-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Project exported successfully")
      }
    } catch (error) {
      console.error("Error exporting project:", error)
      toast.error("Failed to export project")
    }
  }

  const handleDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete)
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
    }
  }

  const checkActiveOperations = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return false
    return hasActiveOperations(project)
  }

  const handleToggleArchive = async (projectId: string, archive: boolean) => {
    if (archive && checkActiveOperations(projectId)) {
      toast.error("Cannot archive — finish or cancel active operations first")
      return
    }
    const updated = await updateProject(projectId, { isArchived: archive })
    if (updated) {
      toast.success(archive ? "Project archived" : "Project unarchived")
    } else {
      toast.error(`Failed to ${archive ? "archive" : "unarchive"} project`)
    }
  }

  const ProjectItemSkeleton = () => {
    return (
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <Skeleton className="h-5 w-36" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="flex-1" />
          <div className="flex flex-col gap-1 mt-auto">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const SortableProjectCard = ({ project }: { project: typeof projects[number] }) => {
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

    const totalItems = project.translations.length + project.transcriptions.length + project.extractions.length

    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "cursor-pointer hover:ring-primary transition-colors overflow-hidden h-full flex flex-col",
          isDragging && "opacity-50"
        )}
        onClick={() => setCurrentProject(project.id)}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{project.name}</CardTitle>
          <div className="flex items-center gap-4">
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
                    handleExportProject(project.id)
                  }}
                >
                  <Upload className="size-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleArchive(project.id, true)
                  }}
                >
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setProjectToDelete(project.id)
                    setIsDeleteModalOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <GripVertical
              className="size-4 cursor-grab text-muted-foreground focus:outline-hidden"
              {...attributes}
              {...listeners}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="flex-1" />
          <div className="flex flex-col gap-1 mt-auto">
            <p className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
            <p className="text-xs text-muted-foreground">
              Updated: {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ArchivedProjectCard = ({ project }: { project: typeof projects[number] }) => {
    const totalItems = project.translations.length + project.transcriptions.length + project.extractions.length

    return (
      <Card
        className="cursor-pointer hover:ring-primary transition-colors overflow-hidden h-full flex flex-col opacity-60"
        onClick={() => setCurrentProject(project.id)}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{project.name}</CardTitle>
          <div className="flex items-center gap-4">
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
                    handleExportProject(project.id)
                  }}
                >
                  <Upload className="size-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleArchive(project.id, false)
                  }}
                >
                  <ArchiveRestore className="size-4" />
                  Unarchive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setProjectToDelete(project.id)
                    setIsDeleteModalOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="flex-1" />
          <div className="flex flex-col gap-1 mt-auto">
            <p className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
            <p className="text-xs text-muted-foreground">
              Updated: {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentProject) {
    const skeletonCount = activeProjects.length > 0 ? activeProjects.length : 3
    const showSkeletons = !hasLoaded
    const isCreateDisabled = !hasLoaded || loading
    return (
      <div className="flex flex-col gap-4 mx-auto container p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Select a Project</h2>
          <div className="flex gap-2">
            <Button onClick={handleCreateProject} disabled={isCreateDisabled}>
              {isCreateDisabled ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Create New Project
            </Button>
          </div>
        </div>

        {showSkeletons ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <ProjectItemSkeleton key={`project-skeleton-${index}`} />
            ))}
          </div>
        ) : activeProjects.length === 0 && archivedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2 text-center">Translation & Transcription</h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create a new project to manage your subtitle translations.
              <br />
              Organize, edit, and track all your work in one place.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeProjects.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div translate="no" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map(p => (
                  <SortableProjectCard key={p.id} project={p} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {archivedProjects.length > 0 && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setArchivedCollapsed(v => !v)}
              className="flex items-center gap-2 w-full text-left"
            >
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", archivedCollapsed && "-rotate-90")} />
              <Archive className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Archived</h3>
              <span className="text-xs text-muted-foreground">({archivedProjects.length})</span>
            </button>
            {!archivedCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedProjects.map(p => (
                  <ArchivedProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        )}

        <DeleteDialogue
          handleDelete={handleDelete}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
        />
      </div>
    )
  }

  return <ProjectMain currentProject={currentProject} />
}
