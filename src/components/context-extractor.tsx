"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { File, XCircle, ArrowUpCircle, ArrowDownCircle, Upload, Save, Play, Square, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Subtitle, SubtitleNoTime } from "@/types/types"
import { isASS, isSRT, removeTimestamp } from "@/lib/ass/subtitle-utils"
import { parseASS } from "@/lib/ass/parse"
import { parseSRT } from "@/lib/srt/parse"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { useBeforeUnload } from "@/hooks/use-before-unload"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useExtractionStore } from "@/stores/use-extraction-store"
import { useExtractionInputStore } from "@/stores/use-extraction-input-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
import { MAX_COMPLETION_TOKENS_MIN, MAX_COMPLETION_TOKENS_MAX } from "@/constants/limits"
import { getContent } from "@/lib/parser"
import { minMax } from "@/lib/utils"
import { MaxCompletionTokenInput, ModelSelection } from "./settings-inputs"


interface FileItem {
  id: string
  name: string
  content: string
}

export const ContextExtractor = () => {
  const [activeTab, setActiveTab] = useState("result")

  // Settings Store
  const useCustomModel = useSettingsStore((state) => state.useCustomModel)
  const apiKey = useSettingsStore((state) => state.apiKey)
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl)
  const customModel = useSettingsStore((state) => state.customModel)

  // Advanced Settings Store
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.maxCompletionTokens)

  // Extraction Store
  const contextResult = useExtractionStore((state) => state.contextResult)
  const isExtracting = useExtractionStore((state) => state.isExtracting)
  const extractContext = useExtractionStore((state) => state.extractContext)
  const stopExtraction = useExtractionStore((state) => state.stopExtraction)

  // Extraction Input Store
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

  const subtitleContentRef = useRef<HTMLTextAreaElement | null>(null)
  const previousContextRef = useRef<HTMLTextAreaElement | null>(null)
  const contextResultRef = useRef<HTMLTextAreaElement | null>(null)

  const { setHasChanges } = useBeforeUnload()
  useAutoScroll(contextResult, contextResultRef)

  useEffect(() => {
    if (contextResultRef.current) {
      contextResultRef.current.scrollTop = contextResultRef.current.scrollHeight
    }
  }, [contextResultRef])


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

  const handleFileUploadSingle = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setState: (value: string) => void,
    textarea: HTMLTextAreaElement | null,
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setHasChanges(true)

    // Single File Logic (For Subtitle Content)
    const file = files[0]
    const text = await file.text()
    setState(text)
    // Trigger resize
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 900)}px`
    }

    // Reset the input
    event.target.value = ""
  }

  const handleFileUploadBatch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setHasChanges(true)

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

    // Reset the input
    event.target.value = ""
  }

  const removeFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.id !== id))
  }

  const moveFileUp = (index: number) => {
    if (index > 0) {
      const newFiles = [...selectedFiles]
      const temp = newFiles[index - 1]
      newFiles[index - 1] = newFiles[index]
      newFiles[index] = temp
      setSelectedFiles(newFiles)
    }
  }

  const moveFileDown = (index: number) => {
    if (index < selectedFiles.length - 1) {
      const newFiles = [...selectedFiles]
      const temp = newFiles[index + 1]
      newFiles[index + 1] = newFiles[index]
      newFiles[index] = temp
      setSelectedFiles(newFiles)
    }
  }

  const handleStartExtraction = async () => {
    if (isExtracting) return
    setHasChanges(true)
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
      maxCompletionTokens: minMax(
        maxCompletionTokens,
        MAX_COMPLETION_TOKENS_MIN,
        MAX_COMPLETION_TOKENS_MAX
      ),
    }

    extractContext(requestBody, apiKey)
  }

  const handleSaveToFile = () => {
    const text = getContent(contextResult)
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
    <div className="grid lg:grid-cols-2 gap-6 container mx-auto py-2 px-4 mt-2 mb-6 max-w-5xl">
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
                  accept=".srt,.ass"
                  onChange={(e) => handleFileUploadSingle(e, setSubtitleContent, subtitleContentRef.current)}
                  className="hidden"
                  id="subtitle-content-upload"
                />
                <Button
                  variant="outline"
                  className="gap-2 h-2 p-3"
                  onClick={() => document.getElementById("subtitle-content-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              <Textarea
                ref={subtitleContentRef}
                value={subtitleContent}
                onChange={handleSubtitleContentChange}
                className="min-h-[185px] h-[185px] max-h-[185px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                placeholder="Paste subtitle content here..."
                onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Previous Context</label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={(e) => handleFileUploadSingle(e, setPreviousContext, previousContextRef.current)}
                  className="hidden"
                  id="previous-context-upload"
                />
                <Button
                  variant="outline"
                  className="gap-2 h-2 p-3"
                  onClick={() => document.getElementById("previous-context-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              <Textarea
                ref={previousContextRef}
                value={previousContext}
                onChange={handlePreviousContextChange}
                className="min-h-[132px] h-[132px] max-h-[132px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
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
                accept=".srt,.ass"
                onChange={handleFileUploadBatch}
                className="hidden"
                id="subtitle-files-upload"
              />
              <Button
                variant="outline"
                className="gap-2"
                size="sm"
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
                      <div className="text-sm w-fit block break-all">{file.name}</div>
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
                <MaxCompletionTokenInput />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="flex-grow space-y-4 mt-4">
            <div className="space-y-2">
              <Textarea
                ref={contextResultRef}
                value={contextResult.trim()}
                readOnly
                className="h-[416px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                placeholder="Extracted context will appear here..."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Controls */}
      <div className="lg:col-span-2 flex items-center justify-center gap-4">
        <Button className="gap-2 w-[152px]" onClick={handleStartExtraction} disabled={isExtracting || isBatchMode}>
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

        <Button variant="outline" className="gap-2" onClick={stopExtraction} disabled={!isExtracting || !contextResult}>
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
