"use client"

import { useQuery } from "@tanstack/react-query"
import { getTranscriptionLogResult } from "@/lib/api/transcription-log"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  CircleDollarSign,
  Download,
  FileAudio2,
  Loader2,
} from "lucide-react"
import { TranscriptionLogItem } from "@/types/transcription-log"
import { parseTranscription } from "@/lib/parser/parser"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { toast } from "sonner"

interface LogResultDialogProps {
  log: TranscriptionLogItem | null
  onOpenChange: (open: boolean) => void
}

export default function LogResultDialog({ log, onOpenChange }: LogResultDialogProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["transcriptionLogResult", log?._id],
    queryFn: () => getTranscriptionLogResult(log!._id),
    enabled: !!log?._id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleExportSRT = () => {
    if (!data?.result) return

    try {
      const subtitles = parseTranscription(data.result)
      if (!subtitles.length) {
        toast.info("No subtitles found in transcription result")
        return
      }

      const srtContent = mergeSubtitle({
        subtitles,
        parsed: {
          type: "srt",
          data: null,
        },
      })
      if (!srtContent) {
        toast.error("Failed to generate SRT content")
        return
      }

      let fileName = log?.metadata.originalname || "transcription"
      if (fileName) {
        // Remove existing extension and add .srt
        fileName = fileName.replace(/\.[^/.]+$/, "") + ".srt"
      } else {
        fileName = "transcription.srt"
      }

      const blob = new Blob([srtContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`SRT file exported successfully: ${fileName}`)
    } catch (error) {
      console.error("Failed to export SRT:", error)
      toast.error(
        <div className="select-none">
          <div>Export Error! Please check the transcription format:</div>
          <div className="font-mono mt-1">
            <div>hh:mm:ss,ms {"-->"} hh:mm:ss,ms</div>
            <div>or</div>
            <div>mm:ss,ms {"-->"} mm:ss,ms</div>
            <div>transcription text</div>
          </div>
        </div>
      )
    }
  }

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col">
        <DialogHeader className="pb-2">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-semibold truncate">
              {log?.metadata.originalname || "Transcription Result"}
            </DialogTitle>
            {log && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-1">
                  <div className="h-3 w-3">
                    <Calendar className="h-3 w-3" />
                  </div>
                  {formatDate(log.createdAt)}
                </div>
                <div className="inline-flex items-center gap-1">
                  <div className="h-3 w-3">
                    <CircleDollarSign className="h-3 w-3" />
                  </div>
                  {log.creditsConsumed !== undefined
                    ? log.creditsConsumed.toLocaleString()
                    : 'N/A'}
                  {' '}
                  credits
                </div>
                <div className="inline-flex items-center gap-1">
                  <div className="h-3 w-3">
                    <FileAudio2 className="h-3 w-3" />
                  </div>
                  {log.metadata.mimetype}
                </div>
                <Badge variant="secondary">{log.reqModels}</Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <h3 className="font-medium mb-2">Processing transcription</h3>
              <p className="text-sm text-muted-foreground">Please wait while we fetch the result...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <FileAudio2 className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-medium mb-2 text-destructive">Failed to load result</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                There was an error loading the transcription result. Please try again later.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Transcription Result</h4>
                {data?.result && (
                  <Button variant="outline" size="sm" onClick={handleExportSRT} className="h-8">
                    <Download className="h-3 w-3" /> Export SRT
                  </Button>
                )}
              </div>

              {data?.result ? (
                <Textarea
                  value={data.result}
                  readOnly
                  className="h-full min-h-96 resize-none overflow-y-auto"
                  placeholder="No transcription result available"
                />
              ) : (
                <p className="h-full py-16 rounded-lg border bg-muted/10 text-muted-foreground text-center">
                  This transcription result is empty
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
