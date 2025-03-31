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
import { useTranscriptionStore } from "@/stores/use-transcription-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { timestampToString } from "@/lib/utils"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { DragAndDrop } from "./ui-custom/drag-and-drop"
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
import { useTranscriptionDataStore } from "@/stores/use-transcription-data-store"
import { useProjectStore } from "@/stores/use-project-store"
import { MAX_TRANSCRIPTION_SIZE } from "@/constants/default"
import { generateSRT } from "@/lib/srt/generate"
import { parseTranscription } from "@/lib/parser"

const languages = [
  { value: "auto", label: "Auto-detect" },
]

const models = [
  { value: "default", label: "Mitsuko (Default)" },
]

export default function Transcription() {
  const currentId = useTranscriptionDataStore(state => state.currentId)
  const transcriptionData = useTranscriptionDataStore(state => state.data)

  if (!currentId || !transcriptionData[currentId]) {
    return <div className="p-4">No transcription project selected</div>
  }

  const transcriptionAreaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Get data store getters and setters
  const transcriptionText = useTranscriptionDataStore(state => state.getTranscriptionText())
  const transcriptSubtitles = useTranscriptionDataStore(state => state.getTranscriptSubtitles())
  const setTranscriptionText = useTranscriptionDataStore(state => state.setTranscriptionText)
  const setTranscriptSubtitles = useTranscriptionDataStore(state => state.setTranscriptSubtitles)
  const saveData = useTranscriptionDataStore(state => state.saveData)

  // Transcription store
  const file = useTranscriptionStore((state) => state.file)
  const isTranscribingSet = useTranscriptionStore((state) => state.isTranscribingSet)
  const audioUrl = useTranscriptionStore((state) => state.audioUrl)
  const setFileAndUrl = useTranscriptionStore((state) => state.setFileAndUrl)
  const setIsTranscribing = useTranscriptionStore((state) => state.setIsTranscribing)
  const startTranscription = useTranscriptionStore((state) => state.startTranscription)
  const stopTranscription = useTranscriptionStore((state) => state.stopTranscription)
  const isTranscribing = isTranscribingSet.has(currentId)

  const session = useSessionStore((state) => state.session)

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].value)
  const [selectedModel, setSelectedModel] = useState(models[0].value)
  const [isSpeakerDetection, setIsSpeakerDetection] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)

  useAutoScroll(transcriptionText, transcriptionAreaRef)
  const { setHasChanges } = useUnsavedChanges()

  const isExceeded = file ? file.size > MAX_TRANSCRIPTION_SIZE : false
  const maxMB = MAX_TRANSCRIPTION_SIZE / (1024 * 1024)

  useEffect(() => {
    if (transcriptionData[currentId].projectId !== useProjectStore.getState().currentProject?.id) {
      useProjectStore.getState().setCurrentProject(transcriptionData[currentId].projectId)
    }

    return () => {
      saveData(currentId)
    }
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileAndUrl(e.target.files[0])
    }
    e.target.value = ""
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDropFiles = (files: FileList) => {
    if (files.length > 0) {
      setFileAndUrl(files[0])
    }
  }

  const handleStartTranscription = async () => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    await saveData(currentId)

    if (!file) throw new Error("No file selected")
    if (file.size > MAX_TRANSCRIPTION_SIZE) {
      throw new Error(`File size must be less than ${MAX_TRANSCRIPTION_SIZE / (1024 * 1024)}MB`)
    }

    setIsTranscribing(currentId, true)
    setHasChanges(true)

    const formData = new FormData()
    formData.append("audio", file)

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
      toast.success("Parse Success!")
    } catch (error) {
      toast.error(
        <div className="select-none">
          <div>Parse Error! Please follow this format:</div>
          <div className="font-mono">
            <div>mm:ss:ms {"-->"} mm:ss:ms</div>
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

    const srtContent = generateSRT(transcriptSubtitles)
    if (!srtContent) return

    const blob = new Blob([srtContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transcription.srt"
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

  return (
    <div className="mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-2">Audio Transcription (Experimental)</h1>
        <p className="text-muted-foreground">
          Upload your audio file and get accurate transcriptions with timestamps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr_1fr] gap-8">
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
                  <div className="flex-1 truncate text-sm">{file.name}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setFileAndUrl(null)
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
              {/* Language Selection */}
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speaker Detection Switch */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-sm">Speaker Detection</label>
                <Switch
                  disabled
                  checked={isSpeakerDetection}
                  onCheckedChange={setIsSpeakerDetection}
                />
              </div>

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
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="bg-card border-b border-border w-full justify-start rounded-none p-0">
              <TabsTrigger
                value="transcript"
                className="py-2 px-4 data-[state=active]:bg-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Transcript
              </TabsTrigger>
              <TabsTrigger
                value="subtitles"
                className="py-2 px-4 data-[state=active]:bg-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Subtitles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Transcription Result</h2>

                  {(transcriptionText || isEditing) && (
                    <div className="flex gap-2">
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
                ) : (
                  <Textarea
                    ref={transcriptionAreaRef}
                    value={transcriptionText}
                    readOnly={!isEditing || isTranscribing}
                    onChange={handleTranscriptionTextChange}
                    className="w-full h-96 p-4 bg-background text-foreground resize-none"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="subtitles" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Subtitles with Timestamps</h2>

                  {transcriptSubtitles.length > 0 && (
                    <div className="flex gap-2">
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
                        <ClipboardPaste className="h-3 w-3" /> Parse Subtitle
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
                        <p className="text-sm">{subtitle.content}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-md">
                <div className="flex items-start gap-3 mb-2">
                  <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Translate</h3>
                    <p className="text-xs text-muted-foreground">Translate your transcript into 100+ languages</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2 border-border">
                  Translate Subtitles
                </Button>
              </div>

              <div className="p-4 border border-border rounded-md">
                <div className="flex items-start gap-3 mb-2">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Export</h3>
                    <p className="text-xs text-muted-foreground">Export as SRT, ASS, or plain text</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2 border-border">
                  Export Options
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
