"use client"

import { Button } from "@/components/ui/button"
import {
  File,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteDialogue } from "@/components/ui-custom/delete-dialogue"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UploadFileMeta } from "@/types/uploads"

interface TranscriptionSelectTabProps {
  uploads: UploadFileMeta[]
  isUploadsLoading: boolean
  isUploadsRefetching: boolean
  selectedUploadId: string | null
  isTranscribing: boolean
  deleteAfterTranscription: boolean
  isDeleteDialogOpen: boolean
  isDeleting: boolean
  currentId: string
  onRefetch: () => void
  onSelectUpload: (upload: UploadFileMeta) => void
  onDeselectUpload: () => void
  onSetDeleteAfterTranscription: (value: boolean) => void
  onDeleteFile: (uploadId: string) => void
  onSetIsDeleteDialogOpen: (open: boolean) => void
  onSetPendingDeleteId: (id: string | null) => void
  pendingDeleteId: string | null
}

export function TranscriptionSelectTab({
  uploads,
  isUploadsLoading,
  isUploadsRefetching,
  selectedUploadId,
  isTranscribing,
  deleteAfterTranscription,
  isDeleteDialogOpen,
  isDeleting,
  onRefetch,
  onSelectUpload,
  onDeselectUpload,
  onSetDeleteAfterTranscription,
  onDeleteFile,
  onSetIsDeleteDialogOpen,
  onSetPendingDeleteId,
  pendingDeleteId,
}: TranscriptionSelectTabProps) {
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
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Select Uploaded Audio</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRefetch()}
          disabled={isUploadsRefetching}
        >
          {isUploadsRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

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
              onClick={() => onSelectUpload(upload)}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetPendingDeleteId(upload.uploadId)
                    onSetIsDeleteDialogOpen(true)
                  }}
                  disabled={isTranscribing}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUploadId && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>
            Selected: <span className="text-foreground">{uploads.find(u => u.uploadId === selectedUploadId)?.fileName || 'Unknown file'}</span>
          </span>
          <button
            type="button"
            onClick={onDeselectUpload}
            disabled={isTranscribing}
            className="flex items-center gap-1 p-1 hover:bg-muted rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-3 w-3" />
            <span className="text-xs">Deselect</span>
          </button>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="delete-after-transcription"
            checked={deleteAfterTranscription}
            onCheckedChange={v => onSetDeleteAfterTranscription(v === true)}
          />
          <Label htmlFor="delete-after-transcription" className="text-sm text-muted-foreground">
            Delete uploaded file after transcription
          </Label>
        </div>
      )}

      <DeleteDialogue
        handleDelete={() => {
          if (pendingDeleteId) onDeleteFile(pendingDeleteId)
        }}
        isDeleteModalOpen={isDeleteDialogOpen}
        setIsDeleteModalOpen={onSetIsDeleteDialogOpen}
        isProcessing={isDeleting}
      />
    </div>
  )
}
