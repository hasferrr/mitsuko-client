"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Globe2, MessageSquare, Play, Square, Download, Upload } from "lucide-react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
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
import { Subtitle, SubtitleTranslated, UpdateSubtitle } from "@/types/types"
import { initialSubtitles } from "@/lib/dummy"
import { parseSRT } from "@/lib/srt/parse"
import { parseASS } from "@/lib/ass/parse"

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [title, setTitle] = useState("Blue.Box.S01E19")
  const [subtitles, setSubtitles] = useState<SubtitleTranslated[]>(initialSubtitles)

  const [sourceLanguage, setSourceLanguage] = useState("japanese")
  const [targetLanguage, setTargetLanguage] = useState("indonesian")
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [customBaseUrl, setCustomBaseUrl] = useState("")
  const [customModel, setCustomModel] = useState("")
  const [contextDocument, setContextDocument] = useState("")

  const [temperature, setTemperature] = useState(0.6)
  const [splitSize, setSplitSize] = useState(500)
  const [prompt, setPrompt] = useState("")

  const [isTranslating, setIsTranslating] = useState(false)
  const [response, setResponse] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (textareaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = textareaRef.current
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100

      if (isAtBottom) {
        textareaRef.current.scrollTop = scrollHeight
      }
    }
  }, [response])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const updateSubtitle: UpdateSubtitle = useCallback((index, field, value) => {
    setSubtitles((prevSubtitles) =>
      prevSubtitles.map((subtitle) =>
        subtitle.index === index ? { ...subtitle, [field]: value } : subtitle
      )
    )
  }, [])

  const handleSave = () => {
    console.log("Saving:", { title, subtitles })
  }

  const handleStartTranslation = async () => {
    if (isTranslating) return
    setIsTranslating(true)
    setResponse("")

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

    try {
      const requestBody = {
        subtitles: subtitles.map((s) => ({
          index: s.index,
          actor: "",
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
        setResponse((prev) => prev + chunk)
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
      setIsTranslating(false)
      abortControllerRef.current = null
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
      const subtitles: Subtitle[] = file.name.endsWith(".srt")
        ? parseSRT(text)
        : parseASS(text).subtitles
      const parsedSubtitles = subtitles.map((subtitle) => ({
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

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="container mx-auto py-4 px-4 mb-6">
          <div className="flex flex-col gap-4 max-w-5xl mx-auto">
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
              <Button onClick={handleSave} size="lg" className="gap-2">
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
                    <Globe2 className="h-4 w-4" /> {sourceLanguage} → {targetLanguage}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <MessageSquare className="h-4 w-4" /> {subtitles.length} Lines
                  </Badge>
                  <div className="flex-1" />
                </div>

                <SubtitleList subtitles={subtitles} updateSubtitle={updateSubtitle} />

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
                  <Button variant="outline" className="gap-2" onClick={handleStopTranslation} disabled={!isTranslating || !response}>
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </div>
                <Button
                  className="w-full mt-2 gap-2"
                  variant="secondary"
                  onClick={() => console.log("Download Subtitles")}
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
                        <LanguageSelection
                          sourceLanguage={sourceLanguage}
                          setSourceLanguage={setSourceLanguage}
                          targetLanguage={targetLanguage}
                          setTargetLanguage={setTargetLanguage}
                        />
                        <ModelSelection
                          useCustomModel={useCustomModel}
                          setUseCustomModel={setUseCustomModel}
                          customBaseUrl={customBaseUrl}
                          setCustomBaseUrl={setCustomBaseUrl}
                          customModel={customModel}
                          setCustomModel={setCustomModel}
                          apiKey={apiKey}
                          setApiKey={setApiKey}
                        />
                        <ContextDocumentInput contextDocument={contextDocument} setContextDocument={setContextDocument} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
                    <Card className="border border-border bg-card text-card-foreground">
                      <CardContent className="p-4 space-y-4">
                        <TemperatureSlider temperature={temperature} setTemperature={setTemperature} />
                        <SplitSizeInput splitSize={splitSize} setSplitSize={setSplitSize} />
                        <SystemPromptInput prompt={prompt} setPrompt={setPrompt} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="process" className="flex-grow space-y-4 mt-4">
                    <ProcessOutput response={response} textareaRef={textareaRef} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

