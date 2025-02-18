"use client"

import { memo, useState, useRef, useCallback, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { File, XCircle, ArrowUpCircle, ArrowDownCircle, Upload, Save, Play, Square } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Subtitle, SubtitleNoTime } from "@/types/types"
import { isASS, isSRT, removeTimestamp } from "@/lib/ass/subtitle-utils"
import { parseASS } from "@/lib/ass/parse"
import { parseSRT } from "@/lib/srt/parse"


interface FileItem {
  id: string
  name: string
  content: string
}

interface ModelSettings {
  apiKey: string
  customBaseUrl: string
  customModel: string
  useCustomModel: boolean
}

interface ContextExtractorProps { }

export const ContextExtractor = memo(({ }: ContextExtractorProps) => {
  const [episodeNumber, setEpisodeNumber] = useState("")
  const [subtitleContent, setSubtitleContent] = useState("")
  const [previousContext, setPreviousContext] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [contextResult, setContextResult] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)

  const [useCustomModel, setUseCustomModel] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [customBaseUrl, setCustomBaseUrl] = useState("")
  const [customModel, setCustomModel] = useState("")
  const [activeTab, setActiveTab] = useState("result")


  const abortControllerRef = useRef<AbortController | null>(null)
  const contextResultRef = useRef<HTMLTextAreaElement | null>(null)

  // Load model settings from local storage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("modelSettings")
    if (savedSettings) {
      const { apiKey, customBaseUrl, customModel, useCustomModel }: ModelSettings = JSON.parse(savedSettings)
      setApiKey(apiKey)
      setCustomBaseUrl(customBaseUrl)
      setCustomModel(customModel)
      setUseCustomModel(useCustomModel)
    }
  }, [])

  const handleSubtitleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubtitleContent(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [])

  const handlePreviousContextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPreviousContext(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles: FileItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const text = await file.text()
      newFiles.push({
        id: `${Date.now()}-${i}`, // Unique ID
        name: file.name,
        content: text,
      })
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])

    // Reset the input
    event.target.value = ""
  }

  const removeFile = (id: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))
  }

  const moveFileUp = (index: number) => {
    if (index > 0) {
      setSelectedFiles((prevFiles) => {
        const newFiles = [...prevFiles]
          ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
        return newFiles
      })
    }
  }

  const moveFileDown = (index: number) => {
    if (index < selectedFiles.length - 1) {
      setSelectedFiles((prevFiles) => {
        const newFiles = [...prevFiles]
          ;[newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]]
        return newFiles
      })
    }
  }

  const handleStartExtraction = async () => {
    if (isExtracting) return
    setIsExtracting(true)
    setContextResult("")

    abortControllerRef.current = new AbortController()

    let buffer = ""

    try {
      let parsed: Subtitle[]
      if (subtitleContent.trim() === "") {
        throw new Error("Empty content")
      } else if (isASS(subtitleContent)) {
        parsed = parseASS(subtitleContent).subtitles
      } else if (isSRT(subtitleContent)) {
        parsed = parseSRT(subtitleContent)
      } else {
        throw new Error("Invalid subtitle content")
      }
      const subtitles: SubtitleNoTime[] = removeTimestamp(parsed)

      const requestBody = {
        input: {
          episode: Number(episodeNumber),
          subtitles: subtitles,
          previous_context: previousContext,
        },
        baseURL: useCustomModel ? customBaseUrl : undefined,
        model: useCustomModel ? customModel : "deepseek",
        maxCompletionTokens: 8192,
      }

      const res = await fetch("http://localhost:4000/api/stream/extract-context", {
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
        setContextResult(buffer)
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted")
        setContextResult((prev) => prev + "\n\n[Generation stopped by user]")
      } else {
        console.error("Error:", error)
        setContextResult((prev) => prev + `\n\n[An error occurred: ${error instanceof Error ? error.message : error}]`)
      }
    } finally {
      setIsExtracting(false)
      abortControllerRef.current = null
    }
  }

  const handleStopExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleSaveToFile = () => {
    const blob = new Blob([contextResult], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `context-${episodeNumber || "result"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const ModelSelection = useCallback(() => {
    return (
      <>
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
      </>
    )
  }, [apiKey, customBaseUrl, customModel, useCustomModel, setApiKey, setCustomBaseUrl, setCustomModel, setUseCustomModel])

  return (
    <div className="grid lg:grid-cols-2 gap-6 container mx-auto py-4 px-4 mt-2 mb-6 max-w-5xl">
      {/* Left Pane */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Episode Number</label>
          <Input
            value={episodeNumber}
            onChange={(e) => setEpisodeNumber(e.target.value)}
            placeholder="e.g., S01E01"
            className="bg-background dark:bg-muted/30"
          />
        </div>

        {!isBatchMode && ( // Show single-mode inputs when isBatchMode is false
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtitle Content</label>
              <Textarea
                value={subtitleContent}
                onChange={handleSubtitleContentChange}
                className="min-h-[208px] h-[208px] max-h-[40vh] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                placeholder="Paste subtitle content here..."
                onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Previous Context</label>
              <Textarea
                value={previousContext}
                onChange={handlePreviousContextChange}
                className="min-h-[100px] h-[100px] max-h-[30vh] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                placeholder="Paste previous context here..."
                onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
              />
            </div>
          </>
        )}

        {isBatchMode && ( // Show batch-mode inputs when isBatchMode is true
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Subtitle Files</label>
              <input
                type="file"
                multiple
                accept=".srt,.ass,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="subtitle-files-upload"
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => document.getElementById("subtitle-files-upload")?.click()}
              >
                <Upload className="h-4 w-4" />
                Select Files
              </Button>
            </div>

            <ScrollArea className="h-[340px] border rounded-md">
              <div className="space-y-1 p-2">
                {selectedFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between border rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveFileUp(index)}>
                        <ArrowUpCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveFileDown(index)}>
                        <ArrowDownCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Right Pane */}
      <div className="flex flex-col h-full">
        <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="flex-grow space-y-4 mt-4">
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className="p-4 space-y-4">
                <ModelSelection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="flex-grow space-y-4 mt-4">
            <div className="space-y-2">
              <Textarea
                ref={contextResultRef}
                value={contextResult.trim()}
                readOnly
                className="min-h-[420px] h-[420px] max-h-[80vh] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                placeholder="Extracted context will appear here..."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Controls */}
      <div className="lg:col-span-2 flex items-center justify-center gap-4">
        <Button className="gap-2" onClick={handleStartExtraction} disabled={isExtracting || isBatchMode}>
          {isExtracting ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Extracting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Extraction
            </>
          )}
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleStopExtraction} disabled={!isExtracting}>
          <Square className="h-4 w-4" />
          Stop
        </Button>

        <div className="flex items-center space-x-2">
          <Switch id="batch-mode" checked={isBatchMode} onCheckedChange={setIsBatchMode} /> {/* Changed ID and checked prop */}
          <label htmlFor="batch-mode" className="text-sm font-medium">
            Batch Mode
          </label>
        </div>

        <Button variant="secondary" className="gap-2" onClick={handleSaveToFile}>
          <Save className="h-4 w-4" />
          Save to File
        </Button>
      </div>
    </div>
  )
})
