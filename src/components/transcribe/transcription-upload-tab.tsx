"use client"

import { type RefObject } from "react"
import { Button } from "@/components/ui/button"
import {
  File,
  Loader2,
  Clock,
  Upload,
  X,
} from "lucide-react"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { MAX_FILE_SIZE, GLOBAL_MAX_DURATION_SECONDS } from "@/constants/transcription"

interface TranscriptionUploadTabProps {
  file: File | null | undefined
  audioUrl: string | null | undefined
  isUploading: boolean
  isGlobalMaxDurationExceeded: boolean
  uploadProgress: { percentage: number } | null | undefined
  session: unknown
  fileInputRef: RefObject<HTMLInputElement | null>
  onDragAndDropClick: () => void
  onDropFiles: (files: FileList) => void
  onRemoveFile: () => void
  onUploadSelectedFile: () => void
}

export function TranscriptionUploadTab({
  file,
  audioUrl,
  isUploading,
  isGlobalMaxDurationExceeded,
  uploadProgress,
  session,
  fileInputRef,
  onDragAndDropClick,
  onDropFiles,
  onRemoveFile,
  onUploadSelectedFile,
}: TranscriptionUploadTabProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-medium">Upload Audio</h2>

      {!file && (
        <DragAndDrop
          onDropFiles={onDropFiles}
          disabled={isUploading}
          className="rounded-lg"
        >
          <div
            onClick={onDragAndDropClick}
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm mb-1">Click to upload or drag and drop</p>
            <p className="text-muted-foreground text-xs">AAC, FLAC, MP3, and more (max {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)</p>
          </div>
        </DragAndDrop>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".aac,audio/wav,audio/mp3,audio/aiff,audio/ogg,audio/flac"
        onChange={(e) => {
          if (e.target.files) {
            onDropFiles(e.target.files)
          }
        }}
        className="hidden"
      />

      {file && (
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <File className="h-6 w-6 text-blue-500 mr-2" />
              <div className="flex-1 line-clamp-3 text-sm">{file.name}</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {audioUrl && <audio controls className="w-full h-10 mb-2" src={audioUrl} />}

            <div className="text-xs text-muted-foreground flex flex-col">
              <p>
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
              </p>
              {file.size > MAX_FILE_SIZE &&
                <p className="text-red-500">File size exceeds {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB</p>}
            </div>
          </div>
          {isGlobalMaxDurationExceeded ? (
            <div className="flex items-center gap-2 text-red-600 text-xs">
              <div className="h-3 w-3">
                <Clock className="h-3 w-3" />
              </div>
              <p>
                Audio duration exceeds {(GLOBAL_MAX_DURATION_SECONDS / 60)} minutes limit.
                Please reduce duration or select other model.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3">
                <Clock className="h-3 w-3" />
              </div>
              <p>
                Please check maximum duration limit for selected model.
              </p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={onUploadSelectedFile}
            disabled={isUploading || !session || (isGlobalMaxDurationExceeded)}
            className="w-full border-primary/25 hover:border-primary/50"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Selected File {uploadProgress && `(${uploadProgress.percentage}%)`}
          </Button>
        </div>
      )}
    </div>
  )
}
