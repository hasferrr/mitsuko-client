"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getTranscriptionLogResult } from "@/lib/api/transcription-log"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AiStreamOutput } from "@/components/ai-stream/ai-stream-output"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  CircleDollarSign,
  Download,
  FileAudio2,
  FolderPlus,
} from "lucide-react"
import { TranscriptionLogItem } from "@/types/transcription-log"
import { getContent, parseTranscription, parseTranscriptionWordsAndSegments } from "@/lib/parser/parser"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { toast } from "sonner"
import { cn, createUtf8SubtitleBlob } from "@/lib/utils"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Project, TranscriptionModel } from "@/types/project"

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

  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const projects = useProjectStore(state => state.projects)
  const hasLoadedProjects = useProjectStore(state => state.hasLoaded)
  const loadingProjects = useProjectStore(state => state.loading)
  const loadProjects = useProjectStore(state => state.loadProjects)

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

      const blob = createUtf8SubtitleBlob(srtContent, "srt")
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

  const handleOpenApplyDialog = async () => {
    if (!data?.result) {
      toast.error("No transcription result to apply")
      return
    }

    if (!hasLoadedProjects && !loadingProjects) {
      try {
        await loadProjects()
      } catch {
      }
    }

    setIsApplyDialogOpen(true)
  }

  const handleApplyToProject = async (projectId: string) => {
    if (!data?.result || !log) {
      toast.error("No transcription result to apply")
      return
    }

    try {
      setIsApplying(true)

      const raw = data.result
      const cleaned = getContent(raw)
      const transcriptSubtitles = parseTranscription(raw)
      const { words, segments } = parseTranscriptionWordsAndSegments(raw)

      const title = log.metadata.originalname || "Transcription"
      const transcriptionStore = useTranscriptionDataStore.getState()
      await transcriptionStore.createTranscriptionDb(projectId, {
        title,
        transcriptionText: cleaned,
        transcriptSubtitles,
        models: log.reqModels as TranscriptionModel,
        words,
        segments,
      })

      toast.success("Transcription applied to project")
      setIsApplyDialogOpen(false)
      await loadProjects()
    } catch (error) {
      console.error("Failed to apply transcription to project:", error)
      toast.error("Failed to apply transcription to project")
    } finally {
      setIsApplying(false)
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
            <>
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="h-full min-h-96 w-full rounded-lg border bg-muted/10 p-3 space-y-2">
                {Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className={cn("h-4", {
                      "w-3/4": index % 4 === 3,
                      "w-5/6": index % 3 === 2,
                      "w-full": index % 4 !== 3 && index % 3 !== 2
                    })}
                  />
                ))}
              </div>
            </>
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenApplyDialog}
                      className="h-8"
                    >
                      <FolderPlus className="h-3 w-3" /> Apply to project
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportSRT} className="h-8">
                      <Download className="h-3 w-3" /> Export SRT
                    </Button>
                  </div>
                )}
              </div>

              {data?.result ? (
                <div className="max-h-[60vh] min-h-64 overflow-y-auto rounded-md border p-3 pr-2 bg-background dark:bg-muted/30">
                  <AiStreamOutput
                    content={data.result}
                    isProcessing={false}
                    defaultCollapsed={true}
                  />
                </div>
              ) : (
                <p className="h-full py-16 rounded-lg border bg-muted/10 text-muted-foreground text-center">
                  This transcription result is empty
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>

      <ApplyToProjectDialog
        open={isApplyDialogOpen}
        onOpenChange={setIsApplyDialogOpen}
        projects={projects}
        isProcessing={isApplying}
        onApply={handleApplyToProject}
      />
    </Dialog>
  )
}

interface ApplyToProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  isProcessing: boolean
  onApply: (projectId: string) => void | Promise<void>
}

function ApplyToProjectDialog({ open, onOpenChange, projects, isProcessing, onApply }: ApplyToProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to Project</DialogTitle>
          <DialogDescription>
            Select a project to add this transcription result
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No projects available. Create a project first.
              </p>
            ) : (
              projects
                .sort((project) => project.isBatch ? 1 : -1)
                .map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start"
                    disabled={isProcessing}
                    onClick={() => onApply(project.id)}
                  >
                    {project.name}
                    {project.isBatch && (
                      <Badge className="ml-2 h-5 px-2">Batch</Badge>
                    )}
                  </Button>
                ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
