'use client'

import { useEffect, useState } from 'react'
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

export default function MyLibrary() {
  const { customInstructions, load, remove, loading } =
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
    onError: error => {
      console.error('Failed to publish instruction:', error)
    },
  })

  useEffect(() => {
    load()
  }, [load])

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Loading instructions...</p>
        </div>
      ) : customInstructions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2 text-center">Your Library is Empty</h2>
          <p className="text-muted-foreground mb-4 text-center text-sm">
            Add reusable custom instructions to improve your translations.
          </p>
          <CreateEditInstructionDialog>
            <Button>
              <Plus className="h-4 w-4" /> Create Custom Instruction
            </Button>
          </CreateEditInstructionDialog>
        </div>
      ) : (
        <>
          {filteredInstructions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2 text-center">No Results Found</h2>
              <p className="text-muted-foreground mb-4 text-center text-sm">
                Try adjusting your search terms
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructions.map(item => (
                <CreateEditInstructionDialog key={item.id} instruction={item}>
                  <Card
                    className={cn(
                      "overflow-hidden border border-muted h-full flex flex-col transition-colors duration-300 relative",
                      "cursor-pointer",
                      selectedIds.has(item.id) && "border-primary"
                    )}
                    onClick={(e) => {
                      if (isSelectionMode) {
                        e.preventDefault()
                        e.stopPropagation()
                        handleToggleSelection(item.id)
                      }
                    }}
                  >
                    {isSelectionMode && (
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => handleToggleSelection(item.id)}
                        className="absolute top-3 right-3 z-10"
                        aria-label={`Select ${item.name}`}
                      />
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle>{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {item.content}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          if (item.id) {
                            handleOpenPublishDialog(
                              item.id,
                              item.name,
                              item.content,
                            )
                          }
                        }}
                        disabled={isSelectionMode || publishingId === item.id}
                      >
                        {publishingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Globe className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" disabled={isSelectionMode}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id!) }}
                        disabled={isSelectionMode}
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                </CreateEditInstructionDialog>
              ))}
            </div>
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
              Are you sure you want to publish this instruction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will make your custom instruction publicly available for
              other users to view and import. You can hide it later if you
              wish.
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