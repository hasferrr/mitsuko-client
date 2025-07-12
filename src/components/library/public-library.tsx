'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPublicCustomInstruction,
  getPublicCustomInstructionsPaged,
  deletePublicCustomInstruction,
} from '@/lib/api/custom-instruction'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Search,
  Download,
  User,
  Calendar,
  Trash,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { useCustomInstructionStore } from '@/stores/data/use-custom-instruction-store'
import { useSessionStore } from '@/stores/use-session-store'
import { cn } from '@/lib/utils'

export default function PublicLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [importName, setImportName] = useState('')
  const [importContent, setImportContent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showOnlyMyCreations, setShowOnlyMyCreations] = useState(false)
  const ITEMS_PER_PAGE = 15
  const { create: createCustomInstruction } = useCustomInstructionStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const session = useSessionStore(state => state.session)

  const { mutate: deleteInstruction, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deletePublicCustomInstruction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['publicCustomInstructionsPaged'],
      })
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    },
    onError: error => {
      console.error('Failed to delete instruction:', error)
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    },
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    data: paginatedData,
    isLoading: isLoadingInstructions,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [
      'publicCustomInstructionsPaged',
      currentPage,
      ITEMS_PER_PAGE,
      showOnlyMyCreations,
    ],
    queryFn: () =>
      getPublicCustomInstructionsPaged(
        currentPage,
        ITEMS_PER_PAGE,
        showOnlyMyCreations,
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const instructions = paginatedData?.data || []
  const totalPages = paginatedData?.totalPages || 1

  const { data: selectedInstruction, isLoading: isLoadingInstruction } = useQuery({
    queryKey: ['publicCustomInstruction', selectedId],
    queryFn: () => getPublicCustomInstruction(selectedId!),
    enabled: !!selectedId,
  })

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (selectedInstruction) {
      setImportName(selectedInstruction.name)
      setImportContent(selectedInstruction.content)
      setTimeout(() => handleResize(), 0)
    }
  }, [selectedInstruction])

  const handleImportInstruction = () => {
    if (selectedInstruction) {
      createCustomInstruction(
        selectedInstruction.name,
        selectedInstruction.content,
      )
      setSelectedId(null)
    }
  }

  const filteredInstructions = instructions.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const isModalOpen = !!selectedId

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      )

      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <span className="px-2">...</span>
          </PaginationItem>
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <span className="px-2">...</span>
          </PaginationItem>
        )
      }

      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search public instructions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching || isLoadingInstructions}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefetching && 'animate-spin')}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowOnlyMyCreations(prev => !prev)}
          >
            {showOnlyMyCreations ? 'Show All' : 'Show My Instructions'}
          </Button>
        </div>
      </div>
      {isLoadingInstructions && !isRefetching ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Loading instructions...</p>
        </div>
      ) : filteredInstructions.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructions.map(item => (
              <Card key={item.id} className="cursor-pointer flex flex-col" onClick={() => setSelectedId(item.id)}>
                <CardHeader className="pb-4">
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-4">{item.preview}</p>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>{item.user_id.split('-')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {session?.user.id === item.user_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-foreground"
                        onClick={e => {
                          e.stopPropagation()
                          if (item.id) handleDeleteClick(item.id)
                        }}
                        disabled={isDeleting && deleteId === item.id}
                      >
                        {isDeleting && deleteId === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    aria-disabled={currentPage === 1}
                    className={cn(
                      currentPage === 1 && 'pointer-events-none opacity-50',
                    )}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(prev => Math.min(totalPages, prev + 1))
                    }
                    aria-disabled={currentPage === totalPages}
                    className={cn(
                      currentPage === totalPages &&
                        'pointer-events-none opacity-50',
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={() => setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn(isLoadingInstruction && 'sr-only')}>
              {isLoadingInstruction
                ? 'Loading instruction'
                : 'Import Custom Instruction'}
            </DialogTitle>
            {!isLoadingInstruction && (
              <DialogDescription>
                Review the instruction before adding it to your library.
              </DialogDescription>
            )}
          </DialogHeader>
          {isLoadingInstruction ? (
            <p>Loading instruction...</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={importName}
                  readOnly
                  placeholder="e.g., Formal Translation Style"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  ref={textareaRef}
                  value={importContent}
                  onFocus={handleResize}
                  readOnly
                  placeholder="Enter your custom instruction here"
                  className="min-h-[100px] max-h-[300px] overflow-y-auto resize-none"
                />
              </div>
              {selectedInstruction && (
                <div className="flex justify-between text-xs text-muted-foreground pt-2">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>Created by: {selectedInstruction.user_id.split('-')[0]}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(selectedInstruction.created_at)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedId(null)}>
              Cancel
            </Button>
            <Button onClick={handleImportInstruction}>
              <Download className="h-4 w-4" />
              Import to My Library
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              public instruction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteInstruction(deleteId)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}