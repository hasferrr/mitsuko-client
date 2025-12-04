"use client"

import { useState, useRef, type ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  FileText,
  Globe,
  Wand2,
  Clock,
  File,
  Loader2,
  Square,
  Trash2,
  Trash,
  Save,
  Edit,
  AudioWaveform,
  ClipboardPaste,
  RefreshCw,
  Upload,
  X,
  ArrowLeft,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteDialogue } from "@/components/ui-custom/delete-dialogue"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useUploadStore } from "@/stores/use-upload-store"
import { timestampToString } from "@/lib/subtitles/timestamp"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useSessionStore } from "@/stores/use-session-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { parseTranscription } from "@/lib/parser/parser"
import { useQuery } from "@tanstack/react-query"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { listUploads, deleteUpload } from "@/lib/api/uploads"
import { UserCreditData } from "@/types/user"
import { UploadFileMeta } from "@/types/uploads"
import { useClientIdStore } from "@/stores/use-client-id-store"
import { Input } from "@/components/ui/input"
import { SettingsTranscription } from "./settings-transcription"
import { uploadFile } from "@/lib/api/file-upload"
import { MAX_FILE_SIZE, GLOBAL_MAX_DURATION_SECONDS, isModelDurationLimitExceeded, getModel } from "@/constants/transcription"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { SubtitleTranslated } from "@/types/subtitles"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AiStreamOutput } from "../ai-stream/ai-stream-output"
import { cn, calculateAudioDuration, createUtf8SubtitleBlob } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { Label } from "../ui/label"

interface TranscriptionMainProps {
  currentId: string
}

export function TranscriptionMain({ currentId }: TranscriptionMainProps) {
  // Transcription data store
  const title = useTranscriptionDataStore(state => state.getTitle())
  const transcriptionText = useTranscriptionDataStore(state => state.getTranscriptionText())
  const transcriptSubtitles = useTranscriptionDataStore(state => state.getTranscriptSubtitles())
  const selectedMode = useTranscriptionDataStore(state => state.getSelectedMode())
  const customInstructions = useTranscriptionDataStore(state => state.getCustomInstructions())
  const models = useTranscriptionDataStore(state => state.getModels())
  const language = useTranscriptionDataStore(state => state.getLanguage())
  const setTitle = useTranscriptionDataStore(state => state.setTitle)
  const setTranscriptionText = useTranscriptionDataStore(state => state.setTranscriptionText)
  const setTranscriptSubtitles = useTranscriptionDataStore(state => state.setTranscriptSubtitles)
  const saveData = useTranscriptionDataStore(state => state.saveData)

  // Transcription store
  const file = useTranscriptionStore((state) => state.files[currentId])
  const audioUrl = useTranscriptionStore((state) => state.audioUrls[currentId])
  const isTranscribingSet = useTranscriptionStore((state) => state.isTranscribingSet)
  const setFileAndUrl = useTranscriptionStore((state) => state.setFileAndUrl)
  const setIsTranscribing = useTranscriptionStore((state) => state.setIsTranscribing)
  const startTranscription = useTranscriptionStore((state) => state.startTranscription)
  const stopTranscription = useTranscriptionStore((state) => state.stopTranscription)
  const isTranscribing = isTranscribingSet.has(currentId)

  // Upload & Delete mutations
  const uploadProgress = useUploadStore((state) => state.uploadProgress)
  const isUploading = useUploadStore((state) => state.isUploading)
  const setUploadProgress = useUploadStore((state) => state.setUploadProgress)
  const setIsUploading = useUploadStore((state) => state.setIsUploading)

  // Other stores
  const createTranslationDb = useTranslationDataStore(state => state.createTranslationDb)
  const setTranslationCurrentId = useTranslationDataStore(state => state.setCurrentId)
  const currentProject = useProjectStore(state => state.currentProject)
  const loadProjects = useProjectStore(state => state.loadProjects)
  const session = useSessionStore((state) => state.session)
  const deleteAfterTranscription = useLocalSettingsStore(state => state.deleteAfterTranscription)
  const setDeleteAfterTranscription = useLocalSettingsStore(state => state.setDeleteAfterTranscription)


  // React Query
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
    mutationFn: (file: File) => uploadFile(file, setUploadProgress),
    onMutate: () => {
      setIsUploading(true)
      setUploadProgress(null)
    },
    onSuccess: (uploadId) => {
      toast.success("File uploaded successfully")
      queryClient.invalidateQueries({ queryKey: ["uploads"] })
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setFileAndUrl(currentId, null)
      setActiveTab("select")
      if (uploadId) {
        setSelectedUploadId(uploadId)
        if (file) {
          setTitle(currentId, file.name)
        }
      }
    },
    onError: (err: Error) => {
      toast.error("Failed to upload file", { description: err.message })
      setUploadProgress(null)
    },
    onSettled: () => setIsUploading(false),
  })

  const { mutate: deleteFile, isPending: isDeleting } = useMutation({
    mutationFn: (uploadId: string) => deleteUpload(uploadId),
    onSuccess: () => {
      toast.success("File deleted")
      queryClient.invalidateQueries({ queryKey: ["uploads"] })
      setSelectedUploadId(null)
      setIsDeleteDialogOpen(false)
    },
    onError: (err: Error) => toast.error("Failed to delete", { description: err.message }),
  })

  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })

  // State
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [localAudioDuration, setLocalAudioDuration] = useState<number | null>(null)
  const isGlobalMaxDurationExceeded = localAudioDuration !== null && localAudioDuration > GLOBAL_MAX_DURATION_SECONDS

  // Refs
  const transcriptionAreaRef = useRef<HTMLTextAreaElement>(null)
  const transcriptionResultRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hooks
  const router = useRouter()
  useAutoScroll(transcriptionText, transcriptionAreaRef)
  useAutoScroll(transcriptionText, transcriptionResultRef)
  const { setHasChanges } = useUnsavedChanges()

  // Effects
  useEffect(() => {
    return () => {
      saveData(currentId)
    }
  }, [currentId, saveData])

  useEffect(() => {
    let isCancelled = false
    if (file) {
      calculateAudioDuration(file)
        .then((seconds) => {
          if (!isCancelled) setLocalAudioDuration(seconds)
        })
        .catch(() => {
          if (!isCancelled) setLocalAudioDuration(null)
        })
    } else {
      setLocalAudioDuration(null)
    }
    return () => { isCancelled = true }
  }, [file])

  const handleStartTranscription = async () => {
    await saveData(currentId)

    if (!selectedUploadId) {
      toast.error("Please upload or select an uploaded file first")
      return
    }
    if (!models) {
      toast.error("Please select a model")
      return
    }

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    setIsTranscribing(currentId, true)
    setHasChanges(true)

    const t = useTranscriptionDataStore.getState().data[currentId]
    const pid = t?.projectId
    const project = pid ? await useProjectStore.getState().getProjectDb(pid) : null
    const projectName = project?.name || ""

    const requestBody = {
      uploadId: selectedUploadId,
      language,
      selectedMode,
      customInstructions,
      models,
      clientId: useClientIdStore.getState().clientId || "",
      deleteFile: deleteAfterTranscription,
      projectName,
    }
    console.log(requestBody)

    try {
      const text = await startTranscription(
        currentId,
        requestBody,
        (text) => setTranscriptionText(currentId, text),
      )
      setTranscriptSubtitles(currentId, parseTranscription(text))

      if (deleteAfterTranscription) {
        setSelectedUploadId(null)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsTranscribing(currentId, false)

      const isUsingCredits = !models.includes("free")
      if (isUsingCredits) refetchUserData()

      // Revalidate uploads list
      queryClient.invalidateQueries({ queryKey: ["uploads"] })
      await refetchUploads()
      await saveData(currentId)
    }
  }

  const handleStopTranscription = () => {
    setIsTranscribing(currentId, false)
    stopTranscription(currentId)
  }

  const handleTranscriptionTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTranscriptionText(currentId, e.target.value)
    setHasChanges(true)
  }

  const handleParse = async () => {
    try {
      const subtitles = parseTranscription(transcriptionText)
      setTranscriptSubtitles(currentId, subtitles)
      toast.success("Subtitles parsed successfully!")
    } catch (error) {
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
      throw error
    }
    await saveData(currentId)
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
    setSelectedUploadId(null)
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
      setSelectedUploadId(null)
    } else {
      setSelectedUploadId(upload.uploadId)
      setTitle(currentId, upload.fileName)
    }
  }

  const handleUploadSelectedFile = () => {
    setSelectedUploadId(null)
    if (!file) return
    handleUpload(file)
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
    <div className="mx-auto pt-4 pb-8 px-4 max-w-5xl">
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/project')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(currentId, e.target.value)}
          className="text-xl font-semibold h-12"
          placeholder="Enter title..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] lg:grid-cols-[400px_1fr_1fr] gap-8">
        {/* Left Column - Upload & Controls */}
        <div className="md:col-span-1 space-y-6">
          {/* File Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="upload" className="w-full">Upload</TabsTrigger>
              <TabsTrigger value="select" className="w-full">Select</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-medium">Upload Audio</h2>

                {/* Drag and drop area */}
                {!file && (
                  <DragAndDrop
                    onDropFiles={handleDropFiles}
                    disabled={isUploading}
                    className="rounded-lg"
                  >
                    <div
                      onClick={handleDragAndDropClick}
                      className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-sm mb-1">Click to upload or drag and drop</p>
                      <p className="text-muted-foreground text-xs">AAC, FLAC, MP3, and more (max {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)</p>
                    </div>
                  </DragAndDrop>
                )}
                {/* Hidden input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".aac,audio/wav,audio/mp3,audio/aiff,audio/ogg,audio/flac"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleDropFiles(e.target.files)
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
                          onClick={() => setFileAndUrl(currentId, null)}
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
                      onClick={handleUploadSelectedFile}
                      disabled={isUploading || !session || (isGlobalMaxDurationExceeded)}
                      className="w-full border-primary/25 hover:border-primary/50"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload Selected File {uploadProgress && `(${uploadProgress.percentage}%)`}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Select Tab */}
            <TabsContent value="select">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Select Uploaded Audio</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchUploads()}
                    disabled={isUploadsRefetching}
                  >
                    {isUploadsRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Refresh
                  </Button>
                </div>

                {isUploadsLoading ? (
                  <p>Loading uploads...</p>
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
                            onClick={(e) => {
                              e.stopPropagation()
                              setPendingDeleteId(upload.uploadId)
                              setIsDeleteDialogOpen(true)
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: <span className="text-foreground">{uploads.find(u => u.uploadId === selectedUploadId)?.fileName || 'Unknown file'}</span>
                  </p>
                )}

                {uploads.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Checkbox
                      id="delete-after-transcription"
                      checked={deleteAfterTranscription}
                      onCheckedChange={v => setDeleteAfterTranscription(v === true)}
                    />
                    <Label htmlFor="delete-after-transcription" className="text-sm text-muted-foreground">
                      Delete uploaded file after transcription
                    </Label>
                  </div>
                )}

                <DeleteDialogue
                  handleDelete={() => {
                    if (pendingDeleteId) deleteFile(pendingDeleteId)
                  }}
                  isDeleteModalOpen={isDeleteDialogOpen}
                  setIsDeleteModalOpen={setIsDeleteDialogOpen}
                  isProcessing={isDeleting}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Transcription Controls */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Transcription Settings</h2>

            <div className="space-y-4">
              {/* Transcription Settings */}
              <SettingsTranscription transcriptionId={currentId} />

              {/* Model Duration Exceeded Warning */}
              {isModelDurationLimitExceeded(models, localAudioDuration || 0) && (
                <div className="flex items-center gap-2 text-red-600 text-xs">
                  <div className="h-3 w-3">
                    <Clock className="h-3 w-3" />
                  </div>
                  <p>
                    {models ? `${models} model has ${(getModel(models)?.maxDuration || 0) / 60} minutes limit.` : ""}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                {/* Start Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isTranscribing || !session || isGlobalMaxDurationExceeded}
                  onClick={handleStartTranscription}
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Transcribing
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      {session ? "Transcribe" : "Sign in to Start"}
                    </>
                  )}
                </Button>

                {/* Stop Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!isTranscribing}
                  onClick={handleStopTranscription}
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="transcript">
            <TabsList className="w-full">
              <TabsTrigger value="transcript" className="w-full">
                Transcript
              </TabsTrigger>
              <TabsTrigger value="subtitles" className="w-full" >
                Subtitles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4 gap-2">
                  <h2 className="text-lg font-medium">Transcription</h2>

                  {(transcriptionText || isEditing) && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-border"
                            onClick={handleClear}
                            disabled={isTranscribing}
                          >
                            <Trash className="h-3 w-3" /> Clear
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently clear the transcription and subtitles.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmClear}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn("text-xs border-border", isEditing && "border-primary/50")}
                        onClick={handleIsEditing}
                        disabled={isTranscribing}
                      >
                        {isEditing
                          ? <Save className="h-3 w-3" />
                          : <Edit className="h-3 w-3" />}
                        {isEditing ? "Done" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-border"
                        onClick={handleExport}
                      >
                        <Download className="h-3 w-3" /> Export SRT
                      </Button>
                    </div>
                  )}
                </div>

                {!transcriptionText && !isTranscribing && !isEditing ? (
                  <div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center">
                    <AudioWaveform className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm mb-1">
                      Upload an audio file and click "Start Transcription"
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Your transcription will appear here in real-time
                    </p>
                  </div>
                ) : isEditing ? (
                  <Textarea
                    ref={transcriptionAreaRef}
                    value={transcriptionText}
                    readOnly={!isEditing || isTranscribing}
                    onChange={handleTranscriptionTextChange}
                    className="w-full h-96 p-4 bg-background text-foreground resize-none overflow-y-auto"
                  />
                ) : (
                  <div
                    ref={transcriptionResultRef}
                    className={cn(
                      "min-h-96 h-96 overflow-y-auto rounded-md border p-3 pr-2",
                      !transcriptionText && "text-muted-foreground",
                    )}
                  >
                    <AiStreamOutput
                      content={transcriptionText || "Transcription will appear here..."}
                      isProcessing={isTranscribing}
                      defaultCollapsed={!!transcriptionText}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="subtitles" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4 gap-2">
                  <h2 className="text-lg font-medium">Subtitle Result</h2>

                  {transcriptSubtitles.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-border"
                            onClick={handleClear}
                            disabled={isTranscribing}
                          >
                            <Trash className="h-3 w-3" /> Clear
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently clear the transcription and subtitles.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmClear}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-border"
                        onClick={handleParse}
                      >
                        <ClipboardPaste className="h-3 w-3" /> Parse
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-border"
                        onClick={handleExport}
                      >
                        <Download className="h-3 w-3" /> Export SRT
                      </Button>
                    </div>
                  )}
                </div>

                {transcriptSubtitles.length === 0 && !isTranscribing ? (
                  <div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center">
                    <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm mb-1">
                      Your subtitles with timestamps will appear here
                    </p>
                    <p className="text-muted-foreground text-xs">After transcription is complete</p>
                  </div>
                ) : (
                  <div className="h-96 overflow-y-auto pr-2">
                    {transcriptSubtitles.map((subtitle) => (
                      <div
                        key={`transcript-subtitle-${subtitle.index}`}
                        className="mb-4 p-3 border border-border rounded-md hover:border-border/80 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium">#{subtitle.index}</span>
                          <span className="text-xs text-muted-foreground">
                            {timestampToString(subtitle.timestamp.start)} → {timestampToString(subtitle.timestamp.end)}
                          </span>
                        </div>
                        {subtitle.content.split("\n").map((line, index) => (
                          <p key={`transcript-subtitle-${subtitle.index}-${index}`} className="text-sm">
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}

                    {isTranscribing && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Always Show What's Next */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">What's Next?</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col justify-between p-4 border border-border rounded-md">
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-5 w-5 mt-0.5 text-blue-500">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Translate</h3>
                    <p className="text-xs text-muted-foreground">Translate your transcript into 100+ languages</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-border"
                  onClick={handleCreateTranslation}
                  disabled={!transcriptSubtitles.length || isTranscribing}
                >
                  Translate Subtitles
                </Button>
              </div>

              <div className="flex flex-col justify-between p-4 border border-border rounded-md">
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-5 w-5 mt-0.5 text-blue-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Export</h3>
                    <p className="text-xs text-muted-foreground">Export transcription as SRT subtitle</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-border"
                  onClick={handleExport}
                  disabled={!transcriptSubtitles.length || isTranscribing}
                >
                  Export Subtitles
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}