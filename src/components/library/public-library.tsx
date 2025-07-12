'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getPublicCustomInstruction,
  getPublicCustomInstructionsPaged,
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
import { Search, Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCustomInstructionStore } from '@/stores/data/use-custom-instruction-store'

export default function PublicLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [importName, setImportName] = useState('')
  const [importContent, setImportContent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 30
  const { create: createCustomInstruction } = useCustomInstructionStore()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    data: paginatedData,
    isLoading: isLoadingInstructions
  } = useQuery({
    queryKey: ['publicCustomInstructionsPaged', currentPage, ITEMS_PER_PAGE],
    queryFn: () => getPublicCustomInstructionsPaged(currentPage, ITEMS_PER_PAGE),
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
      item.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isModalOpen = !!selectedId

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
    <div className="mt-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search public instructions..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>
      {isLoadingInstructions ? (
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
              <Card key={item.id} className="cursor-pointer" onClick={() => setSelectedId(item.id)}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">{item.preview}</p>
                </CardContent>
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
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={() => setSelectedId(null)}>
        <DialogContent>
          {isLoadingInstruction ? (
            <p>Loading instruction...</p>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Import Custom Instruction</DialogTitle>
                <DialogDescription>
                  Review the instruction before adding it to your library.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedId(null)}>
                  Cancel
                </Button>
                <Button onClick={handleImportInstruction}>
                  <Download className="h-4 w-4 mr-2" />
                  Import to My Library
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}