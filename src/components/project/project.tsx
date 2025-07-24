"use client"

import { Plus, FileText, GripVertical, MoreHorizontal, Trash, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export const Project = () => {
  const projects = useProjectStore(state => state.projects)
  const currentProject = useProjectStore(state => state.currentProject)
  const createProject = useProjectStore(state => state.createProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)
  const reorderProjects = useProjectStore(state => state.reorderProjects)
  const deleteProject = useProjectStore(state => state.deleteProject)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

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
          "cursor-pointer hover:border-primary transition-colors overflow-hidden border border-muted h-full flex flex-col",
          isDragging && "opacity-50"
        )}
        onClick={() => setCurrentProject(project.id)}
      >
        <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
          <CardTitle>{project.name}</CardTitle>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div className="rounded-md hover:bg-muted cursor-pointer">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportProject(project.id)
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setProjectToDelete(project.id)
                    setIsDeleteModalOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <GripVertical
              className="h-4 w-4 cursor-grab text-muted-foreground focus:outline-none"
              {...attributes}
              {...listeners}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </CardHeader>
        <CardContent className="pb-4 flex flex-col flex-1">
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
    return (
      <div className="flex flex-col gap-4 mx-auto container p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Select a Project</h2>
          <div className="flex gap-2">
            <Button onClick={handleCreateProject}>
              <Plus size={18} />
              Create New Project
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2 text-center">No Projects Found</h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create a new project to start working.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={projects.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(p => (
                  <SortableProjectCard key={p.id} project={p} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
