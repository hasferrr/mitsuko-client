"use client"

import { useState, useRef, type ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useUploadStore } from "@/stores/ui/use-upload-store"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { toast } from "sonner"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { parseTranscription } from "@/lib/parser/parser"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { listUploads, deleteUpload } from "@/lib/api/uploads"
import { UploadFileMeta } from "@/types/uploads"
import { Input } from "@/components/ui/input"
import { uploadFile } from "@/lib/api/file-upload"
import { MAX_FILE_SIZE, GLOBAL_MAX_DURATION_SECONDS, isAsrModel } from "@/constants/transcription"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { SubtitleTranslated } from "@/types/subtitles"
import { useRouter } from "next/navigation"
import { cn, createUtf8SubtitleBlob } from "@/lib/utils"
import { useLocalSettingsStore } from "@/stores/settings/use-local-settings-store"
import { generateWordsSubtitles, generateSegmentsTranscription } from "@/lib/transcription/subtitle-generator"
import { useTranscriptionHandler } from "@/hooks/handler/use-transcription-handler"
import { useWhisperSettingsStore } from "@/stores/settings/use-whisper-settings-store"
import { WhisperSettingsPanel } from "./whisper-settings-panel"
import { TranscriptionHistoryDialog } from "./transcription-history-dialog"
import { TranscriptionUploadTab } from "./transcription-upload-tab"
import { TranscriptionSelectTab } from "./transcription-select-tab"
import { TranscriptionControls } from "./transcription-controls"
import { TranscriptionResultPanel } from "./transcription-result-panel"
import { TranscriptionNextActions } from "./transcription-next-actions"

interface TranscriptionMainProps {
  currentId: string
  settingsId?: string
  isSharedSettings?: boolean
  hideBackButton?: boolean
}

export function TranscriptionMain({ currentId, settingsId, isSharedSettings, hideBackButton }: TranscriptionMainProps) {
  const title = useTranscriptionDataStore(state => state.getTitle(currentId))
  const transcriptionText = useTranscriptionDataStore(state => state.getTranscriptionText(currentId))
  const transcriptSubtitles = useTranscriptionDataStore(state => state.getTranscriptSubtitles(currentId))
  const models = useTranscriptionDataStore(state => state.getModels(settingsId ?? currentId))
  const words = useTranscriptionDataStore(state => state.getWords(currentId))
  const segments = useTranscriptionDataStore(state => state.getSegments(currentId))
  const selectedUploadId = useTranscriptionDataStore(state => state.getSelectedUploadId(currentId))
  const setTitle = useTranscriptionDataStore(state => state.setTitle)
  const setTranscriptionText = useTranscriptionDataStore(state => state.setTranscriptionText)
  const setTranscriptSubtitles = useTranscriptionDataStore(state => state.setTranscriptSubtitles)
  const setSelectedUploadId = useTranscriptionDataStore(state => state.setSelectedUploadId)
  const saveData = useTranscriptionDataStore(state => state.saveData)

  const file = useTranscriptionStore((state) => state.files[currentId])
  const audioUrl = useTranscriptionStore((state) => state.audioUrls[currentId])
  const localAudioDuration = useTranscriptionStore((state) => state.fileDurations[currentId])
  const isTranscribingSet = useTranscriptionStore((state) => state.isTranscribingSet)
  const setFileAndUrl = useTranscriptionStore((state) => state.setFileAndUrl)
  const isTranscribing = isTranscribingSet.has(currentId)

  const upload = useUploadStore((state) => state.getUpload(currentId))
  const uploadProgress = upload?.progress
  const isUploading = useUploadStore((state) => state.getIsUploading(currentId))
  const setUpload = useUploadStore((state) => state.setUpload)
  const setIsUploading = useUploadStore((state) => state.setIsUploading)

  const createTranslationDb = useTranslationDataStore(state => state.createTranslationDb)
  const setTranslationCurrentId = useTranslationDataStore(state => state.setCurrentId)
  const currentProject = useProjectStore(state => state.currentProject)
  const loadProjects = useProjectStore(state => state.loadProjects)
  const session = useSessionStore((state) => state.session)
  const deleteAfterTranscription = useLocalSettingsStore(state => state.isDeleteAfterTranscription)
  const setDeleteAfterTranscription = useLocalSettingsStore(state => state.setIsDeleteAfterTranscription)

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
    enabled: !!session,
  })

  const { mutate: handleUpload } = useMutation({
    mutationFn: (file: File) => uploadFile(file, (progress) => setUpload(currentId, { progress, fileName: file.name }), localAudioDuration ?? 0),
    onMutate: () => {
      setIsUploading(currentId, true)
    },
    onSuccess: async (uploadId) => {
      toast.success("File uploaded successfully")
      queryClient.invalidateQueries({ queryKey: ["uploads"] })
      setUpload(currentId, null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      await setFileAndUrl(currentId, null)
      setActiveTab("select")
      if (uploadId) {
        setSelectedUploadId(currentId, uploadId)
        if (file) {
          setTitle(currentId, file.name)
        }
      }
    },
    onError: (err: Error) => {
      toast.error("Failed to upload file", { description: err.message })
      setUpload(currentId, null)
    },
    onSettled: () => setIsUploading(currentId, false),
  })

  const { mutate: deleteFile, isPending: isDeleting } = useMutation({
    mutationFn: (uploadId: string) => deleteUpload(uploadId),
    onSuccess: () => {
      toast.success("File deleted")
      queryClient.invalidateQueries({ queryKey: ["uploads"] })
      if (pendingDeleteId === selectedUploadId) {
        setSelectedUploadId(currentId, null)
      }
      setIsDeleteDialogOpen(false)
    },
    onError: (err: Error) => toast.error("Failed to delete", { description: err.message }),
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [rightTab, setRightTab] = useState<"transcript" | "subtitles">("transcript")
  const isGlobalMaxDurationExceeded = localAudioDuration > GLOBAL_MAX_DURATION_SECONDS

  const transcriptionAreaRef = useRef<HTMLTextAreaElement>(null)
  const transcriptionResultRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  useAutoScroll(transcriptionText, transcriptionAreaRef)
  useAutoScroll(transcriptionText, transcriptionResultRef)
  const { setHasChanges } = useUnsavedChanges()

  useEffect(() => {
    return () => {
      saveData(currentId)
    }
  }, [currentId, saveData])

  useEffect(() => {
    if (selectedUploadId) {
      setActiveTab("select")
    }
  }, [selectedUploadId])

  const {
    handleStart: handleStartTranscription,
    handleStop: handleStopTranscription,
  } = useTranscriptionHandler({
    state: {
      currentId,
      settingsId,
      selectedUploadId: activeTab === "select" ? selectedUploadId : null,
      setSelectedUploadId,
    },
    options: {
      refetchUploads,
    },
  })

  const handleTranscriptionTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTranscriptionText(currentId, e.target.value)
    setHasChanges(true)
  }

  const handleParse = async () => {
    try {
      const subtitles = parseTranscription(transcriptionText)
      setTranscriptSubtitles(currentId, subtitles)
      toast.success("Subtitles parsed successfully!")
    } catch {
      toast.error(
        <div className="select-none">
          <div>Parse Error! Please follow this format:</div>
          <div className="font-mono">
            <div>hh:mm:ss,ms {"-->"} hh:mm:ss,ms</div>
            <div>or</div>
            <div>mm:ss,ms {"-->"} mm:ss,ms</div>
            <div>transcription text</div>
          </div>
        </div>
      )
    }
    await saveData(currentId)
  }

  const handleApplyWhisperSubtitles = async () => {
    const { subtitleLevel, maxSilenceGap, targetCps, maxCps, maxChars, minDuration } = useWhisperSettingsStore.getState()
    let srtContent = ""

    if (subtitleLevel === "words") {
      if (!words.length || !segments.length) {
        toast.error("Whisper words or segments data not available", {
          description: "Please transcribe again with a Whisper model",
        })
        return
      }
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
    } else {
      if (!segments.length) {
        toast.error("Whisper segments data not available", {
          description: "Please transcribe again with a Whisper model",
        })
        return
      }
      srtContent = generateSegmentsTranscription(segments)
    }
    if (!srtContent.trim()) {
      toast.error("Failed to generate subtitles from words-level data")
      return
    }

    const { subtitles } = parseSubtitle({ content: srtContent, type: "srt" })
    setTranscriptionText(currentId, srtContent)
    setTranscriptSubtitles(currentId, subtitles)
    setHasChanges(true)
    await saveData(currentId)
    toast.success("Generated subtitles from Whisper word timings")
  }

  const handleExport = () => {
    if (!transcriptSubtitles.length) return

    const srtContent = mergeSubtitle({
      subtitles: transcriptSubtitles,
      parsed: {
        type: "srt",
        data: null,
      },
    })
    if (!srtContent) return

    let fileName = title.trim()
    if (fileName) {
      fileName = fileName.endsWith(".srt")
        ? fileName
        : fileName.slice(0, fileName.lastIndexOf(".")) + ".srt"
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
  }

  const handleIsEditing = () => {
    if (isEditing) {
      handleParse()
    }
    setIsEditing(!isEditing)
  }

  const handleClear = () => {
    setIsClearDialogOpen(true)
  }

  const handleConfirmClear = () => {
    setIsEditing(false)
    setTranscriptionText(currentId, "")
    setTranscriptSubtitles(currentId, [])
    setIsClearDialogOpen(false)
  }

  const handleDragAndDropClick = () => {
    setSelectedUploadId(currentId, null)
    fileInputRef.current?.click()
  }

  const handleDropFiles = (files: FileList) => {
    const selectedFile = files[0]
    if (!selectedFile) return
    if (!selectedFile.type.startsWith("audio/")) {
      toast.error("Invalid file type", { description: "Please select an audio file" })
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File too large", { description: "Please choose smaller file" })
      return
    }

    setTitle(currentId, selectedFile.name)
    setFileAndUrl(currentId, selectedFile)
  }

  const handleSelectUpload = (upload: UploadFileMeta) => {
    if (selectedUploadId === upload.uploadId) {
      setSelectedUploadId(currentId, null)
    } else {
      setSelectedUploadId(currentId, upload.uploadId)
      setTitle(currentId, upload.fileName)
    }
  }

  const handleUploadSelectedFile = () => {
    setSelectedUploadId(currentId, null)
    if (!file) return
    handleUpload(file)
  }

  const handleCreateTranslation = async () => {
    if (isTranscribing) return
    if (!transcriptSubtitles.length) {
      toast.error("No subtitles to translate")
      return
    }
    if (!currentProject) {
      toast.error("Project not found")
      return
    }

    try {
      const subtitles: SubtitleTranslated[] = transcriptSubtitles.map((sub) => ({
        ...sub,
        translated: "",
      }))

      const translation = await createTranslationDb(
        currentProject.id,
        {
          title,
          subtitles,
          parsed: { type: "srt", data: null },
        },
        undefined,
        undefined,
      )

      setTranslationCurrentId(translation.id)
      loadProjects()
      router.push("/translate")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create translation")
    }
  }

  return (
    <div translate="no" className="mx-auto pt-4 pb-8 px-4 max-w-5xl">
      <div className="mb-4 flex items-center gap-2">
        {!hideBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/project')}
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(currentId, e.target.value)}
          className="text-xl font-semibold h-12"
          placeholder="Enter title..."
        />
        <TranscriptionHistoryDialog currentId={currentId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] lg:grid-cols-[400px_1fr_1fr] gap-8">
        {/* Left Column - Upload & Controls */}
        <div className="md:col-span-1 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="upload" className="w-full">Upload</TabsTrigger>
              <TabsTrigger value="select" className="w-full">Select</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <TranscriptionUploadTab
                file={file}
                audioUrl={audioUrl}
                isUploading={isUploading}
                isGlobalMaxDurationExceeded={isGlobalMaxDurationExceeded}
                uploadProgress={uploadProgress}
                session={session}
                fileInputRef={fileInputRef}
                onDragAndDropClick={handleDragAndDropClick}
                onDropFiles={handleDropFiles}
                onRemoveFile={() => setFileAndUrl(currentId, null)}
                onUploadSelectedFile={handleUploadSelectedFile}
              />
            </TabsContent>

            <TabsContent value="select">
              <TranscriptionSelectTab
                uploads={uploads}
                isUploadsLoading={isUploadsLoading}
                isUploadsRefetching={isUploadsRefetching}
                selectedUploadId={selectedUploadId}
                isTranscribing={isTranscribing}
                deleteAfterTranscription={deleteAfterTranscription}
                isDeleteDialogOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                currentId={currentId}
                onRefetch={refetchUploads}
                onSelectUpload={handleSelectUpload}
                onDeselectUpload={() => setSelectedUploadId(currentId, null)}
                onSetDeleteAfterTranscription={setDeleteAfterTranscription}
                onDeleteFile={(id) => deleteFile(id)}
                onSetIsDeleteDialogOpen={setIsDeleteDialogOpen}
                onSetPendingDeleteId={setPendingDeleteId}
                pendingDeleteId={pendingDeleteId}
              />
            </TabsContent>
          </Tabs>

          <TranscriptionControls
            currentId={currentId}
            settingsId={settingsId}
            isSharedSettings={isSharedSettings}
            models={models}
            localAudioDuration={localAudioDuration}
            isTranscribing={isTranscribing}
            isGlobalMaxDurationExceeded={isGlobalMaxDurationExceeded}
            session={session}
            onStart={handleStartTranscription}
            onStop={handleStopTranscription}
            onSetRightTab={setRightTab}
          />
        </div>

        {/* Right Column - Results */}
        <div className="md:col-span-2 space-y-6">
          <TranscriptionResultPanel
            rightTab={rightTab}
            onSetRightTab={setRightTab}
            transcriptionText={transcriptionText}
            transcriptSubtitles={transcriptSubtitles}
            isTranscribing={isTranscribing}
            isEditing={isEditing}
            isClearDialogOpen={isClearDialogOpen}
            transcriptionAreaRef={transcriptionAreaRef}
            transcriptionResultRef={transcriptionResultRef}
            onTranscriptionTextChange={handleTranscriptionTextChange}
            onIsEditing={handleIsEditing}
            onClear={handleClear}
            onConfirmClear={handleConfirmClear}
            onSetIsClearDialogOpen={setIsClearDialogOpen}
            onParse={handleParse}
            onExport={handleExport}
          />

          {isAsrModel(models) && (
            <div className={cn(isSharedSettings && "pointer-events-none opacity-50")}>
              <WhisperSettingsPanel
                showApplyButton
                onApplyClick={handleApplyWhisperSubtitles}
                applyDisabled={isTranscribing || !words.length || !segments.length}
              />
            </div>
          )}

          <TranscriptionNextActions
            transcriptSubtitles={transcriptSubtitles}
            isTranscribing={isTranscribing}
            onCreateTranslation={handleCreateTranslation}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  )
}