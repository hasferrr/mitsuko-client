"use client"

import { Plus, FileText, GripVertical, MoreHorizontal, Trash, Upload, Loader2, Archive, ArchiveRestore, ChevronDown, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useProjectActions } from "@/hooks/project/use-project-actions"
import { useCardGridSelection } from "@/hooks/project/use-card-grid-selection"
import { CardGridSelectionBar } from "@/components/shared/card-grid-selection-bar"
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
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { ConfirmDialogue } from "@/components/shared/confirm-dialogue"
import { useState, useEffect, useRef, useEffectEvent } from "react"

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

  const {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    promptDelete,
    handleConfirmDelete,
    handleExport,
    handleArchive,
  } = useProjectActions()

  const [archivedCollapsed, setArchivedCollapsed] = useState(true)
  const archivedCollapsedBeforeSelect = useRef(true)

  const selection = useCardGridSelection({
    activeItems: activeProjects,
    archivedItems: archivedProjects,
    itemType: "project",
  })

  const onArchivedCollapseSync = useEffectEvent(() => {
    if (selection.isSelecting) {
      archivedCollapsedBeforeSelect.current = archivedCollapsed
      setArchivedCollapsed(false)
    } else {
      setArchivedCollapsed(archivedCollapsedBeforeSelect.current)
    }
  })

  useEffect(() => {
    onArchivedCollapseSync()
  }, [selection.isSelecting])

  const onEscapeKey = useEffectEvent(() => {
    selection.toggleSelectMode()
  })

  useEffect(() => {
    if (!selection.isSelecting) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeKey()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selection.isSelecting])

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

  const SortableProjectCard = ({ project, selectMode, selected, onSelectToggle }: { project: typeof projects[number]; selectMode?: boolean; selected?: boolean; onSelectToggle?: (id: string) => void }) => {
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

    const handleClick = () => {
      if (selectMode) {
        onSelectToggle?.(project.id)
      } else {
        setCurrentProject(project.id)
      }
    }

    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "cursor-pointer hover:ring-primary transition-colors overflow-hidden h-full flex flex-col",
          isDragging && "opacity-50",
          selectMode && "select-none",
          selectMode && selected && "ring-primary bg-primary/5 dark:bg-primary/10"
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
                      handleExport(project.id)
                    }}
                  >
                    <Upload className="size-4" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleArchive(project.id, true)
                    }}
                  >
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      promptDelete(project.id)
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
          )}
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

  const ArchivedProjectCard = ({ project, selectMode, selected, onSelectToggle }: { project: typeof projects[number]; selectMode?: boolean; selected?: boolean; onSelectToggle?: (id: string) => void }) => {
    const totalItems = project.translations.length + project.transcriptions.length + project.extractions.length

    const handleClick = () => {
      if (selectMode) {
        onSelectToggle?.(project.id)
      } else {
        setCurrentProject(project.id)
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
                      handleExport(project.id)
                    }}
                  >
                    <Upload className="size-4" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleArchive(project.id, false)
                    }}
                  >
                    <ArchiveRestore className="size-4" />
                    Unarchive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      promptDelete(project.id)
                    }}
                    className="text-destructive"
                  >
                    <Trash className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
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
    const hasAnyCards = activeProjects.length > 0 || archivedProjects.length > 0
    return (
      <div className="flex flex-col gap-4 mx-auto container p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Select a Project</h2>
          <div className="flex gap-2">
            {hasAnyCards && !showSkeletons && (
              <Button
                variant="outline"
                onClick={selection.toggleSelectMode}
              >
                <CheckSquare className="size-4" />
                {selection.isSelecting ? "Cancel" : "Select"}
              </Button>
            )}
            <Button onClick={handleCreateProject} disabled={isCreateDisabled || selection.isSelecting}>
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
          <>
            {activeProjects.length > 0 && (
              selection.isSelecting ? (
                <div translate="no" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjects.map(p => (
                    <SortableProjectCard
                      key={p.id}
                      project={p}
                      selectMode
                      selected={selection.selectedIds.has(p.id)}
                      onSelectToggle={selection.handleSelectToggle}
                    />
                  ))}
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
              )
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
                      <ArchivedProjectCard
                        key={p.id}
                        project={p}
                        selectMode={selection.isSelecting}
                        selected={selection.selectedIds.has(p.id)}
                        onSelectToggle={selection.handleSelectToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <CardGridSelectionBar
          open={selection.isSelecting}
          selectedCount={selection.selectedIds.size}
          activeSelectedCount={selection.activeSelectedCount}
          archivedSelectedCount={selection.archivedSelectedCount}
          isProcessing={selection.isProcessing}
          allSelected={selection.allSelected}
          hasActiveItems={activeProjects.length > 0}
          hasArchivedItems={archivedProjects.length > 0}
          onDelete={() => selection.setIsDeleteDialogOpen(true)}
          onArchive={() => selection.setIsArchiveDialogOpen(true)}
          onUnarchive={() => selection.setIsUnarchiveDialogOpen(true)}
          onExport={selection.handleExportSelected}
          onSelectAllToggle={selection.handleSelectAllToggle}
          onSelectActiveOnly={selection.handleSelectActiveOnly}
          onSelectArchivedOnly={selection.handleSelectArchivedOnly}
          onCancel={selection.toggleSelectMode}
        />

        <DeleteDialogue
          handleDelete={handleConfirmDelete}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          isProcessing={isDeleting}
        />

        <DeleteDialogue
          handleDelete={selection.handleDeleteSelected}
          isDeleteModalOpen={selection.isDeleteDialogOpen}
          setIsDeleteModalOpen={selection.setIsDeleteDialogOpen}
          isProcessing={selection.isProcessing}
        />

        <ConfirmDialogue
          open={selection.isArchiveDialogOpen}
          onOpenChange={selection.setIsArchiveDialogOpen}
          title="Confirm Archive"
          description={`Are you sure you want to archive ${selection.activeSelectedCount} project${selection.activeSelectedCount > 1 ? "s" : ""}?`}
          confirmLabel="Archive"
          onConfirm={selection.handleArchiveSelected}
          isProcessing={selection.isProcessing}
        />

        <ConfirmDialogue
          open={selection.isUnarchiveDialogOpen}
          onOpenChange={selection.setIsUnarchiveDialogOpen}
          title="Confirm Unarchive"
          description={`Are you sure you want to unarchive ${selection.archivedSelectedCount} project${selection.archivedSelectedCount > 1 ? "s" : ""}?`}
          confirmLabel="Unarchive"
          onConfirm={selection.handleUnarchiveSelected}
          isProcessing={selection.isProcessing}
        />
      </div>
    )
  }

  return <ProjectMain currentProject={currentProject} />
}
