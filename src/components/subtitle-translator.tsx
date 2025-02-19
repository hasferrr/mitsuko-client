"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Globe2, MessageSquare, Play, Square, Download, Upload, FileText } from "lucide-react"
import { SubtitleList } from "./subtitle-list"
import {
  LanguageSelection,
  ModelSelection,
  ContextDocumentInput,
  TemperatureSlider,
  SplitSizeInput,
  SystemPromptInput,
  ProcessOutput,
} from "./settings-inputs"
import { ASSParseOutput, Subtitle, SubtitleMinimal, SubtitleTranslated } from "@/types/types"
import { parseSRT } from "@/lib/srt/parse"
import { parseASS } from "@/lib/ass/parse"
import { generateSRT } from "@/lib/srt/generate"
import { mergeASSback } from "@/lib/ass/merge"
import { capitalizeWords } from "@/lib/utils"
import { parseTranslationJson } from "@/lib/parser"
import { useSubtitleStore } from "@/stores/useSubtitleStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useAdvancedSettingsStore } from "@/stores/useAdvancedSettingsStore"


interface Parsed {
  type: "srt" | "ass"
  data: ASSParseOutput | null
}

export default function SubtitleTranslator() {
  // Subtitle Store
  const title = useSubtitleStore((state) => state.title)
  const setTitle = useSubtitleStore((state) => state.setTitle)
  const subtitles = useSubtitleStore((state) => state.subtitles)
  const setSubtitles = useSubtitleStore((state) => state.setSubtitles)

  // Settings Store
  const sourceLanguage = useSettingsStore((state) => state.sourceLanguage)
  const targetLanguage = useSettingsStore((state) => state.targetLanguage)
  const useCustomModel = useSettingsStore((state) => state.useCustomModel)
  const apiKey = useSettingsStore((state) => state.apiKey)
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl)
  const customModel = useSettingsStore((state) => state.customModel)
  const contextDocument = useSettingsStore((state) => state.contextDocument)

  // Advanced Settings Store
  const temperature = useAdvancedSettingsStore((state) => state.temperature)
  const splitSize = useAdvancedSettingsStore((state) => state.splitSize)
  const prompt = useAdvancedSettingsStore((state) => state.prompt)

  const [isTranslating, setIsTranslating] = useState(false)
  const [response, setResponse] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [parsed, setParsed] = useState<Parsed>({ type: "srt", data: null })
  const [jsonResponse, setJsonResponse] = useState<SubtitleMinimal[]>([])

  const hasChanges = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadSubtitleData = () => {
      const storedSubtitleData = localStorage.getItem('subtitle-storage')
      if (storedSubtitleData) {
        const parsedData = JSON.parse(storedSubtitleData)
        useSubtitleStore.setState(parsedData) // Use setState to merge
      }
    }

    const loadSettingsData = () => {
      const storedSettingsData = localStorage.getItem('settings-storage')
      if (storedSettingsData) {
        const parsedData = JSON.parse(storedSettingsData)
        useSettingsStore.setState(parsedData) // Use setState to merge
      }
    }

    const loadAdvancedSettingsData = () => {
      const storedAdvancedSettingsData = localStorage.getItem('advanced-settings')
      if (storedAdvancedSettingsData) {
        const parsedData = JSON.parse(storedAdvancedSettingsData)
        useAdvancedSettingsStore.setState(parsedData) // Use setState to merge
      }
    }

    loadSubtitleData()
    loadSettingsData()
    loadAdvancedSettingsData()
  }, []) // Empty dependency array ensures this runs only once on mount


  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges.current) event.preventDefault()
    }
    if (hasChanges.current) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasChanges.current])

  const handleStartTranslation = async () => {
    if (isTranslating) return
    setIsTranslating(true)
    setResponse("")
    setJsonResponse([]) // Clear previous parsed output
    hasChanges.current = true

    // Create a new AbortController
    abortControllerRef.current = new AbortController()

    // Set the active tab to "process"
    setActiveTab("process")

    // Scroll to top with fallback
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    let buffer = ""
    try {
      const requestBody = {
        subtitles: subtitles.map((s) => ({
          index: s.index,
          actor: s.actor,
          content: s.content,
        })),
        sourceLanguage,
        targetLanguage,
        contextDocument,
        baseURL: useCustomModel ? customBaseUrl : undefined, // Include base URL if custom model
        model: useCustomModel ? customModel : "deepseek", // Choose model based on user selection
        temperature,
        maxCompletionTokens: 8192,
        contextMessage: [],
      }

      const res = await fetch("http://localhost:4000/api/stream/translate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal, // Connect to abort signal
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error details from server:", errorData)
        throw new Error(`Request failed (${res.status}), ${JSON.stringify(errorData.details) || errorData.error}`)
      }

      const reader = res.body?.getReader()
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        buffer += chunk
        setResponse(buffer)
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted")
        setResponse((prev) => prev + "\n\n[Generation stopped by user]")
      } else {
        console.error("Error:", error)
        setResponse((prev) => prev + `\n\n[An error occurred: ${error instanceof Error ? error.message : error}]`)
      }
    } finally {
      setTimeout(() => setIsTranslating(false), 500)
      abortControllerRef.current = null

      let parsedResponse: SubtitleMinimal[] = []
      try {
        console.log(buffer)
        parsedResponse = parseTranslationJson(buffer)
      } catch {
        console.error('Failed to parse')
      }

      if (parsedResponse.length > 0) {
        setJsonResponse(parsedResponse)
        const updatedSubtitles = subtitles.map(subtitle => {
          const translated = parsedResponse.find(item => item.index === subtitle.index)
          return translated ? { ...subtitle, translated: translated.content } : subtitle
        })
        setSubtitles(updatedSubtitles)
      }
    }
  }

  const handleStopTranslation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort() // Trigger abort signal
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const type = file.name.endsWith(".srt") ? "srt" : "ass"

      let parsedSubs
      let subtitles
      if (type === "srt") {
        parsedSubs = parseSRT(text)
        subtitles = parsedSubs
        setParsed({ type, data: null })
      } else {
        parsedSubs = parseASS(text)
        subtitles = parsedSubs.subtitles
        setParsed({ type, data: parsedSubs })
      }

      const parsedSubtitles: SubtitleTranslated[] = subtitles.map((subtitle) => ({
        ...subtitle,
        translated: "",
      }))

      setSubtitles(parsedSubtitles)
      setTitle(file.name)
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


  const handleSaveProject = () => {
    // Save Subtitle Store
    localStorage.setItem('subtitle-storage', JSON.stringify({
      title: useSubtitleStore.getState().title,
      subtitles: useSubtitleStore.getState().subtitles,
    }))

    // Save Settings Store
    localStorage.setItem('settings-storage', JSON.stringify({
      sourceLanguage: useSettingsStore.getState().sourceLanguage,
      targetLanguage: useSettingsStore.getState().targetLanguage,
      useCustomModel: useSettingsStore.getState().useCustomModel,
      apiKey: useSettingsStore.getState().apiKey,
      customBaseUrl: useSettingsStore.getState().customBaseUrl,
      customModel: useSettingsStore.getState().customModel,
      contextDocument: useSettingsStore.getState().contextDocument,
    }))

    // Save Advanced Settings Store
    localStorage.setItem('advanced-settings', JSON.stringify({
      temperature: useAdvancedSettingsStore.getState().temperature,
      splitSize: useAdvancedSettingsStore.getState().splitSize,
      prompt: useAdvancedSettingsStore.getState().prompt,
    }))

    console.log("Project Saved!")
  }

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
        <input type="file" accept=".srt,.ass" onChange={handleFileUpload} className="hidden" id="subtitle-upload" />
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => document.getElementById("subtitle-upload")?.click()}
        >
          <Upload className="h-5 w-5" />
          Upload File
        </Button>
        <Button onClick={handleSaveProject} size="lg" className="gap-2">
          <Save className="h-5 w-5" />
          Save Project
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left Column - Subtitles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <Globe2 className="h-4 w-4" /> {capitalizeWords(sourceLanguage)} → {capitalizeWords(targetLanguage)}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="h-4 w-4" /> {subtitles.length} Lines
            </Badge>
            <div className="flex-1" />
          </div>

          <SubtitleList />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button className="gap-2" onClick={handleStartTranslation} disabled={isTranslating}>
              {isTranslating ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Translating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Translation
                </>
              )}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleStopTranslation} disabled={!isTranslating}>
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>

          <Link href="/extract-context" className="w-full mt-2 gap-2 inline-flex items-center justify-center">
            <Button
              variant="outline"
              className="w-full gap-2"
            >
              <FileText className="h-4 w-4" />
              Extract Context from Subtitle
            </Button>
          </Link>

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
                  <SplitSizeInput />
                  <SystemPromptInput />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="process" className="flex-grow space-y-4 mt-4">
              <ProcessOutput
                response={response}
                jsonResponse={jsonResponse}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
