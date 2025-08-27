'use client'

import { useMemo, useState, useRef } from 'react'
import { useUploadStore } from '@/stores/use-upload-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listUploads, deleteUpload } from '@/lib/api/uploads'
import { uploadFile } from '@/lib/api/file-upload'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Clock,
  HardDrive,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { DeleteDialogue } from '@/components/ui-custom/delete-dialogue'
import { useSessionStore } from '@/stores/use-session-store'
import { MAX_FILE_SIZE } from '@/constants/default'

const getFileIcon = (contentType?: string) => {
  if (contentType?.startsWith('audio/')) return FileText
  return FileText
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number) => {
  if (seconds === 0) return 'N/A'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const getStatusVariant = (state: string) => {
  switch (state) {
    case 'completed':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'revoked':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function CloudFilesList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const uploadProgress = useUploadStore(state => state.uploadProgress)
  const setUploadProgress = useUploadStore(state => state.setUploadProgress)
  const setIsUploading = useUploadStore(state => state.setIsUploading)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const session = useSessionStore(state => state.session)
  const queryClient = useQueryClient()

  const { mutate: deleteFile } = useMutation({
    mutationFn: (uploadId: string) => deleteUpload(uploadId),
    onMutate: (uploadId: string) => {
      setDeletingId(uploadId)
    },
    onSuccess: () => {
      toast.success('File deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['uploads'] })
      setIsDeleteDialogOpen(false)
      setPendingDeleteId(null)
    },
    onError: (error: Error) => {
      toast.error('Failed to delete file', {
        description: error.message,
      })
    },
    onSettled: () => {
      setDeletingId(null)
    },
  })

  const { mutate: handleUpload } = useMutation({
    mutationFn: (file: File) => uploadFile(file, setUploadProgress),
    onMutate: () => {
      setIsUploading(true)
      setUploadProgress(null)
    },
    onSuccess: () => {
      toast.success('File uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['uploads'] })
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to upload file', {
        description: error.message,
      })
      setUploadProgress(null)
    },
    onSettled: () => {
      setIsUploading(false)
    },
  })

  const {
    data: uploads = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['uploads', session?.user?.id],
    queryFn: () => listUploads(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: !!session,
  })

  const filteredUploads = useMemo(() => {
    if (!searchQuery) return uploads
    const q = searchQuery.toLowerCase()
    return uploads.filter(upload =>
      upload.fileName?.toLowerCase().includes(q) ||
      upload.contentType?.toLowerCase().includes(q)
    )
  }, [uploads, searchQuery])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleRefresh = async () => {
    try {
      await refetch()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      toast.error('Failed to refresh data', { description: message })
    }
  }

  const completedUploads = uploads.filter(upload => upload.state === 'completed').length
  const totalUploads = uploads.length
  const totalSize = uploads.reduce((acc, upload) => acc + (upload.size || 0), 0)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast.error('Invalid file type', {
        description: 'Please select an audio file'
      })
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: `Please select a file smaller than ${formatFileSize(MAX_FILE_SIZE)}`
      })
      return
    }

    handleUpload(file)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">
            Uploaded Files
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your uploaded audio files
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button
            onClick={handleUploadClick}
            disabled={isUploading || !session}
            className="w-fit"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Upload File
          </Button> */}
          <Button
            onClick={handleRefresh}
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
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadProgress && (
        <Card>
          <CardHeader className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading file...</span>
                <span className="text-sm text-muted-foreground">
                  {uploadProgress.percentage}%
                </span>
              </div>
              <Progress value={uploadProgress.percentage} className="w-full" />
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Search Section */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search files by name or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Status Card */}
      <Card className="border-dashed">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">
                    File Storage Overview
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isLoading
                      ? 'Loading files...'
                      : `${completedUploads} of ${totalUploads} files completed`}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {totalSize > 0 ? formatFileSize(totalSize) : '0 Bytes'}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Section */}
      {isLoading || !session ? (
        <div className="rounded-lg border bg-card px-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">File Name</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Uploaded</TableHead>
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
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <Skeleton className="h-6 w-16 mx-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredUploads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg">
          <Upload className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery
              ? 'No matching files found'
              : 'No uploaded files yet'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or check the spelling'
              : session
                ? 'Upload your first audio file to get started'
                : 'Sign in to view and manage your uploaded files'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card px-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">File Name</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Uploaded</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUploads.map((upload) => {
                const FileIcon = getFileIcon(upload.contentType)
                return (
                  <TableRow key={upload.uploadId} className="group">
                    <TableCell className="py-4 min-w-[250px] max-w-[250px] lg:min-w-[300px] lg:max-w-[400px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="w-full line-clamp-3">
                          <p className="font-medium line-clamp-2">
                            {upload.fileName || 'Unknown file'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {upload.contentType}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        {upload.size ? formatFileSize(upload.size) : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {upload.duration ? formatDuration(upload.duration) : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={getStatusVariant(upload.state)}>
                        {upload.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(upload.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                        disabled={deletingId === upload.uploadId}
                        onClick={() => {
                          setPendingDeleteId(upload.uploadId)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        {deletingId === upload.uploadId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteDialogue
        handleDelete={() => {
          if (pendingDeleteId) deleteFile(pendingDeleteId)
        }}
        isDeleteModalOpen={isDeleteDialogOpen}
        setIsDeleteModalOpen={setIsDeleteDialogOpen}
        isProcessing={deletingId !== null}
      />
    </div>
  )
}