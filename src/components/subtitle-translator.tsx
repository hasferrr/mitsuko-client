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
import { capitalizeWords } from "@/lib/utils"
import { useSubtitleStore } from "@/stores/use-subtitle-store"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
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
import { initialSubtitles, initialTitle } from "@/lib/dummy"

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
  const useCustomModel = useSettingsStore((state) => state.useCustomModel)
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl)
  const customModel = useSettingsStore((state) => state.customModel)
  const apiKey = useSettingsStore((state) => state.apiKey)
  const contextDocument = useSettingsStore((state) => state.contextDocument)

  // Advanced Settings Store
  const temperature = useAdvancedSettingsStore((state) => state.temperature)
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.maxCompletionTokens)
  const splitSize = useAdvancedSettingsStore((state) => state.splitSize)
  const startIndex = useAdvancedSettingsStore((state) => state.startIndex)

  // Translation Store
  const isTranslating = useTranslationStore((state) => state.isTranslating)
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)
  const translateSubtitles = useTranslationStore((state) => state.translateSubtitles)
  const stopTranslation = useTranslationStore((state) => state.stopTranslation)
  const setJsonResponse = useTranslationStore((state) => state.setJsonResponse)
  const appendJsonResponse = useTranslationStore((state) => state.appendJsonResponse)

  const [activeTab, setActiveTab] = useState(isTranslating ? "process" : "basic")

  const { setHasChanges } = useBeforeUnload()

  useEffect(() => {
    const key = useSubtitleStore.persist.getOptions().name
    if (key && !localStorage.getItem(key) && isInitRef.current) {
      setTitle(initialTitle)
      setSubtitles(initialSubtitles)
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

    // Split subtitles into chunks, starting from startIndex - 1
    const subtitleChunks: SubtitleNoTime[][] = []
    const size = Math.max(splitSize, 10)
    for (let i = Math.max(startIndex - 1, 0); i < subtitles.length; i += size) {
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
        content: subtitles.slice(0, startIndex - 1).map((chunk) => ({
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
        baseURL: useCustomModel ? customBaseUrl : undefined,
        model: useCustomModel ? customModel : "deepseek",
        temperature,
        maxCompletionTokens,
        contextMessage: context,
      }

      let tlChunk: SubOnlyTranslated[] = []
      try {
        tlChunk = await translateSubtitles(requestBody, apiKey)
      } catch {
        setIsTranslating(false)
        break
      }

      if (tlChunk.length) {
        appendJsonResponse(tlChunk)

        // Adjust index based on startIndex
        const adjustedStartIndex = Math.max(startIndex - 1, 0)
        const merged: SubtitleTranslated[] = [...subtitles]

        /**
         * Merge translated chunk with original subtitles
         *
         * Example:
         * startIndex = 4
         * adjustedStartIndex = 4 - 1 = 3
         *
         * tlChunk =      [4,5,6,7,8]
         *             j = 0 1 2 3 4   <-- j is the index of tlChunk
         * merged = [1,2,3,4,5,6,7,8,9]
         *           0 1 2 3 4 5 6 7 8 <-- index of merged
         * originalIndex = 3 4 5 6 7   <-- index of merged
         *
         * FOR LOOP:
         * - 1ST ITERATION
         * originalIndex = 3 + 0 = 3
         * merged[3] = tlChunk[0]
         * - 2ND ITERATION
         * originalIndex = 3 + 1 = 4
         * merged[4] = tlChunk[1]
         * ...
         * - NTH ITERATION
         * originalIndex = 3 + N = 3 + N
         * merged[3 + N] = tlChunk[N]
         */
        for (let j = 0; j < tlChunk.length; j++) {
          const originalIndex = adjustedStartIndex + j
          if (originalIndex < subtitles.length) {
            merged[originalIndex] = {
              ...merged[originalIndex],
              translated: tlChunk[j]?.translated || merged[originalIndex].translated,
            }
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
  }

  const handleStopTranslation = () => {
    stopTranslation()
    setIsTranslating(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const type = file.name.endsWith(".srt") ? "srt" : "ass"

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
      const fileName = file.name.split('.')
      fileName.pop()
      setTitle(fileName.join('.'))
    } catch (error) {
      console.error("Error parsing subtitle file:", error)
    }

    // Reset the input
    event.target.value = ""
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

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto container py-4 px-4 mb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1">
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
        <Button onClick={handleSaveProject} size="lg" className="gap-2" disabled>
          <Save className="h-5 w-5" />
          Save Project
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
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

          <SubtitleList />

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
                  <ContextDocumentInput />
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
    </div>
  )
}
