"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { cn, createUtf8SubtitleBlob } from "@/lib/utils"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Play,
  Loader2,
  Square,
  CheckSquare,
  ListChecks,
  AlertTriangle,
  Trash,
  Upload,
  FolderOpen,
  AudioLines,
  Download,
  FastForward,
} from "lucide-react"
import JSZip from "jszip"
import { DownloadSection } from "@/components/download-section"
import { arrayMove } from "@dnd-kit/sortable"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ManageUploadsDialog } from "./manage-uploads-dialog"
import { TranscriptionMain } from "@/components/transcribe/transcription-main"
import { SettingsTranscription } from "@/components/transcribe/settings-transcription"
import { WhisperSettingsPanel } from "@/components/transcribe/whisper-settings-panel"
import { useBatchTranscriptionFiles } from "@/hooks/batch/use-batch-transcription-files"
import useBatchTranscriptionHandler from "@/hooks/batch/use-batch-transcription-handler"
import { BatchTranscriptionFileList } from "./batch-transcription-file-list"
import { useBatchSelection } from "@/hooks/batch/use-batch-selection"
import { CopyTranscriptionSettingsDialog } from "./copy-transcription-settings-dialog"
import { useWhisperSettingsStore } from "@/stores/use-whisper-settings-store"
import { generateWordsSubtitles, generateSegmentsTranscription } from "@/lib/transcription-segments"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"

interface BatchTranscriptionViewProps {
  defaultTranscriptionId: string
}

export function BatchTranscriptionView({ defaultTranscriptionId }: BatchTranscriptionViewProps) {
  const [activeTab, setActiveTab] = useState("settings")

  const [previewId, setPreviewId] = useState<string | null>(null)
  const [queueSet, setQueueSet] = useState<Set<string>>(new Set())
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [isManageFilesDialogOpen, setIsManageFilesDialogOpen] = useState(false)

  // Dialogs
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false)
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false)
  const [isCopySettingsDialogOpen, setIsCopySettingsDialogOpen] = useState(false)
  const [isApplyWhisperDialogOpen, setIsApplyWhisperDialogOpen] = useState(false)
  const [transcribedStats, setTranscribedStats] = useState({ transcribed: 0, total: 0 })

  // Download options
  const [downloadOption, setDownloadOption] = useState<"original" | "translated" | "combined">("original")
  const [combinedFormat, setCombinedFormat] = useState<"(o)-t" | "(t)-o" | "o-n-t" | "t-n-o" | "{o}-t">("o-n-t")

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)
  const createTranscriptionForBatch = useProjectStore((state) => state.createTranscriptionForBatch)
  const removeTranscriptionFromBatch = useProjectStore((state) => state.removeTranscriptionFromBatch)

  const [localOrder, setLocalOrder] = useState<string[]>(currentProject?.transcriptions ?? [])

  useEffect(() => {
    setLocalOrder(currentProject?.transcriptions ?? [])
  }, [currentProject?.transcriptions])

  // Settings Stores
  const isUseSharedSettings = useBatchSettingsStore(state => state.getIsUseSharedSettings(currentProject?.id))
  const setUseSharedSettings = useBatchSettingsStore(state => state.setUseSharedSettings)
  const isDeleteAfterTranscription = useLocalSettingsStore(state => state.isDeleteAfterTranscription)
  const setDeleteAfterTranscription = useLocalSettingsStore(state => state.setIsDeleteAfterTranscription)

  // Transcription Data Store
  const transcriptionData = useTranscriptionDataStore((state) => state.data)
  const loadTranscription = useTranscriptionDataStore((state) => state.getTranscriptionDb)

  const setCurrentTranscriptionId = useTranscriptionDataStore((state) => state.setCurrentId)
  const saveTranscriptionData = useTranscriptionDataStore((state) => state.saveData)
  const setTranscriptionText = useTranscriptionDataStore((state) => state.setTranscriptionText)
  const setTranscriptSubtitles = useTranscriptionDataStore((state) => state.setTranscriptSubtitles)
  const getWords = useTranscriptionDataStore((state) => state.getWords)
  const getSegments = useTranscriptionDataStore((state) => state.getSegments)

  // Transcription Store
  const setFileAndUrl = useTranscriptionStore((state) => state.setFileAndUrl)

  const session = useSessionStore((state) => state.session)

  // Files hooks
  const {
    batchFiles,
    finishedCount,
    isBatchTranscribing: isProcessing,
  } = useBatchTranscriptionFiles(
    localOrder,
    queueSet
  )

  // Selection Hook
  const {
    isSelecting,
    selectedIds,
    isDeleteSelectedDialogOpen,
    setIsDeleteSelectedDialogOpen,
    toggleSelectMode,
    handleSelectToggle,
    handleDeleteSelected,
    handleSelectAllToggle
  } = useBatchSelection({ batchFiles, operationMode: 'transcription' })

  // Transcription Handler Hook
  const {
    handleStartBatchTranscription,
    handleContinueBatchTranscription,
    handleStopBatchTranscription,
  } = useBatchTranscriptionHandler({
    defaultTranscriptionId,
    batchFiles,
    isBatchTranscribing: isProcessing,
    state: {
      setQueueSet,
    },
  })

  // Handlers
  const handleFileDrop = async (droppedFiles: FileList | File[]) => {
    if (!droppedFiles || !currentProject || !currentProject.isBatch) return
    const filesArray = 'item' in droppedFiles ? Array.from(droppedFiles) : droppedFiles

    for await (const file of filesArray) {
      // Check if it's an audio file
      const isAudioFile = file.type.startsWith("audio/") ||
        [".mp3", ".wav", ".flac", ".m4a", ".ogg", ".webm", ".aac"].some(ext =>
          file.name.toLowerCase().endsWith(ext)
        )

      if (!isAudioFile) {
        toast.error(`Unsupported file type: ${file.name}`)
        continue
      }

      try {
        const transcription = await createTranscriptionForBatch(currentProject.id, file.name)
        // Store the local file in the transcription store
        setFileAndUrl(transcription.id, file)
        await loadTranscription(transcription.id)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        toast.error(`Failed to add ${file.name} to batch`)
      }
    }
  }

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event
    if (!over || !currentProject) return
    if (active.id === over.id) return

    const ids = currentProject.transcriptions
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(localOrder, oldIndex, newIndex)
    setLocalOrder(newOrder)
    updateProjectItems(currentProject.id, newOrder, 'transcriptions')
  }

  const handleSingleFileDownload = (batchFileId: string) => {
    const transcription = transcriptionData[batchFileId]
    if (!transcription) return

    const subtitles = transcription.transcriptSubtitles
    if (!subtitles || subtitles.length === 0) return

    const srtContent = mergeSubtitle({
      subtitles,
      parsed: {
        type: "srt",
        data: null,
      },
    })
    if (!srtContent) return

    const fileName = transcription.title
      ? transcription.title.replace(/\.[^/.]+$/, "") + ".srt"
      : "transcription.srt"

    const blob = createUtf8SubtitleBlob(srtContent, "srt")

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateZip = async (): Promise<Blob> => {
    const zip = new JSZip()
    const nameCountMap = new Map<string, number>()

    for (const batchFile of batchFiles) {
      const transcription = transcriptionData[batchFile.id]
      if (!transcription) continue

      const subtitles = transcription.transcriptSubtitles
      if (!subtitles || subtitles.length === 0) continue

      const srtContent = mergeSubtitle({
        subtitles,
        parsed: {
          type: "srt",
          data: null,
        },
      })
      if (!srtContent) continue

      const baseTitle = transcription.title || 'transcription'
      const dotIdx = baseTitle.lastIndexOf('.')
      const baseName = dotIdx > 0 ? baseTitle.slice(0, dotIdx) : baseTitle
      const ext = 'srt'

      const fileKey = `${baseName}.${ext}`
      const currentCount = nameCountMap.get(fileKey) ?? 0
      const newCount = currentCount + 1
      nameCountMap.set(fileKey, newCount)

      const uniqueFileName = newCount === 1
        ? fileKey
        : `${baseName} (${newCount}).${ext}`

      const fileContent = "\ufeff" + srtContent
      zip.file(uniqueFileName, fileContent)
    }
    return await zip.generateAsync({ type: "blob" })
  }

  const handlePreview = async (id: string) => {
    setCurrentTranscriptionId(id)
    setPreviewId(id)
  }

  const handlePreviewDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewId(null)
      if (previewId) saveTranscriptionData(previewId)
    }
  }

  const confirmDeleteFile = async () => {
    if (!currentProject || !deleteFileId) return
    try {
      await removeTranscriptionFromBatch(currentProject.id, deleteFileId)
      setDeleteFileId(null)
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const handleToggleDeleteAfter = (transcriptionId: string, checked: boolean) => {
    // Global setting - no per-transcription preference
    setDeleteAfterTranscription(checked)
  }

  const handleApplyWhisperToAll = async () => {
    const { subtitleLevel, maxSilenceGap, targetCps, maxCps, maxChars, minDuration } = useWhisperSettingsStore.getState()
    let appliedCount = 0

    for (const file of batchFiles) {
      const words = getWords(file.id)
      const segments = getSegments(file.id)

      if (words.length === 0 && segments.length === 0) continue

      let srtContent = ""

      if (subtitleLevel === "words" && words.length > 0 && segments.length > 0) {
        srtContent = generateWordsSubtitles(
          { words, segments },
          {
            MAX_SILENCE_GAP: maxSilenceGap,
            TARGET_CPS: targetCps,
            MAX_CPS: maxCps,
            MAX_CHARS: maxChars,
            MIN_DURATION: minDuration,
          },
        )
      } else if (segments.length > 0) {
        srtContent = generateSegmentsTranscription(segments)
      }

      if (srtContent.trim()) {
        const { subtitles } = parseSubtitle({ content: srtContent, type: "srt" })
        setTranscriptionText(file.id, srtContent)
        setTranscriptSubtitles(file.id, subtitles)
        await saveTranscriptionData(file.id)
        appliedCount += 1
      }
    }

    if (appliedCount > 0) {
      toast.success(`Applied Whisper subtitles to ${appliedCount} file${appliedCount === 1 ? '' : 's'}`)
    } else {
      toast.info("No files with Whisper data found")
    }
  }

  const handleOpenStartBatchDialog = () => {
    if (batchFiles.length === 0 || isProcessing) return

    let totalFiles = 0
    let transcribedFiles = 0

    batchFiles.forEach(file => {
      totalFiles += 1
      if (file.status === 'done') {
        transcribedFiles += 1
      }
    })

    if (transcribedFiles > 0) {
      setTranscribedStats({ transcribed: transcribedFiles, total: totalFiles })
      setIsRestartDialogOpen(true)
    } else {
      setTranscribedStats({ transcribed: 0, total: totalFiles })
      setIsStartDialogOpen(true)
    }
  }

  const uploadInputId = "batch-transcription-file-upload-input"

  const getManageFilesData = () => {
    return localOrder.map(id => {
      const transcription = transcriptionData[id]
      return {
        id,
        title: transcription?.title || "Untitled",
        uploadId: transcription?.selectedUploadId || null,
      }
    })
  }

  return (
    <div className="grid md:grid-cols-[1fr_402px] gap-6">
      {/* Left Column - Files */}
      <div className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center gap-2 px-2">
          {!isSelecting && (
            <div className="text-sm mr-auto">Finished: {finishedCount} / {batchFiles.length}</div>
          )}
          {isSelecting && (
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-sm">Selected: {selectedIds.size} / {batchFiles.length}</span>
            </div>
          )}
          {isSelecting && (
            <>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={() => setIsDeleteSelectedDialogOpen(true)}
                disabled={selectedIds.size === 0}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={handleSelectAllToggle}
                disabled={batchFiles.length === 0}
              >
                <ListChecks className="h-4 w-4" />
                {selectedIds.size === batchFiles.length ? 'Deselect All' : 'Select All'}
              </Button>
            </>
          )}
          {!isSelecting && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => setIsManageFilesDialogOpen(true)}
              disabled={isProcessing}
            >
              <FolderOpen className="h-4 w-4" />
              Manage Files
            </Button>
          )}
          {!isSelecting && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => document.getElementById(uploadInputId)?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg"
            onClick={toggleSelectMode}
            disabled={isProcessing || batchFiles.length === 0}
          >
            <CheckSquare className="h-4 w-4" />
            {isSelecting ? 'Cancel' : 'Select'}
          </Button>
        </div>

        <BatchTranscriptionFileList
          files={batchFiles}
          order={localOrder}
          isProcessing={isProcessing}
          selectMode={isSelecting}
          selectedIds={selectedIds}
          onDrop={handleFileDrop}
          onDragEnd={handleDragEnd}
          onDelete={setDeleteFileId}
          onDownload={handleSingleFileDownload}
          onClick={handlePreview}
          onSelectToggle={handleSelectToggle}
          uploadInputId={uploadInputId}
        />

        <div className="flex flex-wrap items-center gap-4 w-full">
          <Button
            className="h-10 flex-1"
            onClick={handleOpenStartBatchDialog}
            disabled={isProcessing || !session || batchFiles.length === 0 || isSelecting}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transcribing...
              </>
            ) : (
              <>
                <AudioLines className="h-4 w-4" />
                {session ? `Transcribe ${batchFiles.length} files` : "Sign In to Start"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={handleStopBatchTranscription}
            disabled={!isProcessing}
          >
            <Square className="h-4 w-4" />
            Stop All
          </Button>
        </div>

        <Button
          variant="outline"
          className="h-10 w-full border-primary/25 hover:border-primary/50"
          onClick={() => setIsContinueDialogOpen(true)}
          disabled={isProcessing || !session || batchFiles.length === 0 || (batchFiles.length - finishedCount <= 0) || isSelecting}
        >
          <FastForward className="h-4 w-4" />
          Continue Batch Transcription ({batchFiles.length - finishedCount} remaining)
        </Button>

        <DownloadSection
          generateContent={handleGenerateZip}
          fileName={`${currentProject?.name}_transcription.zip`}
          type="zip"
          downloadOption={downloadOption}
          setDownloadOption={setDownloadOption}
          noChangeOption={true}
          showSelectors={false}
          combinedFormat={combinedFormat}
          setCombinedFormat={setCombinedFormat}
          toType="no-change"
          setToType={() => {}}
        />
      </div>

      {/* Right Column - Settings */}
      <div className="flex flex-col h-full">
        <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="whisper">Whisper</TabsTrigger>
          </TabsList>

          {/* Batch Settings */}
          <div className="space-y-4 w-full p-4 mt-4 rounded-xl border border-input bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="shared-settings-switch" className="flex flex-col">
                <span className="text-sm font-semibold">Settings Mode</span>
                <span className="text-xs text-muted-foreground">
                  {isUseSharedSettings ? "Using shared batch settings" : "Individual file settings"}
                </span>
              </label>
              <Switch
                id="shared-settings-switch"
                checked={isUseSharedSettings}
                onCheckedChange={(checked) => setUseSharedSettings(currentProject?.id ?? "", checked)}
                disabled={isProcessing}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="delete-after-switch" className="flex flex-col">
                <span className="text-sm font-semibold">Delete After Transcription</span>
                <span className="text-xs text-muted-foreground">
                  Automatically delete uploaded files after completion
                </span>
              </label>
              <Switch
                id="delete-after-switch"
                checked={isDeleteAfterTranscription}
                onCheckedChange={(checked) => setDeleteAfterTranscription(checked)}
                disabled={isProcessing}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={() => setIsCopySettingsDialogOpen(true)}
                disabled={isProcessing || batchFiles.length === 0}
              >
                <ListChecks className="h-4 w-4" />
                Copy Shared Settings...
              </Button>
            </div>
          </div>

          <TabsContent value="settings" className="flex-grow space-y-4 mt-4">
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className={cn("p-4 space-y-4", !isUseSharedSettings && "pointer-events-none opacity-50")}>
                <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                <SettingsTranscription transcriptionId={defaultTranscriptionId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whisper" className="flex-grow mt-4">
            <WhisperSettingsPanel
              showApplyButton
              onApplyClick={() => setIsApplyWhisperDialogOpen(true)}
              applyDisabled={isProcessing}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Manage Files Dialog */}
      <ManageUploadsDialog
        open={isManageFilesDialogOpen}
        onOpenChange={setIsManageFilesDialogOpen}
      />

      <CopyTranscriptionSettingsDialog
        open={isCopySettingsDialogOpen}
        onOpenChange={setIsCopySettingsDialogOpen}
        batchFiles={batchFiles}
        defaultTranscriptionId={defaultTranscriptionId}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteFileId} onOpenChange={(open) => !open && setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this file from the batch?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFileId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Dialog */}
      <AlertDialog open={isDeleteSelectedDialogOpen} onOpenChange={setIsDeleteSelectedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Files</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete ${selectedIds.size} selected file${selectedIds.size === 1 ? "" : "s"}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteSelectedDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleDeleteSelected(); setIsDeleteSelectedDialogOpen(false) }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Dialog */}
      <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Start Batch Transcription
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <span className="block">Start transcribing <strong>{batchFiles.length}</strong> files?</span>
                {isUseSharedSettings ? (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                    <span className="block font-semibold">Shared Settings:</span>
                    <ul className="list-disc list-inside">
                      <li>Sequential processing (1 file at a time)</li>
                      <li>{isDeleteAfterTranscription ? "Files will be deleted after transcription" : "Files will be kept after transcription"}</li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                    <span className="block font-semibold">Individual Settings:</span>
                    Each file uses its own settings.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsStartDialogOpen(false); handleStartBatchTranscription() }}>Start Transcription</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restart Dialog */}
      <AlertDialog open={isRestartDialogOpen} onOpenChange={setIsRestartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Already Transcribed Content
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block mb-2">
                You have already transcribed <strong>{transcribedStats.transcribed}</strong> of <strong>{transcribedStats.total}</strong> files.
              </span>
              <span className="block">Are you sure you want to transcribe from the beginning?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsRestartDialogOpen(false); handleStartBatchTranscription() }}>Restart Transcription</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Continue Dialog */}
      <AlertDialog open={isContinueDialogOpen} onOpenChange={setIsContinueDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FastForward className="h-5 w-5 text-primary" />
              Continue Batch Transcription
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block">Continue transcribing <strong>{batchFiles.length - finishedCount}</strong> remaining files?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsContinueDialogOpen(false); handleContinueBatchTranscription() }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Apply Whisper Dialog */}
      <AlertDialog open={isApplyWhisperDialogOpen} onOpenChange={setIsApplyWhisperDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Apply Whisper Subtitles
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will apply Whisper subtitles to all files with Whisper data. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsApplyWhisperDialogOpen(false); handleApplyWhisperToAll() }}>Apply</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={handlePreviewDialogOpenChange}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transcription Preview</DialogTitle>
          </DialogHeader>
          {previewId && transcriptionData[previewId] && (
            <TranscriptionMain
              currentId={previewId}
              settingsId={isUseSharedSettings ? defaultTranscriptionId : undefined}
              isSharedSettings={isUseSharedSettings}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
