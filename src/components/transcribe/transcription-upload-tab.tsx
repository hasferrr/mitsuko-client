"use client"

import { type RefObject, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileAudio2, Loader2, Clock, Upload, X } from "lucide-react"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { MAX_FILE_SIZE, GLOBAL_MAX_DURATION_SECONDS, TRANSCRIPTION_FILE_ACCEPT } from "@/constants/transcription"
import type { MediaPreparationProgress } from "@/lib/transcription/prepare-transcription-media"
import type { TranscriptionLocalFileMetadata } from "@/stores/services/use-transcription-store"
import { AudioPreview } from "./audio-preview"

interface TranscriptionUploadTabProps {
  file: File | null | undefined
  audioUrl: string | null | undefined
  localFileMetadata: TranscriptionLocalFileMetadata | undefined
  mediaPreparation: { sourceFileName: string; progress: MediaPreparationProgress } | null
  isUploading: boolean
  isGlobalMaxDurationExceeded: boolean
  uploadProgress: { percentage: number } | null | undefined
  session: unknown
  fileInputRef: RefObject<HTMLInputElement | null>
  onDragAndDropClick: () => void
  onDropFiles: (files: FileList) => void
  onRemoveFile: () => void
  onCancelPreparation: () => void
  onUploadSelectedFile: () => void
}

export function TranscriptionUploadTab({
  file,
  audioUrl,
  localFileMetadata,
  mediaPreparation,
  isUploading,
  isGlobalMaxDurationExceeded,
  uploadProgress,
  session,
  fileInputRef,
  onDragAndDropClick,
  onDropFiles,
  onRemoveFile,
  onCancelPreparation,
  onUploadSelectedFile,
}: TranscriptionUploadTabProps) {
  const [isPreviewUnavailable, setIsPreviewUnavailable] = useState(false)

  useEffect(() => {
    setIsPreviewUnavailable(false)
  }, [audioUrl])

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">Upload audio or video</h2>

      {!file && !mediaPreparation && (
        <DragAndDrop
          onDropFiles={onDropFiles}
          disabled={isUploading || Boolean(mediaPreparation)}
          className="rounded-lg"
        >
          <div
            onClick={onDragAndDropClick}
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm mb-1">Click to upload or drag and drop</p>
            <p className="text-muted-foreground text-xs">
              AAC, FLAC, MP3, MP4, MKV, and more (max {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)
            </p>
          </div>
        </DragAndDrop>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={TRANSCRIPTION_FILE_ACCEPT}
        disabled={isUploading || Boolean(mediaPreparation)}
        onChange={(e) => {
          if (e.target.files) {
            onDropFiles(e.target.files)
          }
        }}
        className="hidden"
      />

      {mediaPreparation && (
        <Card size="sm">
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin text-sidebar-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{mediaPreparation.sourceFileName}</p>
                <p className="text-xs text-muted-foreground">
                  {mediaPreparation.progress.stage === "inspecting"
                    ? "Inspecting media…"
                    : `Extracting audio${mediaPreparation.progress.percentage === null ? "…" : ` • ${mediaPreparation.progress.percentage.toFixed(0)}%`}`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onCancelPreparation}>Cancel</Button>
            </div>
            {mediaPreparation.progress.stage === "extracting" && mediaPreparation.progress.percentage !== null && (
              <Progress value={mediaPreparation.progress.percentage} />
            )}
          </CardContent>
        </Card>
      )}

      {file && !mediaPreparation && (
        <div className="flex flex-col gap-3">
          <Card size="sm">
            <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <FileAudio2 className="size-4 text-sidebar-primary" />
              </div>
              <div className="flex-1 line-clamp-3 text-sm">{file.name}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveFile}
                disabled={isUploading}
              >
                <X />
              </Button>
            </div>

            {audioUrl && !isPreviewUnavailable && (
              <AudioPreview src={audioUrl} onError={() => setIsPreviewUnavailable(true)} />
            )}
            {isPreviewUnavailable && (
              <p className="text-xs text-muted-foreground">Preview unavailable; the file can still be uploaded.</p>
            )}

            <div className="text-xs text-muted-foreground flex flex-col">
              <p>
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
              </p>
              {localFileMetadata?.wasExtracted && (
                <p>
                  Extracted from &quot;{localFileMetadata.originalFileName}&quot; • {localFileMetadata.codec?.toUpperCase() ?? "Unknown codec"} • No re-encoding
                </p>
              )}
              {localFileMetadata?.isPrepared && file.size > MAX_FILE_SIZE &&
                <p className="text-destructive">File size exceeds {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB</p>}
            </div>
            </CardContent>
          </Card>
          {localFileMetadata?.isPrepared && isGlobalMaxDurationExceeded ? (
            <div className="flex items-center gap-2 text-destructive text-xs">
              <div className="size-3">
                <Clock className="size-3" />
              </div>
              <p>
                Audio duration exceeds {(GLOBAL_MAX_DURATION_SECONDS / 60)} minutes limit.
                Please reduce duration or select other model.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3">
                <Clock className="size-3" />
              </div>
              <p>
                Please check maximum duration limit for selected model.
              </p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={onUploadSelectedFile}
            disabled={isUploading || Boolean(mediaPreparation) || !session || isGlobalMaxDurationExceeded}
            className="w-full border-primary/25 hover:border-primary/50"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload Selected File {uploadProgress && `(${uploadProgress.percentage}%)`}
          </Button>
        </div>
      )}
      </CardContent>
    </Card>
  )
}
