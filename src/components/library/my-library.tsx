'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCustomInstructionStore } from '@/stores/data/use-custom-instruction-store'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import {
  Pencil,
  Trash,
  Plus,
  FileText,
  Search,
  Loader2,
  Globe,
  GripVertical,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ImportInstructionsDialog } from './import-instructions-dialog'
import { ExportInstructionsControls } from './export-instructions-controls'
import { CreateEditInstructionDialog } from './create-edit-instruction-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPublicCustomInstruction } from '@/lib/api/custom-instruction'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CustomInstruction } from '@/types/custom-instruction'

export default function MyLibrary() {
  const { customInstructions, load, remove, reorder } =
    useCustomInstructionStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [
    publishInstructionData,
    setPublishInstructionData,
  ] = useState<{ id: string; name: string; content: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { mutate: publishInstruction } = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      createPublicCustomInstruction(name, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicCustomInstructionsPaged'] })
    },
    onError: (error: Error) => {
      console.error('Failed to publish instruction:', error)
      toast.error('Failed to publish instruction', {
        description: error.message,
      })
    },
  })

  useEffect(() => {
    load()
  }, [load])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = customInstructions.findIndex(item => item.id === active.id)
    const newIndex = customInstructions.findIndex(item => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(
      customInstructions.map(item => item.id),
      oldIndex,
      newIndex,
    )
    await reorder(newOrder)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const handlePublish = (id: string, name: string, content: string) => {
    setPublishingId(id)
    publishInstruction(
      { name, content },
      {
        onSettled: () => {
          setPublishingId(null)
        },
      },
    )
  }

  const handleOpenPublishDialog = (
    id: string,
    name: string,
    content: string,
  ) => {
    setPublishInstructionData({ id, name, content })
    setIsPublishDialogOpen(true)
  }

  const filteredInstructions = customInstructions.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleSelection = (id: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    setSelectedIds(newSelectedIds)
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredInstructions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredInstructions.map(item => item.id)))
    }
  }

  const cancelSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }


  return (
    <>
      <div className="flex justify-between items-center mb-6 gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search instructions by name or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <ImportInstructionsDialog />
          <ExportInstructionsControls
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onEnterSelectionMode={() => {
              setIsSelectionMode(true)
              setSelectedIds(new Set(filteredInstructions.map(item => item.id)))
            }}
            onCancelSelectionMode={cancelSelectionMode}
            hasInstructions={customInstructions.length > 0}
            customInstructions={customInstructions}
          />
          {customInstructions.length > 0 && (
            <CreateEditInstructionDialog>
              <Button>
                <Plus size={18} />
                New Instruction
              </Button>
            </CreateEditInstructionDialog>
          )}
        </div>
      </div>

      {isSelectionMode && customInstructions.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-2 border rounded-md bg-muted/50">
          <Checkbox
            id="select-all"
            checked={selectedIds.size === filteredInstructions.length && filteredInstructions.length > 0}
            onCheckedChange={handleToggleSelectAll}
            aria-label="Select all"
          />
          <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {selectedIds.size === filteredInstructions.length ? 'Deselect All' : 'Select All'} ({filteredInstructions.length} items)
          </label>
        </div>
      )}

      {customInstructions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
          <FileText className="size-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2 text-center">Your Library is Empty</h2>
          <p className="text-muted-foreground mb-4 text-center text-sm">
            Add reusable custom instructions to improve your translations.
          </p>
          <CreateEditInstructionDialog>
            <Button>
              <Plus className="size-4" /> Create Custom Instruction
            </Button>
          </CreateEditInstructionDialog>
        </div>
      ) : (
        <>
          {filteredInstructions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
              <Search className="size-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2 text-center">No Results Found</h2>
              <p className="text-muted-foreground mb-4 text-center text-sm">
                Try adjusting your search terms
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredInstructions.map(item => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInstructions.map(item => (
                    <SortableInstructionCard
                      key={item.id}
                      item={item}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedIds.has(item.id)}
                      publishingId={publishingId}
                      isSearching={searchQuery !== ''}
                      onToggleSelection={handleToggleSelection}
                      onOpenPublishDialog={handleOpenPublishDialog}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
      <AlertDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Publish this instruction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will make your instruction public so others can import it. You can hide it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPublishInstructionData(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (publishInstructionData) {
                  handlePublish(
                    publishInstructionData.id,
                    publishInstructionData.name,
                    publishInstructionData.content,
                  )
                  setIsPublishDialogOpen(false)
                  setPublishInstructionData(null)
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your custom instruction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  remove(deleteId)
                  setIsDeleteDialogOpen(false)
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface SortableInstructionCardProps {
  item: CustomInstruction
  isSelectionMode: boolean
  isSelected: boolean
  publishingId: string | null
  isSearching: boolean
  onToggleSelection: (id: string) => void
  onOpenPublishDialog: (id: string, name: string, content: string) => void
  onDelete: (id: string) => void
}

function SortableInstructionCard({
  item,
  isSelectionMode,
  isSelected,
  publishingId,
  isSearching,
  onToggleSelection,
  onOpenPublishDialog,
  onDelete,
}: SortableInstructionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isSelectionMode || isSearching,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  const canDrag = !isSelectionMode && !isSearching

  return (
    <CreateEditInstructionDialog instruction={item}>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "overflow-hidden h-full flex flex-col transition-colors duration-300 relative",
          "cursor-pointer",
          isSelected && "ring-primary",
          isDragging && "opacity-50",
        )}
        onClick={(e) => {
          if (isSelectionMode) {
            e.preventDefault()
            e.stopPropagation()
            onToggleSelection(item.id)
          }
        }}
      >
        {isSelectionMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(item.id)}
            className="absolute top-3 right-3 z-10"
            aria-label={`Select ${item.name}`}
          />
        )}
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="truncate">{item.name}</CardTitle>
          {canDrag && (
            <div
              className="shrink-0 rounded-md p-1 cursor-grab hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-hidden"
              {...attributes}
              {...listeners}
              onClick={e => e.stopPropagation()}
            >
              <GripVertical className="size-4" />
            </div>
          )}
        </CardHeader>
        <CardContent className="grow">
          <p className="text-sm text-muted-foreground line-clamp-4">
            {item.content}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              onOpenPublishDialog(item.id, item.name, item.content)
            }}
            disabled={isSelectionMode || publishingId === item.id}
          >
            {publishingId === item.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Globe className="size-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" disabled={isSelectionMode}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
            disabled={isSelectionMode}
          >
            <Trash className="size-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </CreateEditInstructionDialog>
  )
}