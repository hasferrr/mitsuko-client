"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { File, Trash2, RefreshCw, Loader2 } from "lucide-react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { listUploads, deleteUpload } from "@/lib/api/uploads"
import { UploadFileMeta } from "@/types/uploads"
import { useSessionStore } from "@/stores/use-session-store"

import { toast } from "sonner"
import { DeleteDialogue } from "@/components/ui-custom/delete-dialogue"
import { cn } from "@/lib/utils"

interface ManageUploadsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUploadId?: string | null
  onSelectUpload?: (uploadId: string | null) => void
}

export function ManageUploadsDialog({
  open,
  onOpenChange,
  selectedUploadId,
  onSelectUpload,
}: ManageUploadsDialogProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const session = useSessionStore((state) => state.session)
  const queryClient = useQueryClient()
  const {
    data: uploads = [],
    isLoading: isUploadsLoading,
    isRefetching: isUploadsRefetching,
    refetch: refetchUploads,
  } = useQuery({
    queryKey: ["uploads", session?.user?.id],
    queryFn: () => listUploads(),
    staleTime: Infinity,
    enabled: !!session && open,
  })

  const { mutate: deleteFile, isPending: isDeleting } = useMutation({
    mutationFn: (uploadId: string) => deleteUpload(uploadId),
    onSuccess: () => {
      toast.success("File deleted")
      queryClient.invalidateQueries({ queryKey: ["uploads"] })
      if (pendingDeleteId === selectedUploadId && onSelectUpload) {
        onSelectUpload(null)
      }
      setIsDeleteDialogOpen(false)
    },
    onError: (err: Error) => toast.error("Failed to delete", { description: err.message }),
  })

  const handleSelectUpload = (upload: UploadFileMeta) => {
    if (!onSelectUpload) return
    if (selectedUploadId === upload.uploadId) {
      onSelectUpload(null)
    } else {
      onSelectUpload(upload.uploadId)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, uploadId: string) => {
    e.stopPropagation()
    setPendingDeleteId(uploadId)
    setIsDeleteDialogOpen(true)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Uploaded Files</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchUploads()}
              disabled={isUploadsRefetching}
            >
              {isUploadsRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-card border border-border rounded-lg p-4">
          {isUploadsLoading ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="border rounded-md p-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <div className="flex gap-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : uploads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploaded files found. Please upload a file first.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploads.map(upload => (
                <div
                  key={upload.uploadId}
                  onClick={() => handleSelectUpload(upload)}
                  className={cn(
                    "border rounded-md p-3 cursor-pointer",
                    selectedUploadId === upload.uploadId ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium">{upload.fileName}</p>
                      <p className="text-xs text-muted-foreground flex gap-1">
                        <span className="block">{upload.contentType || "audio"}</span>
                        <span className="block">{upload.size ? formatFileSize(upload.size) : 'N/A'}</span>
                        <span className="block">{upload.duration ? formatDuration(upload.duration) : 'N/A'}</span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                      onClick={(e) => handleDeleteClick(e, upload.uploadId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedUploadId && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: <span className="text-foreground">{uploads.find(u => u.uploadId === selectedUploadId)?.fileName || 'Unknown file'}</span>
            </p>
          )}
        </div>

        <DeleteDialogue
          handleDelete={() => {
            if (pendingDeleteId) deleteFile(pendingDeleteId)
          }}
          isDeleteModalOpen={isDeleteDialogOpen}
          setIsDeleteModalOpen={setIsDeleteDialogOpen}
          isProcessing={isDeleting}
        />
      </DialogContent>
    </Dialog>
  )
}
