"use client"

import { useState, useEffect } from "react"
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
import { Save, Globe2, Timer, MessageSquare, Play, Square, Download } from "lucide-react"
import { Navbar } from "./navbar"
import { TranslationProcess } from "./translation-process"

interface Subtitle {
  index: number
  startTime: string
  endTime: string
  content: string
  translated: string
}

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [title, setTitle] = useState("Blue.Box.S01E19")
  const [temperature, setTemperature] = useState(0.6)
  const [prompt, setPrompt] = useState("")
  const [contextDocument, setContextDocument] = useState("")
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
  ])
  const [apiKey, setApiKey] = useState("")
  const [splitSize, setSplitSize] = useState(150)
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [customBaseUrl, setCustomBaseUrl] = useState("")
  const [customModel, setCustomModel] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("japanese")
  const [targetLanguage, setTargetLanguage] = useState("indonesian")
  const [processLog, setProcessLog] = useState<string>([
    "Initializing translation process...",
    "Loading source subtitles...",
    "Analyzing context...",
    "Translating subtitle 1: '(生徒A)ぶつけるなよ'",
    "AI: Analyzing the context and cultural nuances...",
    "AI: Considering the appropriate tone for a student's dialogue...",
    "AI: Translating to Indonesian...",
    "AI: Finalizing translation: '(Siswa A) Jangan sampai menabrak!'",
    "Translating subtitle 2: '(生徒B)もっと 右右'",
    "AI: Analyzing the directional instruction...",
    "AI: Ensuring the translation maintains the urgency of the original...",
    "AI: Translating to Indonesian...",
    "AI: Finalizing translation: '(Siswa B) Lebih ke kanan lagi!'",
    "Translating subtitle 3: '(生徒C)上げるぞ'",
    "AI: Interpreting the context of the action...",
    "AI: Considering the appropriate level of formality...",
    "AI: Translating to Indonesian...",
    "AI: Finalizing translation: '(Siswa C) Ayo angkat!'",
    "Translation process completed.",
  ].join('\n'))
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState(0)

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

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold h-12"
                />
              </div>
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

                <ScrollArea className="h-[calc(100vh-50px)] pr-4">
                  <div className="space-y-4">
                    {subtitles.map((subtitle) => (
                      <Card
                        key={subtitle.index}
                        className="border border-border bg-card text-card-foreground group relative hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground">#{subtitle.index}</span>
                              <div className="flex items-center gap-2 text-sm">
                                <Timer className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  value={subtitle.startTime}
                                  onChange={(e) => updateSubtitle(subtitle.index, "startTime", e.target.value)}
                                  className="h-7 w-32 bg-background dark:bg-muted/30"
                                />
                                <span className="text-muted-foreground">→</span>
                                <Input
                                  value={subtitle.endTime}
                                  onChange={(e) => updateSubtitle(subtitle.index, "endTime", e.target.value)}
                                  className="h-7 w-32 bg-background dark:bg-muted/30"
                                />
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
                                className="min-h-[30px] max-h-[120px] bg-muted/50 dark:bg-muted/30 overflow-y-auto"
                              />
                              <Textarea
                                value={subtitle.translated}
                                onChange={(e) => {
                                  updateSubtitle(subtitle.index, "translated", e.target.value)
                                  e.target.style.height = "auto"
                                  e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
                                }}
                                placeholder="Translated text"
                                className="min-h-[30px] max-h-[120px]"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setIsTranslating(true)
                      console.log("Start Translation")
                      // Simulate translation progress
                      const interval = setInterval(() => {
                        setProgress((prev) => {
                          if (prev >= 100) {
                            clearInterval(interval)
                            setIsTranslating(false)
                            return 100
                          }
                          return prev + 10
                        })
                      }, 1000)
                    }}
                    disabled={isTranslating}
                  >
                    {isTranslating ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Translating... {progress}%
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
                    onClick={() => {
                      setIsTranslating(false)
                      setProgress(0)
                      console.log("Stop Translation")
                    }}
                    disabled={!isTranslating}
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </div>
                <Button
                  className="w-full mt-2 gap-2"
                  variant="secondary"
                  onClick={() => console.log("Download Subtitles")}
                  disabled={isTranslating || progress < 100}
                >
                  <Download className="h-4 w-4" />
                  Download Translated Subtitles
                </Button>
              </div>

              {/* Right Column - Settings */}
              <div className="flex flex-col h-full">
                <Tabs defaultValue="basic" className="w-full">
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
                    <TranslationProcess processLog={processLog} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

