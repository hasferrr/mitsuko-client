'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTranscriptionLogs } from '@/lib/api/transcription-log'
import { Card, CardHeader } from '@/components/ui/card'
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
  CheckCircle,
  CircleDollarSign,
  FileAudio2,
  Loader2,
  RefreshCw,
  Search,
  SquareArrowOutUpRight,
  Trash2,
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
import { Skeleton } from '@/components/ui/skeleton'
import LogResultDialog from './log-result-dialog'
import { deleteTranscriptionLog } from '@/lib/api/transcription-log'
import { toast } from 'sonner'
import { DeleteDialogue } from '@/components/ui-custom/delete-dialogue'
import { useSessionStore } from '@/stores/use-session-store'
import { fetchBackgroundTranscriptionCount } from '@/lib/api/credit-reservations'

const ITEMS_PER_PAGE = 5

export default function HistoryView() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<TranscriptionLogItem | null>(null)

  const session = useSessionStore(state => state.session)

  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const { mutate: deleteLog } = useMutation({
    mutationFn: (id: string) => deleteTranscriptionLog(id),
    onMutate: (id: string) => {
      setDeletingId(id)
    },
    onSuccess: () => {
      toast.success('Transcription deleted')
      queryClient.invalidateQueries({ queryKey: ['transcriptionLogs'] })
      setIsDeleteDialogOpen(false)
      setPendingDeleteId(null)
    },
    onError: (error: Error) => {
      toast.error('Failed to delete transcription', {
        description: error.message,
      })
    },
    onSettled: () => {
      setDeletingId(null)
    },
  })

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

  const {
    data: bgCount = 0,
    isLoading: isBgLoading,
    refetch: refetchBg,
    isFetching: isBgFetching,
  } = useQuery({
    queryKey: ['bg-transcription-count', session?.user?.id],
    queryFn: () => fetchBackgroundTranscriptionCount(),
    staleTime: Infinity,
    refetchInterval: (query) => (query.state.data && query.state.data > 0 ? 2 * 60 * 1000 : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: !!session?.user?.id,
  })

  const totalPages = paged?.totalPages ?? 1

  const filtered = useMemo(() => {
    const logs = paged?.data ?? []
    if (!searchQuery) return logs
    const q = searchQuery.toLowerCase()
    return logs.filter(item =>
      item.metadata.originalname?.toLowerCase().includes(q) ||
      item.reqModels?.toLowerCase().includes(q)
    )
  }, [paged?.data, searchQuery])

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

  const handleRefresh = async () => {
    try {
      await Promise.all([refetch(), refetchBg()])
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      toast.error('Failed to refresh data', { description: message })
    }
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
          onClick={handleRefresh}
          disabled={isRefetching || isBgFetching}
          variant="outline"
          className="w-fit"
        >
          {isRefetching || isBgFetching ? (
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
      {isLoading || !session ? (
        <div className="space-y-6">
          <Card className="border-dashed">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="h-9">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Skeleton Table */}
          <div className="rounded-lg border bg-card px-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">File Name</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Costs</TableHead>
                  <TableHead className="font-semibold">Model</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="py-4 min-w-[250px] max-w-[250px] lg:min-w-[300px] lg:max-w-[400px]">
                      <div className="flex items-center gap-3">
                        <Skeleton className="flex-shrink-0 w-10 h-10 rounded-lg" />
                        <div className="w-full">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-4">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg">
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
          <Card className="border-dashed">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(isBgLoading || bgCount > 0) ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <CheckCircle className="h-4 w-4 " />
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      Audio Transcription
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isBgLoading
                        ? 'Checking status...'
                        : bgCount > 0
                          ? `${bgCount} transcription${bgCount > 1 ? 's' : ''} still processing`
                          : 'No transcriptions running'}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Table */}
          <div className="rounded-lg border bg-card px-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">File Name</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Costs</TableHead>
                  <TableHead className="font-semibold">Model</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item._id} className="group">
                    <TableCell className="py-4 min-w-[250px] max-w-[250px] lg:min-w-[300px] lg:max-w-[400px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileAudio2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="w-full line-clamp-3">
                          <p className="font-medium line-clamp-2">
                            {item.metadata.originalname || 'Unknown file'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ID: {item._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-4 w-4">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-4 w-4">
                          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
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
                      <div className="inline-flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(item)}
                        >
                          <SquareArrowOutUpRight className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          disabled={deletingId === item._id}
                          onClick={() => {
                            setPendingDeleteId(item._id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          {deletingId === item._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
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

      <DeleteDialogue
        handleDelete={() => {
          if (pendingDeleteId) deleteLog(pendingDeleteId)
        }}
        isDeleteModalOpen={isDeleteDialogOpen}
        setIsDeleteModalOpen={setIsDeleteDialogOpen}
        isProcessing={deletingId !== null}
      />

      <LogResultDialog
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      />
    </div>
  )
}
