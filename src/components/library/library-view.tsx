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
import { Pencil, Trash, Plus, FileText, Search } from 'lucide-react'
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

export default function LibraryView() {
  const { customInstructions, load, remove, loading } = useCustomInstructionStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const filteredInstructions = customInstructions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="container max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center pb-4">
        <h1 className="text-2xl font-semibold">My Library</h1>
        <div className="flex items-center gap-2">
          <ImportInstructionsDialog />
          <ExportInstructionsControls
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onEnterSelectionMode={() => setIsSelectionMode(true)}
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
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search instructions by name or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-md"
        />
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
                <Card
                  key={item.id}
                  className={cn(
                    "overflow-hidden border border-muted h-full flex flex-col transition-colors duration-300 relative",
                    isSelectionMode && "cursor-pointer",
                    selectedIds.has(item.id) && "border-primary"
                  )}
                  onClick={() => isSelectionMode && handleToggleSelection(item.id)}
                >
                  {isSelectionMode && (
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => handleToggleSelection(item.id)}
                      className="absolute top-3 right-3 z-10"
                      aria-label={`Select ${item.name}`}
                    />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-4">{item.content}</p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end gap-2">
                    <CreateEditInstructionDialog instruction={item}>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation() }}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </CreateEditInstructionDialog>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id!) }}>
                      <Trash className="h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom instruction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId !== null) {
                  await remove(deleteId)
                }
                setDeleteId(null)
              }}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}