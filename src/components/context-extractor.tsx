"use client"

import { useState, useRef, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { File, XCircle, ArrowUpCircle, ArrowDownCircle, Upload, Save, Play, Square, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Subtitle, SubtitleNoTime } from "@/types/types"
import { isASS, isSRT, removeTimestamp } from "@/lib/ass/subtitle-utils"
import { parseASS } from "@/lib/ass/parse"
import { parseSRT } from "@/lib/srt/parse"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { useBeforeUnload } from "@/hooks/use-before-unload"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useExtractionStore } from "@/stores/use-extraction-store"
import { useExtractionInputStore } from "@/stores/use-extraction-input-store"


interface FileItem {
  id: string
  name: string
  content: string
}

export const ContextExtractor = () => {
  const [activeTab, setActiveTab] = useState("result")

  // Get state and setters from useSettingsStore
  const useCustomModel = useSettingsStore((state) => state.useCustomModel)
  const setUseCustomModel = useSettingsStore((state) => state.setUseCustomModel)
  const apiKey = useSettingsStore((state) => state.apiKey)
  const setApiKey = useSettingsStore((state) => state.setApiKey)
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl)
  const setCustomBaseUrl = useSettingsStore((state) => state.setCustomBaseUrl)
  const customModel = useSettingsStore((state) => state.customModel)
  const setCustomModel = useSettingsStore((state) => state.setCustomModel)

  // Extraction Store
  const contextResult = useExtractionStore((state) => state.contextResult)
  const isExtracting = useExtractionStore((state) => state.isExtracting)
  const extractContext = useExtractionStore((state) => state.extractContext)
  const stopExtraction = useExtractionStore((state) => state.stopExtraction)

  const contextResultRef = useRef<HTMLTextAreaElement | null>(null)

  const { setHasChanges } = useBeforeUnload()
  useAutoScroll(contextResult, contextResultRef)

  const {
    episodeNumber,
    subtitleContent,
    previousContext,
    selectedFiles,
    isBatchMode,
    setEpisodeNumber,
    setSubtitleContent,
    setPreviousContext,
    setSelectedFiles,
    setIsBatchMode,
  } = useExtractionInputStore()


  const handleSubtitleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setSubtitleContent(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [setHasChanges, setSubtitleContent])

  const handlePreviousContextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setPreviousContext(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [setHasChanges, setPreviousContext])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setHasChanges(true)

    if (isBatchMode) {
      // Batch Mode Logic (Existing)
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
      setSelectedFiles([...selectedFiles, ...newFiles])
    } else {
      // Single File Logic (For Subtitle Content)
      const file = files[0]
      const text = await file.text()
      setSubtitleContent(text)
      // Trigger resize
      const textarea = document.getElementById("subtitle-content-textarea") as HTMLTextAreaElement
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = `${Math.min(textarea.scrollHeight, 900)}px`
      }
    }

    // Reset the input
    event.target.value = ""
  }

  const removeFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.id !== id))
  }

  const moveFileUp = (index: number) => {
    if (index > 0) {
      const newFiles = [...selectedFiles]
      ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
      setSelectedFiles(newFiles)
    }
  }

  const moveFileDown = (index: number) => {
    if (index < selectedFiles.length - 1) {
      const newFiles = [...selectedFiles]
      ;[newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]]
      setSelectedFiles(newFiles)
    }
  }

  const handleStartExtraction = async () => {
    if (isExtracting) return

    setActiveTab("result")

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)


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

    extractContext(requestBody, apiKey)
  }

  const handleSaveToFile = () => {
    const text = contextResult.trim()
    if (!text) return

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `context-${episodeNumber || "result"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 container mx-auto py-4 px-4 mt-2 mb-6 max-w-5xl">
      {/* Left Pane */}
      <div className="space-y-2">
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Subtitle Content</label>
                <input
                  type="file"
                  accept=".srt,.ass,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="subtitle-content-upload"
                />
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => document.getElementById("subtitle-content-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              <Textarea
                id="subtitle-content-textarea"
                value={subtitleContent}
                onChange={handleSubtitleContentChange}
                className="min-h-[208px] h-[208px] max-h-[208px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                placeholder="Paste subtitle content here..."
                onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Previous Context</label>
              <Textarea
                value={previousContext}
                onChange={handlePreviousContextChange}
                className="min-h-[100px] h-[100px] max-h-[100px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
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

            <ScrollArea className="h-[348px] border rounded-md">
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

                {/** Model Selection */}
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

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="flex-grow space-y-4 mt-4">
            <div className="space-y-2">
              <Textarea
                ref={contextResultRef}
                value={contextResult.trim()}
                readOnly
                className="min-h-[420px] h-[420px] max-h-[420px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
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
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {isBatchMode ? "Coming Soon" : "Start Extraction"}
            </>
          )}
        </Button>
        <Button variant="outline" className="gap-2" onClick={stopExtraction} disabled={!isExtracting}>
          <Square className="h-4 w-4" />
          Stop
        </Button>

        <div className="flex items-center space-x-2">
          <Switch id="batch-mode" checked={isBatchMode} onCheckedChange={setIsBatchMode} />
          <label htmlFor="batch-mode" className="text-sm font-medium">
            Batch Mode
          </label>
        </div>

        <Button variant="outline" className="gap-2" onClick={handleSaveToFile}>
          <Save className="h-4 w-4" />
          Save to File
        </Button>
      </div>
    </div>
  )
}
