'use client'

import { useState, useRef } from 'react'
import { z } from 'zod'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download } from 'lucide-react'
import { CustomInstruction } from '@/types/custom-instruction'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const customInstructionImportSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).transform(data => ({
  ...data,
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date(),
}))

const importFileSchema = z.object({
  customInstruction: z.array(customInstructionImportSchema),
})

export function ImportInstructionsDialog() {
  const { customInstructions, bulkCreate } = useCustomInstructionStore()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [instructionsToImport, setInstructionsToImport] = useState<CustomInstruction[]>([])
  const [selectedImportIds, setSelectedImportIds] = useState<Set<string>>(new Set())
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsedData = importFileSchema.parse(JSON.parse(text))
      const importedData = parsedData.customInstruction

      setInstructionsToImport(importedData)
      setSelectedImportIds(new Set(importedData.map(i => i.id)))
      setIsImportDialogOpen(true)
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Invalid File Content", {
          description: "The file content does not match the required structure or data types.",
        })
      } else {
        toast.error("Import Failed", {
          description: "There was an error parsing the file. Please ensure it is a valid JSON file.",
        })
      }
    }

    if (event.target) {
      event.target.value = ''
    }
  }

  const handleConfirmImport = async () => {
    const selectedInstructions = instructionsToImport.filter(instr => selectedImportIds.has(instr.id))
    const existingIds = new Set(customInstructions.map(i => i.id))
    const newInstructions = selectedInstructions.map(instr => {
      if (existingIds.has(instr.id)) {
        return { ...instr, id: crypto.randomUUID() }
      }
      return instr
    })
    await bulkCreate(newInstructions)
    setIsImportDialogOpen(false)
    setInstructionsToImport([])
    setSelectedImportIds(new Set())
  }

  const handleToggleImportSelection = (id: string) => {
    const newSelectedIds = new Set(selectedImportIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    setSelectedImportIds(newSelectedIds)
  }

  const handleToggleAllImportSelection = () => {
    if (selectedImportIds.size === instructionsToImport.length) {
      setSelectedImportIds(new Set())
    } else {
      setSelectedImportIds(new Set(instructionsToImport.map(item => item.id)))
    }
  }

  return (
    <>
      <input
        type="file"
        ref={importInputRef}
        onChange={handleFileChange}
        accept="application/json"
        className="hidden"
      />
      <Button variant="outline" onClick={handleImportClick}>
        <Download size={18} />
        Import
      </Button>

      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Import Custom Instructions</AlertDialogTitle>
            <AlertDialogDescription>
              Select the instructions you want to import. Existing instructions with the same ID will be assigned a new ID.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-4 my-4 p-2 border rounded-md bg-muted/50">
            <Checkbox
              id="select-all-import"
              checked={selectedImportIds.size === instructionsToImport.length && instructionsToImport.length > 0}
              onCheckedChange={handleToggleAllImportSelection}
              aria-label="Select all for import"
            />
            <label htmlFor="select-all-import" className="text-sm font-medium leading-none">
              {selectedImportIds.size === instructionsToImport.length ? 'Deselect All' : 'Select All'} ({instructionsToImport.length} items)
            </label>
          </div>
          <ScrollArea className="h-[50vh] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructionsToImport.map(item => (
                <Card
                  key={item.id}
                  className={cn(
                    "overflow-hidden border h-full flex flex-col transition-colors duration-300 relative cursor-pointer",
                    selectedImportIds.has(item.id) ? "border-primary" : "border-muted"
                  )}
                  onClick={() => handleToggleImportSelection(item.id)}
                >
                  <Checkbox
                    checked={selectedImportIds.has(item.id)}
                    onCheckedChange={() => handleToggleImportSelection(item.id)}
                    className="absolute top-3 right-3 z-10"
                    aria-label={`Select ${item.name}`}
                  />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-4">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport} disabled={selectedImportIds.size === 0}>
              Import {selectedImportIds.size > 0 ? `(${selectedImportIds.size})` : ''} Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}