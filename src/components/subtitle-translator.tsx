"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, Globe2, Timer, MessageSquare, Play, Square, Download, Upload } from "lucide-react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"

interface Subtitle {
  index: number
  startTime: string
  endTime: string
  content: string
  translated: string
}

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [title, setTitle] = useState("Blue.Box.S01E19")
  const [subtitles, setSubtitles] = useState<Subtitle[]>([
    {
      index: 1,
      startTime: "00:00:11,803",
      endTime: "00:00:13,263",
      content: "(生徒A)ぶつけるなよ",
      translated: "(Siswa A) Jangan sampai menabrak!",
    },
    {
      index: 2,
      startTime: "00:00:14,472",
      endTime: "00:00:15,765",
      content: "(生徒B)もっと 右右",
      translated: "(Siswa B) Lebih ke kanan lagi!",
    },
    {
      index: 3,
      startTime: "00:00:16,266",
      endTime: "00:00:17,308",
      content: "(生徒C)上げるぞ",
      translated: "(Siswa C) Ayo angkat!",
    },
    {
      index: 4,
      startTime: "00:00:29,404",
      endTime: "00:00:30,447",
      content: "(生徒たち)せ~の!",
      translated: "",
    },
    {
      index: 5,
      startTime: "00:00:44,419",
      endTime: "00:00:45,587",
      content: "(クラスメイトたち)わあ...",
      translated: "",
    },
  ])

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const updateSubtitle = (index: number, field: keyof Subtitle, value: string | number) => {
    setSubtitles(subtitles.map((subtitle) => (subtitle.index === index ? { ...subtitle, [field]: value } : subtitle)))
  }

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

      if (!res.ok) throw new Error("Request failed")

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
      // Basic SRT parsing
      const subtitleBlocks = text.trim().split("\n\n")
      const parsedSubtitles: Subtitle[] = subtitleBlocks.map((block) => {
        const lines = block.split("\n")
        const index = Number.parseInt(lines[0])
        const [startTime, endTime] = lines[1].split(" --> ")
        const content = lines.slice(2).join("\n")

        return {
          index,
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          content: content.trim(),
          translated: "",
        }
      })

      setSubtitles(parsedSubtitles)
      setTitle(file.name.replace(".srt", ""))
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
              <input type="file" accept=".srt" onChange={handleFileUpload} className="hidden" id="subtitle-upload" />
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => document.getElementById("subtitle-upload")?.click()}
              >
                <Upload className="h-5 w-5" />
                Upload SRT
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

                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {subtitles.map((subtitle) => (
                      <Card
                        key={subtitle.index + "-" + subtitle.startTime}
                        className="border border-border bg-card text-card-foreground group relative hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground">#{subtitle.index}</span>
                              <div className="flex items-center gap-2 text-sm">
                                <Timer className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{subtitle.startTime}</span>
                                <span className="text-sm text-muted-foreground">➝</span>
                                <span className="text-sm text-muted-foreground">{subtitle.endTime}</span>
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Textarea
                                value={subtitle.content}
                                onChange={(e) => {
                                  updateSubtitle(subtitle.index, "content", e.target.value)
                                  e.target.style.height = "auto"
                                  e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
                                }}
                                placeholder="Original text"
                                className="min-h-[35px] max-h-[120px] bg-muted/50 dark:bg-muted/30 resize-none overflow-y-hidden"
                                rows={1}
                              />
                              <Textarea
                                value={subtitle.translated}
                                onChange={(e) => {
                                  updateSubtitle(subtitle.index, "translated", e.target.value)
                                  e.target.style.height = "auto"
                                  e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
                                }}
                                placeholder="Translated text"
                                className="min-h-[35px] max-h-[120px] resize-none overflow-y-hidden"
                                rows={1}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
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
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Source Language</label>
                            <Select defaultValue="japanese" onValueChange={setSourceLanguage}>
                              <SelectTrigger className="bg-background dark:bg-muted/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="japanese">Japanese</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="korean">Korean</SelectItem>
                                <SelectItem value="chinese">Chinese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Target Language</label>
                            <Select defaultValue="indonesian" onValueChange={setTargetLanguage}>
                              <SelectTrigger className="bg-background dark:bg-muted/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="indonesian">Indonesian</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="japanese">Japanese</SelectItem>
                                <SelectItem value="korean">Korean</SelectItem>
                                <SelectItem value="chinese">Chinese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Model</label>
                          <Select defaultValue="deepseek" disabled={useCustomModel}>
                            <SelectTrigger className="bg-background dark:bg-muted/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="deepseek">DeepSeek-R1</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch id="custom-model" checked={useCustomModel} onCheckedChange={setUseCustomModel} />
                          <label htmlFor="custom-model" className="text-sm font-medium">
                            Use Custom Model
                          </label>
                        </div>

                        {useCustomModel && (
                          <div className="space-y-4 pt-2">
                            <Input
                              value={customBaseUrl}
                              onChange={(e) => setCustomBaseUrl(e.target.value)}
                              placeholder="Base URL"
                              className="bg-background dark:bg-muted/30"
                            />
                            <Input
                              value={customModel}
                              onChange={(e) => setCustomModel(e.target.value)}
                              placeholder="Model Name"
                              className="bg-background dark:bg-muted/30"
                            />
                            <Input
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="API Key"
                              className="bg-background dark:bg-muted/30"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Context Document</label>
                          <Textarea
                            value={contextDocument}
                            onChange={(e) => {
                              setContextDocument(e.target.value)
                              e.target.style.height = "auto"
                              e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
                            }}
                            className="min-h-[120px] max-h-[900px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                            placeholder="Add context about the video..."
                            onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
                    <Card className="border border-border bg-card text-card-foreground">
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-sm font-medium">Temperature</label>
                              <span className="text-sm text-muted-foreground">{temperature}</span>
                            </div>
                            <Slider
                              value={[temperature]}
                              onValueChange={([value]) => setTemperature(value)}
                              max={1.3}
                              step={0.1}
                              className="py-2"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Split Size</label>
                            <Input
                              disabled
                              type="number"
                              value={splitSize}
                              onChange={(e) => {
                                const value = Number(e.target.value)
                                setSplitSize(Math.max(0, Math.min(500, value)))
                              }}
                              min={0}
                              max={500}
                              className="bg-background dark:bg-muted/30"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">System Prompt</label>
                            <Textarea
                              disabled
                              value={prompt}
                              onChange={(e) => {
                                setPrompt(e.target.value)
                                e.target.style.height = "auto"
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
                              }}
                              className="min-h-[120px] max-h-[900px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                              placeholder="Enter translation instructions..."
                              onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="process" className="flex-grow space-y-4 mt-4">
                    <Textarea
                      ref={textareaRef}
                      value={response.trim()}
                      readOnly
                      className="h-[500px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                      placeholder="Translation output will appear here..."
                    />
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

