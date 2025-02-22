"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Globe2,
  MessageSquare,
  Play,
  Square,
  Download,
  Upload,
  FileText,
  Trash,
  Loader2,
  History as HistoryIcon,
} from "lucide-react"
import { SubtitleList } from "./subtitle-list"
import {
  LanguageSelection,
  ModelSelection,
  ContextDocumentInput,
  TemperatureSlider,
  SplitSizeInput,
  SystemPromptInput,
  ProcessOutput,
  MaxCompletionTokenInput,
  StartIndexInput,
} from "./settings-inputs"
import {
  ContextCompletion,
  Subtitle,
  SubOnlyTranslated,
  SubtitleTranslated,
  SubtitleNoTime,
} from "@/types/types"
import { parseSRT } from "@/lib/srt/parse"
import { parseASS } from "@/lib/ass/parse"
import { generateSRT } from "@/lib/srt/generate"
import { mergeASSback } from "@/lib/ass/merge"
import { capitalizeWords, cn, minMax } from "@/lib/utils"
import { useSubtitleStore } from "@/stores/use-subtitle-store"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
import { useHistoryStore } from "@/stores/use-history-store"
import { useBeforeUnload } from "@/hooks/use-before-unload"
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { DEFAULT_SUBTITLES, DEFAULT_TITLE } from "@/constants/default"
import {
  MAX_COMPLETION_TOKENS_MAX,
  MAX_COMPLETION_TOKENS_MIN,
  SPLIT_SIZE_MAX,
  SPLIT_SIZE_MIN,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
} from "@/constants/limits"


export default function SubtitleTranslator() {
  // Subtitle Store
  const title = useSubtitleStore((state) => state.title)
  const setTitle = useSubtitleStore((state) => state.setTitle)
  const subtitles = useSubtitleStore((state) => state.subtitles)
  const setSubtitles = useSubtitleStore((state) => state.setSubtitles)
  const parsed = useSubtitleStore((state) => state.parsed)
  const setParsed = useSubtitleStore((state) => state.setParsed)
  const resetParsed = useSubtitleStore((state) => state.resetParsed)
  const isInitRef = useSubtitleStore((state) => state.isInitRef)

  // Settings Store
  const sourceLanguage = useSettingsStore((state) => state.sourceLanguage)
  const targetLanguage = useSettingsStore((state) => state.targetLanguage)
  const selectedModel = useSettingsStore((state) => state.selectedModel)
  const isUseCustomModel = useSettingsStore((state) => state.isUseCustomModel)
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl)
  const customModel = useSettingsStore((state) => state.customModel)
  const apiKey = useSettingsStore((state) => state.apiKey)
  const contextDocument = useSettingsStore((state) => state.contextDocument)
  const setContextDocument = useSettingsStore((state) => state.setContextDocument)

  // Advanced Settings Store
  const temperature = useAdvancedSettingsStore((state) => state.temperature)
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.maxCompletionTokens)
  const splitSize = useAdvancedSettingsStore((state) => state.splitSize)
  const startIndex = useAdvancedSettingsStore((state) => state.startIndex)

  // Translation Store
  const response = useTranslationStore((state) => state.response)
  const isTranslating = useTranslationStore((state) => state.isTranslating)
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)
  const translateSubtitles = useTranslationStore((state) => state.translateSubtitles)
  const stopTranslation = useTranslationStore((state) => state.stopTranslation)
  const setJsonResponse = useTranslationStore((state) => state.setJsonResponse)
  const appendJsonResponse = useTranslationStore((state) => state.appendJsonResponse)

  // History Store & State
  const addHistory = useHistoryStore((state) => state.addHistory)
  const history = useHistoryStore((state) => state.history)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null)

  // Other State
  const [activeTab, setActiveTab] = useState(isTranslating ? "process" : "basic")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isContextUploadDialogOpen, setIsContextUploadDialogOpen] = useState(false)
  const [pendingContextFile, setPendingContextFile] = useState<File | null>(null)

  const { setHasChanges } = useBeforeUnload()

  useEffect(() => {
    const key = useSubtitleStore.persist.getOptions().name
    if (key && !localStorage.getItem(key) && isInitRef.current) {
      setTitle(DEFAULT_TITLE)
      setSubtitles(DEFAULT_SUBTITLES)
    }
    isInitRef.current = false
  }, [])

  const handleStartTranslation = async () => {
    if (!subtitles.length) return
    setIsTranslating(true)
    setHasChanges(true)
    setActiveTab("process")
    setJsonResponse([])

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    // Accumulate raw responses
    const allRawResponses: string[] = []

    // Split subtitles into chunks, starting from startIndex - 1
    const subtitleChunks: SubtitleNoTime[][] = []
    const size = minMax(splitSize, SPLIT_SIZE_MIN, SPLIT_SIZE_MAX)
    const adjustedStartIndex = minMax(startIndex - 1, 0, subtitles.length - 1)
    for (let i = adjustedStartIndex; i < subtitles.length; i += size) {
      subtitleChunks.push(subtitles.slice(i, i + size).map((s) => ({
        index: s.index,
        actor: s.actor,
        content: s.content,
      })))
    }

    // Prepare context for the first chunk
    const context: ContextCompletion[] = []
    if (startIndex > 1) {
      context.push({
        role: "user",
        content: subtitles.slice(0, adjustedStartIndex).map((chunk) => ({
          index: chunk.index,
          actor: chunk.actor,
          content: chunk.content,
        })),
      })
      context.push({
        role: "assistant",
        content: [],
      })
    }

    console.log(subtitleChunks)
    console.log(context)

    // Translate each chunk of subtitles
    for (let i = 0; i < subtitleChunks.length; i++) {
      const chunk = subtitleChunks[i]
      const requestBody = {
        subtitles: chunk.map((s) => ({
          index: s.index,
          actor: s.actor,
          content: s.content,
        })),
        sourceLanguage,
        targetLanguage,
        contextDocument,
        baseURL: isUseCustomModel ? customBaseUrl : "http://localhost:6969",
        model: isUseCustomModel ? customModel : selectedModel,
        temperature: minMax(temperature, TEMPERATURE_MIN, TEMPERATURE_MAX),
        maxCompletionTokens: minMax(
          maxCompletionTokens,
          MAX_COMPLETION_TOKENS_MIN,
          MAX_COMPLETION_TOKENS_MAX
        ),
        contextMessage: context,
      }

      let tlChunk: SubOnlyTranslated[] = []
      try {
        tlChunk = await translateSubtitles(requestBody, apiKey, !isUseCustomModel)
      } catch {
        setIsTranslating(false)
      } finally {
        allRawResponses.push(
          useTranslationStore.getState().response
        )
      }

      if (tlChunk.length) {
        appendJsonResponse(tlChunk)

        // Merge translated chunk with original subtitles
        const merged: SubtitleTranslated[] = [...subtitles]
        for (let j = 0; j < tlChunk.length; j++) {
          const index = tlChunk[j].index - 1
          merged[index] = {
            ...merged[index],
            translated: tlChunk[j].translated || merged[index].translated,
          }
        }

        setSubtitles(merged)

        // Update context for next chunk
        context.push({
          role: "user",
          content: requestBody.subtitles
        })
        context.push({
          role: "assistant",
          content: requestBody.subtitles.map((s, subIndex) => ({
            index: s.index,
            content: s.content,
            translated: tlChunk[subIndex]?.translated || "",
          })),
        })
      }

      // Break if translation is stopped
      const translatingStatus = useTranslationStore.getState().isTranslating
      if (!translatingStatus) break

      // Delay between each chunk
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setIsTranslating(false)

    // Add to history *after* translation is complete
    if (allRawResponses.length > 0) {
      addHistory(
        title,
        allRawResponses,
        JSON.stringify(useTranslationStore.getState().jsonResponse)
      )
    }
  }

  const handleStopTranslation = () => {
    stopTranslation()
    setIsTranslating(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const fileList = event instanceof FileList ? event : event.target.files
    if (!fileList || fileList.length === 0) return

    const file = fileList[0]
    setPendingFile(file) // Store the file
    setIsUploadDialogOpen(true) // Open the dialog

    // Reset the input if it's a file input event
    if (!(event instanceof FileList)) {
      event.target.value = ""
    }
  }

  const handleContextFileUpload = async (fileList: FileList) => {
    if (!fileList || fileList.length === 0) return

    const file = fileList[0]
    setPendingContextFile(file)
    setIsContextUploadDialogOpen(true)
  }

  const processFile = async () => {
    if (!pendingFile) return;

    try {
      const text = await pendingFile.text()
      const type = pendingFile.name.endsWith(".srt") ? "srt" : "ass"

      let parsedSubs: Subtitle[] = []
      if (type === "srt") {
        parsedSubs = parseSRT(text)
        setParsed({ type, data: null })
      } else {
        const data = parseASS(text)
        parsedSubs = data.subtitles
        setParsed({ type, data })
      }

      const parsedSubtitles: SubtitleTranslated[] = parsedSubs.map((subtitle) => ({
        ...subtitle,
        translated: "",
      }))

      setSubtitles(parsedSubtitles)
      const fileName = pendingFile.name.split('.')
      fileName.pop()
      setTitle(fileName.join('.'))
    } catch (error) {
      console.error("Error parsing subtitle file:", error)
    } finally {
      setIsUploadDialogOpen(false) // Close dialog after processing
      setPendingFile(null) // Clear pending file
    }
  }

  const processContextFile = async () => {
    if (!pendingContextFile) return
    try {
      const text = await pendingContextFile.text()
      setContextDocument(text)
    } catch (error) {
      console.error("Error reading context file:", error)
    } finally {
      setIsContextUploadDialogOpen(false)
      setPendingContextFile(null)
    }
  }

  const handleCancel = () => {
    setIsUploadDialogOpen(false)
    setPendingFile(null)
  }

  const handleContextCancel = () => {
    setIsContextUploadDialogOpen(false)
    setPendingContextFile(null)
  }

  const handleFileDownload = () => {
    const subtitleData: Subtitle[] = subtitles.map((s) => ({
      index: s.index,
      timestamp: s.timestamp,
      actor: s.actor,
      content: s.translated, // Use translated content for download
    }))
    if (!subtitleData.length) return

    let fileContent = ""
    if (parsed.type === "srt") {
      fileContent = generateSRT(subtitleData)
    } else if (parsed.type === "ass" && parsed.data) {
      fileContent = mergeASSback(subtitleData, parsed.data)
    } else {
      console.error("Invalid file type or missing parsed data for download.")
      return
    }

    const blob = new Blob([fileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title}.${parsed.type}` // Use the original file type
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSaveProject = () => { }

  const handleDelete = () => {
    setTitle("")
    setSubtitles([])
    resetParsed()
    useSubtitleStore.persist.clearStorage()
  }

  const subName = parsed.type === "ass" ? "SSA" : "SRT"

  const handleHistoryClick = (index: number) => {
    setSelectedHistoryIndex(index)
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto container py-4 px-4 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex-1 min-w-40">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold h-12"
          />
        </div>
        <input
          type="file"
          accept=".srt,.ass"
          onChange={handleFileUpload}
          className="hidden"
          id="subtitle-upload"
        />
        {/* Drag and Drop Area + Upload Button */}
        <DragAndDrop onDropFiles={handleFileUpload} disabled={isTranslating}>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => document.getElementById("subtitle-upload")?.click()}
            disabled={isTranslating}
          >
            <Upload className="h-5 w-5" />
            Upload File
          </Button>
        </DragAndDrop>
        {/* Save Button */}
        <Button onClick={handleSaveProject} size="lg" className="gap-2" disabled>
          <Save className="h-5 w-5" />
          Save Project
        </Button>
        {/* History Button */}
        <Button
          variant={isHistoryOpen ? "default" : "outline"}
          size="lg"
          className="gap-2 p-4"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <HistoryIcon className="h-5 w-5" />
          History
        </Button>
      </div>

      {/* Main Content */}
      <div
        className={cn("grid md:grid-cols-[1fr_402px] gap-6", isHistoryOpen && "hidden")}
      >
        {/* Left Column - Subtitles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Globe2 className="h-4 w-4" />{" "}
                {capitalizeWords(sourceLanguage)} → {capitalizeWords(targetLanguage)}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <MessageSquare className="h-4 w-4" /> {subtitles.length} Lines
              </Badge>
              <Badge variant="secondary" className="gap-1 uppercase">
                {subName}
              </Badge>
            </div>
          </div>

          {/* Wrap SubtitleList with DragAndDrop */}
          <DragAndDrop onDropFiles={handleFileUpload} disabled={isTranslating}>
            <SubtitleList />
          </DragAndDrop>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              className="gap-2"
              onClick={handleStartTranslation} // Use the new function
              disabled={isTranslating}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Translation
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleStopTranslation}
              disabled={!isTranslating}
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>

          <Link
            href="/extract-context"
            className="w-full mt-2 gap-2 inline-flex items-center justify-center"
          >
            <Button variant="outline" className="w-full gap-2">
              <FileText className="h-4 w-4" />
              Extract Context from Subtitle
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 mt-2"
                disabled={isTranslating}
              >
                <Trash className="h-4 w-4" />
                Remove All Subtitles
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will remove all subtitles.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="w-full mt-2 gap-2"
            variant="outline"
            onClick={handleFileDownload}
            disabled={isTranslating}
          >
            <Download className="h-4 w-4" />
            Download Translated Subtitles
          </Button>
        </div>

        {/* Right Column - Settings */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <LanguageSelection />
                  <ModelSelection />
                  {/* Wrap ContextDocumentInput with DragAndDrop */}
                  <DragAndDrop onDropFiles={handleContextFileUpload} disabled={isTranslating}>
                    <ContextDocumentInput />
                  </DragAndDrop>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <TemperatureSlider />
                  <StartIndexInput />
                  <SplitSizeInput />
                  <MaxCompletionTokenInput />
                  <SystemPromptInput />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="process" className="flex-grow space-y-4 mt-4">
              <ProcessOutput />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* History Panel */}
      {isHistoryOpen && (
        <ResizablePanelGroup
          direction="horizontal"
          className="h-[1000px] border rounded-lg overflow-hidden mt-4"
        >
          {/* Left Panel: History List */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <ScrollArea className="h-[550px]">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleHistoryClick(index)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p>{item.title}</p>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.content.join("\n").substring(0, 100)}
                    {item.content.join("\n").length > 100 ? "..." : ""}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel: Split Vertically */}
          <ResizablePanel defaultSize={70} minSize={10}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Top Panel: Raw Responses */}
              <ResizablePanel defaultSize={70} minSize={10}>
                <ScrollArea className="h-full">
                  <div className="p-6 max-w-none text-sm">
                    {selectedHistoryIndex !== null &&
                      history[selectedHistoryIndex].content.map((text, i) =>
                        text.split("\n").map((sentence, j) =>
                          !sentence ? (
                            <br key={`history-${selectedHistoryIndex}-${i}-${j}`} />
                          ) : (
                            <div key={`history-${selectedHistoryIndex}-${i}-${j}`}>
                              {sentence}
                            </div>
                          )
                        )
                      )}
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle />

              {/* Bottom Panel: JSON Stringified */}
              <ResizablePanel defaultSize={30} minSize={10}>
                <ScrollArea className="h-full">
                  <div className="p-6 max-w-none text-sm font-mono">
                    {selectedHistoryIndex !== null && (
                      <pre>{JSON.stringify(JSON.parse(history[selectedHistoryIndex].jsonStringified), null, 2)}</pre>
                    )}
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm File Upload</AlertDialogTitle>
            <AlertDialogDescription>
              {subtitles.length > 0
                ? "Uploading a new file will replace the current subtitles.  Are you sure you want to continue?"
                : "Are you sure you want to upload this file?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={processFile}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Context Confirmation Dialog */}
      <AlertDialog open={isContextUploadDialogOpen} onOpenChange={setIsContextUploadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Context Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to upload this context file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContextCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={processContextFile}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
