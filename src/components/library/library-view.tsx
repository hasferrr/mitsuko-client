'use client'

import { useEffect, useState, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Pencil, Trash, Plus, FileText, Search, Download, Upload, X } from 'lucide-react'
import { CustomInstruction } from '@/types/custom-instruction'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
})

export default function LibraryView() {
  const { customInstructions, load, create, update, remove, bulkCreate, loading } = useCustomInstructionStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const importInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', content: '' },
    mode: 'onChange',
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }
  useEffect(() => {
    handleResize()
  }, [form.watch('content')])

  useEffect(() => {
    load()
  }, [load])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      await update(editingId, values)
    } else {
      await create(values.name, values.content)
    }
    setIsDialogOpen(false)
    setEditingId(null)
    form.reset()
  }

  const handleEdit = (item: CustomInstruction) => {
    setEditingId(item.id)
    form.setValue('name', item.name)
    form.setValue('content', item.content)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleExport = () => {
    const itemsToExport = customInstructions.filter(item => selectedIds.has(item.id))
    const dataStr = JSON.stringify(itemsToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'custom-instructions.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedInstructions: CustomInstruction[] = JSON.parse(text)
      const existingIds = new Set(customInstructions.map(i => i.id))
      const newInstructions = importedInstructions.map(instr => {
        if (existingIds.has(instr.id)) {
          return { ...instr, id: crypto.randomUUID() }
        }
        return instr
      })

      await bulkCreate(newInstructions)

    } catch (error) {
      console.error('Failed to import instructions:', error)
    }

    if (event.target) {
      event.target.value = ''
    }
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
          {isSelectionMode ? (
            <>
              <Button variant="outline" onClick={handleExport} disabled={selectedIds.size === 0}>
                <Download size={18} />
                Export {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </Button>
              <Button variant="ghost" onClick={cancelSelectionMode}>
                <X size={18} />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <input
                type="file"
                ref={importInputRef}
                onChange={handleFileChange}
                accept="application/json"
                className="hidden"
              />
              <Button variant="outline" onClick={handleImportClick}>
                <Upload size={18} />
                Import
              </Button>
              {customInstructions.length > 0 && (
                <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                  <Download size={18} />
                  Export
                </Button>
              )}
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {customInstructions.length > 0 && (
                  <AlertDialogTrigger asChild>
                    <Button onClick={() => { setEditingId(null); form.reset() }}>
                      <Plus size={18} />
                      New Instruction
                    </Button>
                  </AlertDialogTrigger>
                )}
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">{editingId ? 'Edit' : 'Create'} Custom Instruction</AlertDialogTitle>
                    <AlertDialogDescription>
                      {editingId ? 'Update your custom instruction details below.' : 'Create a new custom instruction to use in your translations.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Formal Translation Style" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                ref={textareaRef}
                                onInput={handleResize}
                                onFocus={handleResize}
                                className="min-h-[100px] max-h-[300px] overflow-y-auto resize-none"
                                placeholder="Enter your custom instruction here"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction type="submit" disabled={loading || !form.formState.isValid}>Save</AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </>
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
          <Button onClick={() => { setEditingId(null); form.reset(); setIsDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> Create Custom Instruction
          </Button>
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
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(item) }}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
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