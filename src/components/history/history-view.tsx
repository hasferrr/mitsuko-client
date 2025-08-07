'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTranscriptionLogs } from '@/lib/api/transcription-log'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  CircleDollarSign,
  FileAudio2,
  Loader2,
  RefreshCw,
  Search,
  SquareArrowOutUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TranscriptionLogItem } from '@/types/transcription-log'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import LogResultDialog from './log-result-dialog'
import { useSessionStore } from '@/stores/use-session-store'

const ITEMS_PER_PAGE = 10

export default function HistoryView() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<TranscriptionLogItem | null>(null)

  const session = useSessionStore(state => state.session)

  const {
    data: paged,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['transcriptionLogs', currentPage, ITEMS_PER_PAGE, session?.user?.id],
    queryFn: () => getTranscriptionLogs(currentPage, ITEMS_PER_PAGE),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: !!session,
  })

  const logs = paged?.data ?? []
  const totalPages = paged?.totalPages ?? 1

  const filtered = useMemo(() => {
    if (!searchQuery) return logs
    const q = searchQuery.toLowerCase()
    return logs.filter(item =>
      item.metadata.originalname?.toLowerCase().includes(q) ||
      item.reqModels?.toLowerCase().includes(q)
    )
  }, [logs, searchQuery])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

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
            className="cursor-pointer"
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
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium">
            Transcription History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your audio transcription results
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          className="w-fit"
        >
          {isRefetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Search Section */}
      <div className="relative max-w-md mb-6">
        <Input
          placeholder="Search files or models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Loading your files
          </h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we fetch your transcription history...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileAudio2 className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery
              ? 'No matching files found'
              : 'No transcription history yet'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or check the spelling'
              : session
                ? 'Start by uploading your first audio file for transcription'
                : 'Sign in to view and manage your transcription history'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Table */}
          <div className="rounded-lg border bg-card px-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold lg:min-w-[300px]">File Name</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Costs</TableHead>
                  <TableHead className="font-semibold">Model</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item._id} className="group">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileAudio2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
                            {item.metadata.originalname || 'Unknown file'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ID: {item._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                        {item.creditsConsumed !== undefined
                          ? item.creditsConsumed.toLocaleString()
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary">
                        {item.reqModels}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(item)}
                      >
                        <SquareArrowOutUpRight className="h-4 w-4" />
                        View Result
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filtered.length} files
                    </p>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="flex justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    aria-disabled={currentPage === 1}
                    className={cn(
                      'cursor-pointer',
                      currentPage === 1 && 'pointer-events-none opacity-50 cursor-default'
                    )}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={cn(
                      'cursor-pointer',
                      currentPage === totalPages && 'pointer-events-none opacity-50 cursor-default'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      <LogResultDialog
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      />
    </div>
  )
}
