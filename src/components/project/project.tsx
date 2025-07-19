"use client"

import { Plus, FileText, Move, Check } from "lucide-react"
import { useState } from "react"
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

export const Project = () => {
  const projects = useProjectStore(state => state.projects)
  const currentProject = useProjectStore(state => state.currentProject)
  const createProject = useProjectStore(state => state.createProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)
  const reorderProjects = useProjectStore(state => state.reorderProjects)

  const [isReordering, setIsReordering] = useState(false)

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
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-pointer hover:border-primary transition-colors overflow-hidden border border-muted h-full flex flex-col",
          isDragging && "opacity-50"
        )}
        onClick={() => setCurrentProject(project.id)}
      >
        <CardHeader className="pb-2">
          <CardTitle>{project.name}</CardTitle>
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
            {isReordering && (
              <Button
                variant="default"
                onClick={() => {
                  setIsReordering(false)
                }}
              >
                <Check className="h-4 w-4" />
                Done
              </Button>
            )}

            <Button
              variant={isReordering ? "outline" : "outline"}
              disabled={isReordering}
              onClick={() => {
                setIsReordering(true)
              }}
            >
              <Move className="h-4 w-4" />
              Reorder
            </Button>
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
          isReordering ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => {
                const totalItems = p.translations.length + p.transcriptions.length + p.extractions.length
                return (
                  <Card
                    key={p.id}
                    className="cursor-pointer hover:border-primary transition-colors overflow-hidden border border-muted h-full flex flex-col"
                    onClick={() => setCurrentProject(p.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{p.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 flex flex-col flex-1">
                      <div className="flex-1" />
                      <div className="flex flex-col gap-1 mt-auto">
                        <p className="text-sm text-muted-foreground">
                          {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(p.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )
        )}
      </div>
    )
  }

  return <ProjectMain />
}
