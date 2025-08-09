"use client"

import { useState, useRef, type ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  FileText,
  Globe,
  Upload,
  X,
  Wand2,
  Clock,
  File,
  AudioWaveform,
  Square,
  Loader2,
  Edit,
  Save,
  ClipboardPaste,
  Trash,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { timestampToString } from "@/lib/subtitles/timestamp"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
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
import { MAX_TRANSCRIPTION_SIZE } from "@/constants/default"
import { parseTranscription } from "@/lib/parser/parser"
import { useQuery } from "@tanstack/react-query"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"
import { Input } from "@/components/ui/input"
import { SettingsTranscription } from "./settings-transcription"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { SubtitleTranslated } from "@/types/subtitles"
import { useRouter } from "next/navigation"
import { AiStreamOutput } from "../ai-stream/ai-stream-output"
import { cn } from "@/lib/utils"

interface TranscriptionMainProps {
  currentId: string
}

export function TranscriptionMain({ currentId }: TranscriptionMainProps) {
  const transcriptionAreaRef = useRef<HTMLTextAreaElement>(null)
  const transcriptionResultRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Get data store getters and setters
  const title = useTranscriptionDataStore(state => state.getTitle())
  const transcriptionText = useTranscriptionDataStore(state => state.getTranscriptionText())
  const transcriptSubtitles = useTranscriptionDataStore(state => state.getTranscriptSubtitles())
  const selectedMode = useTranscriptionDataStore(state => state.getSelectedMode())
  const customInstructions = useTranscriptionDataStore(state => state.getCustomInstructions())
  const models = useTranscriptionDataStore(state => state.getModels())
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

  const session = useSessionStore((state) => state.session)

  // Add lazy user data query that only executes manually
  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false, // Lazy query - won't run automatically
    staleTime: 0, // Always refetch when requested
  })

  const router = useRouter()
  const createTranslationDb = useTranslationDataStore(state => state.createTranslationDb)
  const setTranslationCurrentId = useTranslationDataStore(state => state.setCurrentId)
  const currentProject = useProjectStore(state => state.currentProject)
  const loadProjects = useProjectStore(state => state.loadProjects)

  const [isEditing, setIsEditing] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)

  useAutoScroll(transcriptionText, transcriptionAreaRef)
  useAutoScroll(transcriptionText, transcriptionResultRef)
  const { setHasChanges } = useUnsavedChanges()

  const isExceeded = file ? file.size > MAX_TRANSCRIPTION_SIZE : false
  const maxMB = MAX_TRANSCRIPTION_SIZE / (1024 * 1024)

  useEffect(() => {
    return () => {
      saveData(currentId)
    }
  }, [currentId, saveData])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileAndUrl(currentId, file)
      setTitle(currentId, file.name)
    }
    e.target.value = ""
  }

  const handleDropFiles = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0]
      setFileAndUrl(currentId, file)
      setTitle(currentId, file.name)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleStartTranscription = async () => {
    await saveData(currentId)

    if (!file) {
      toast.error("No file selected")
      return
    }
    if (file.size > MAX_TRANSCRIPTION_SIZE) {
      toast.error(`File size must be less than ${MAX_TRANSCRIPTION_SIZE / (1024 * 1024)}MB`)
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

    const formData = new FormData()
    formData.append("audio", file)
    formData.append("selectedMode", selectedMode)
    formData.append("customInstructions", customInstructions)
    formData.append("models", models)
    console.log({ file, selectedMode, customInstructions, models })

    try {
      const text = await startTranscription(
        currentId,
        formData,
        (text) => setTranscriptionText(currentId, text),
      )
      setTranscriptSubtitles(currentId, parseTranscription(text))
    } catch (error) {
      console.error(error)
    } finally {
      setIsTranscribing(currentId, false)

      // Refetch user data after transcription completes to update credits
      refetchUserData()

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
      fileName = fileName.endsWith(".srt") ? fileName : fileName + ".srt"
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
        {},
        {},
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
    <div className="mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(currentId, e.target.value)}
          className="text-base md:text-base font-semibold h-12"
          placeholder="Enter title..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] lg:grid-cols-[400px_1fr_1fr] gap-8">
        {/* Left Column - Upload & Controls */}
        <div className="md:col-span-1 space-y-6">
          {/* File Upload */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Upload Audio</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".aac,audio/wav,audio/mp3,audio/aiff,audio/ogg,audio/flac"
              className="hidden"
            />
            {!file ? (
              <DragAndDrop onDropFiles={handleDropFiles} disabled={isTranscribing}>
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm mb-1">Click to upload or drag and drop</p>
                  <p className="text-muted-foreground text-xs">AAC, FLAC, MP3, and more (max {maxMB}MB)</p>
                </div>
              </DragAndDrop>
            ) : (
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <File className="h-6 w-6 text-blue-500 mr-2" />
                  <div className="flex-1 line-clamp-3 text-sm">{file.name}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setFileAndUrl(currentId, null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {audioUrl && <audio ref={audioRef} controls className="w-full h-10 mb-2" src={audioUrl} />}

                <div className="text-xs text-muted-foreground flex flex-col">
                  <p>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                  </p>
                  {isExceeded &&
                    <p className="text-red-500">File size exceeds {maxMB}MB</p>}
                </div>
              </div>
            )}
          </div>

          {/* Transcription Controls */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Transcription Settings</h2>

            <div className="space-y-4">
              {/* Transcription Settings */}
              <SettingsTranscription transcriptionId={currentId} />

              {/* Buttons */}
              <div className="pt-4 flex gap-2">
                {/* Start Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!file || isTranscribing || isExceeded || !session}
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
                  <h2 className="text-lg font-medium">Transcription Result</h2>

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
                        {isEditing ? "Save" : "Edit"}
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
                  <h2 className="text-lg font-medium">Subtitles with Timestamps</h2>

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
                            <Trash className="h-3 w-3 mr-1" /> Clear
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
                        <ClipboardPaste className="h-3 w-3" /> Get Subtitle
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