"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  File,
  XCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Upload,
  Save,
  Play,
  Square,
  Loader2,
  ArrowUpDown,
  Trash2,
  Check,
  Edit,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Subtitle, SubtitleNoTime } from "@/types/types"
import { isASS, isSRT } from "@/lib/subtitles/is"
import { parseASS } from "@/lib/subtitles/ass/parse"
import { parseSRT } from "@/lib/subtitles/srt/parse"
import { removeTimestamp } from "@/lib/subtitles/timestamp"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useExtractionInputStore } from "@/stores/services/use-extraction-input-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { MAX_COMPLETION_TOKENS_MIN, MAX_COMPLETION_TOKENS_MAX } from "@/constants/limits"
import { getContent } from "@/lib/parser/parser"
import { minMax, cn } from "@/lib/utils"
import { MaxCompletionTokenInput, ModelSelection } from "./settings-inputs"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { useSessionStore } from "@/stores/use-session-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { getBasicSettings, getAdvancedSettings } from "@/lib/db/settings"
import { useProjectStore } from "@/stores/data/use-project-store"
import { fetchUserData } from "@/lib/api/user"
import { UserData } from "@/types/user"
import { useQuery } from "@tanstack/react-query"


interface FileItem {
  id: string
  name: string
  content: string
}

export const ContextExtractor = () => {
  const currentId = useExtractionDataStore((state) => state.currentId)
  const extractionData = useExtractionDataStore((state) => state.data)

  if (!currentId || !extractionData[currentId]) {
    return <div className="p-4">No extraction project selected</div>
  }

  const [activeTab, setActiveTab] = useState("result")
  const [isEpisodeNumberValid, setIsEpisodeNumberValid] = useState(true)
  const [isSubtitleContentValid, setIsSubtitleContentValid] = useState(true)
  const [isEditingResult, setIsEditingResult] = useState(false)

  // Settings Store
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const apiKey = useSettingsStore((state) => state.apiKey)
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl)
  const customModel = useSettingsStore((state) => state.customModel)
  const setSettingsCurrentId = useSettingsStore((state) => state.setCurrentId)
  const upsertSettingsData = useSettingsStore((state) => state.upsertData)

  // Advanced Settings Store
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.getMaxCompletionTokens())
  const isMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.getIsMaxCompletionTokensAuto())
  const setAdvancedSettingsCurrentId = useAdvancedSettingsStore((state) => state.setCurrentId)
  const upsertAdvancedSettingsData = useAdvancedSettingsStore((state) => state.upsertData)

  // Extraction Data Store
  const episodeNumber = useExtractionDataStore((state) => state.getEpisodeNumber())
  const subtitleContent = useExtractionDataStore((state) => state.getSubtitleContent())
  const previousContext = useExtractionDataStore((state) => state.getPreviousContext())
  const contextResult = useExtractionDataStore((state) => state.getContextResult())
  const setEpisodeNumber = useExtractionDataStore((state) => state.setEpisodeNumber)
  const setSubtitleContent = useExtractionDataStore((state) => state.setSubtitleContent)
  const setPreviousContext = useExtractionDataStore((state) => state.setPreviousContext)
  const setContextResult = useExtractionDataStore((state) => state.setContextResult)
  const saveData = useExtractionDataStore((state) => state.saveData)

  // Extraction Store
  const isExtractingSet = useExtractionStore((state) => state.isExtractingSet)
  const extractContext = useExtractionStore((state) => state.extractContext)
  const stopExtraction = useExtractionStore((state) => state.stopExtraction)
  const setIsExtracting = useExtractionStore((state) => state.setIsExtracting)
  const isExtracting = isExtractingSet.has(currentId)

  // Extraction Input Store
  const selectedFiles = useExtractionInputStore((state) => state.selectedFiles)
  const isBatchMode = useExtractionInputStore((state) => state.isBatchMode)
  const setSelectedFiles = useExtractionInputStore((state) => state.setSelectedFiles)
  // const setIsBatchMode = useExtractionInputStore((state) => state.setIsBatchMode)

  // Other Store
  const session = useSessionStore((state) => state.session)

  // Add lazy user data query that only executes manually
  const { refetch: refetchUserData } = useQuery<UserData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserData,
    enabled: false, // Lazy query - won't run automatically
    staleTime: 0, // Always refetch when requested
  })

  const episodeNumberInputRef = useRef<HTMLInputElement | null>(null)
  const subtitleContentRef = useRef<HTMLTextAreaElement | null>(null)
  const previousContextRef = useRef<HTMLTextAreaElement | null>(null)
  const contextResultRef = useRef<HTMLTextAreaElement | null>(null)

  const { setHasChanges } = useUnsavedChanges()
  useAutoScroll(contextResult, contextResultRef)

  useEffect(() => {
    if (contextResultRef.current) {
      contextResultRef.current.scrollTop = contextResultRef.current.scrollHeight
    }
  }, [contextResultRef])

  useEffect(() => {
    if (extractionData[currentId].projectId !== useProjectStore.getState().currentProject?.id) {
      useProjectStore.getState().setCurrentProject(extractionData[currentId].projectId)
    }

    if (!extractionData[currentId]) return
    setSettingsCurrentId(extractionData[currentId].basicSettingsId)
    setAdvancedSettingsCurrentId(extractionData[currentId].advancedSettingsId)

    // Fetch settings data if available
    if (extractionData[currentId].basicSettingsId) {
      getBasicSettings(extractionData[currentId].basicSettingsId)
        .then(settings => {
          if (settings) {
            upsertSettingsData(settings.id, settings)
          }
        })
    }

    // Fetch advanced settings data if available
    if (extractionData[currentId].advancedSettingsId) {
      getAdvancedSettings(extractionData[currentId].advancedSettingsId)
        .then(advancedSettings => {
          if (advancedSettings) {
            upsertAdvancedSettingsData(advancedSettings.id, advancedSettings)
          }
        })
    }

    return () => {
      saveData(currentId)
    }
  }, [])

  const handleSubtitleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setSubtitleContent(currentId, e.target.value)
    setIsSubtitleContentValid(true)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [setHasChanges, setSubtitleContent])

  const handleResultChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setContextResult(currentId, e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 416)}px`
  }, [setHasChanges, setContextResult, currentId])

  const handlePreviousContextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setPreviousContext(currentId, e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [setHasChanges, setPreviousContext])

  const handleFileUploadSingle = async (
    files: FileList | null,
    setState: (value: string) => void,
    textarea: HTMLTextAreaElement | null,
  ) => {
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
    await saveData(currentId)
  }

  // Note: Batch mode files are saved to localStorage which is shared across extraction projects
  const handleFileUploadBatch = async (files: FileList | null) => {
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

  const handleCopyAndSortFiles = () => {
    const sortedFiles = [...selectedFiles]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
    setSelectedFiles(sortedFiles)
  }

  const handleClearFiles = () => {
    setSelectedFiles([])
  }

  const handleStartExtraction = async (isContinuation: boolean = false) => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    await saveData(currentId)

    if (episodeNumber.trim() === "") {
      setIsEpisodeNumberValid(false)
      return
    }
    if (subtitleContent.trim() === "" && !isBatchMode) {
      setIsSubtitleContentValid(false)
      return
    }

    setIsExtracting(currentId, true)
    setHasChanges(true)
    setActiveTab("result")
    setIsEditingResult(false)

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

    const result: string[] | undefined = isContinuation
      ? [contextResult]
      : undefined

    const requestBody = {
      input: {
        episode: Number(episodeNumber),
        subtitles: subtitles,
        previous_context: previousContext,
      },
      isContinuation: isContinuation ? true : undefined,
      continuationMessage: isContinuation ? result : undefined,
      baseURL: isUseCustomModel ? customBaseUrl : "http://localhost:6969",
      model: isUseCustomModel ? customModel : modelDetail?.name || "",
      maxCompletionTokens: isMaxCompletionTokensAuto ? undefined : minMax(
        maxCompletionTokens,
        MAX_COMPLETION_TOKENS_MIN,
        MAX_COMPLETION_TOKENS_MAX
      ),
    }

    try {
      await extractContext(
        requestBody,
        isUseCustomModel ? apiKey : "",
        !isUseCustomModel,
        currentId,
        (response) => setContextResult(currentId, response),
        isContinuation ? contextResult : "",
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsExtracting(currentId, false)

      // Refetch user data after extraction completes to update credits
      refetchUserData()

      await saveData(currentId)
    }
  }

  // const handleContinueGeneration = async () => {
  //   await handleStartExtraction(true)
  // }

  const handleStopExtraction = async () => {
    stopExtraction(currentId)
    setIsExtracting(currentId, false)
    await saveData(currentId)
  }

  const handleSaveToFile = async () => {
    await saveData(currentId)
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

  const handleToggleEditMode = async () => {
    const newEditingState = !isEditingResult
    setIsEditingResult(newEditingState)

    // Focus on the textarea when entering edit mode
    if (newEditingState && contextResultRef.current) {
      contextResultRef.current?.focus()
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } else {
      await saveData(currentId)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 container mx-auto py-2 px-4 mt-2 mb-6 max-w-5xl">
      {/* Left Pane */}
      <div className="space-y-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Episode Number</label>
          <Input
            ref={episodeNumberInputRef}
            value={episodeNumber}
            onChange={(e) => {
              setEpisodeNumber(currentId, e.target.value)
              setIsEpisodeNumberValid(true)
            }}
            placeholder="e.g., S01E01"
            className={cn("bg-background dark:bg-muted/30",
              !isEpisodeNumberValid && "outline outline-red-500"
            )}
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
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUploadSingle(
                        e.target.files,
                        (text) => setSubtitleContent(currentId, text),
                        subtitleContentRef.current
                      )
                    }
                  }}
                  className="hidden"
                  id="subtitle-content-upload"
                />

                <Button
                  variant="outline"
                  className="gap-2 h-2 p-3"
                  onClick={() => document.getElementById("subtitle-content-upload")?.click()}
                  disabled={isExtracting}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              <DragAndDrop onDropFiles={(files) => handleFileUploadSingle(files, (text) => setSubtitleContent(currentId, text), subtitleContentRef.current)} disabled={isExtracting}>
                <Textarea
                  ref={subtitleContentRef}
                  value={subtitleContent}
                  onChange={handleSubtitleContentChange}
                  className={cn(
                    "min-h-[181px] h-[181px] max-h-[181px] bg-background dark:bg-muted/30 resize-none overflow-y-auto",
                    !isSubtitleContentValid && "outline outline-red-500"
                  )}
                  placeholder="Paste subtitle content here..."
                  onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
                />
              </DragAndDrop>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Previous Context</label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUploadSingle(e.target.files, (text) => setPreviousContext(currentId, text), previousContextRef.current)
                    }
                  }}
                  className="hidden"
                  id="previous-context-upload"
                />
                <Button
                  variant="outline"
                  className="gap-2 h-2 p-3"
                  onClick={() => document.getElementById("previous-context-upload")?.click()}
                  disabled={isExtracting}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              <DragAndDrop onDropFiles={(files) => handleFileUploadSingle(files, (text) => setPreviousContext(currentId, text), previousContextRef.current)} disabled={isExtracting}>
                <Textarea
                  ref={previousContextRef}
                  value={previousContext}
                  onChange={handlePreviousContextChange}
                  className="min-h-[130px] h-[130px] max-h-[130px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                  placeholder="Paste previous context here..."
                  onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
                />
              </DragAndDrop>
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
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUploadBatch(e.target.files)
                  }
                }}
                className="hidden"
                id="subtitle-files-upload"
              />
              <Button
                variant="outline"
                className="gap-2"
                size="sm"
                onClick={() => document.getElementById("subtitle-files-upload")?.click()}
                disabled={isExtracting}
              >
                <Upload className="h-4 w-4" />
                Select Files
              </Button>
              {/* Sort Button */}
              <Button
                variant="outline"
                className="gap-2"
                size="sm"
                onClick={handleCopyAndSortFiles}
                disabled={isExtracting}
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
              {/* Clear Button */}
              <Button
                variant="outline"
                className="gap-2"
                size="sm"
                onClick={handleClearFiles}
                disabled={isExtracting}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>

            <DragAndDrop onDropFiles={handleFileUploadBatch} disabled={isExtracting}>
              <ScrollArea className="h-[350px] border rounded-md">
                <div className="space-y-1 p-2">
                  {selectedFiles.map((file, index) => (
                    <div key={file.id} className="flex items-center justify-between border rounded-md p-2">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <div className="text-sm w-fit block break-all">{file.name}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => moveFileUp(index)} disabled={isExtracting}>
                          <ArrowUpCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => moveFileDown(index)} disabled={isExtracting}>
                          <ArrowDownCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} disabled={isExtracting}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DragAndDrop>
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
                <ModelSelection type="extraction" />
                <MaxCompletionTokenInput type="extraction" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="flex-grow space-y-4 mt-4">
            <div className="space-y-2">
              <Textarea
                ref={contextResultRef}
                value={contextResult}
                onChange={isEditingResult ? handleResultChange : undefined}
                readOnly={!isEditingResult}
                className="min-h-[412px] h-[412px] max-h-[412px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                placeholder="Extracted context will appear here..."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Controls */}
      <div className="lg:col-span-2 flex items-center justify-center gap-4 flex-wrap">
        <Button
          className="gap-2 w-[152px]"
          onClick={() => handleStartExtraction(false)}
          disabled={isExtracting || isBatchMode || !session}
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {isBatchMode ? "Coming Soon" : (
                !!session ? "Start Extraction" : "Sign In to Start"
              )}
            </>
          )}
        </Button>

        <Button variant="outline" className="gap-2" onClick={handleStopExtraction} disabled={!isExtracting || !contextResult}>
          <Square className="h-4 w-4" />
          Stop
        </Button>

        {/* Batch Mode is disabled for now */}
        {/* <div className="flex items-center space-x-2">
          <Switch id="batch-mode" checked={isBatchMode} onCheckedChange={setIsBatchMode} />
          <label htmlFor="batch-mode" className="text-sm font-medium">
            Batch Mode
          </label>
        </div> */}

        <Button variant="outline" className="gap-2" onClick={handleSaveToFile}>
          <Save className="h-4 w-4" />
          Save to File
        </Button>

        <Button
          variant={isEditingResult ? "default" : "outline"}
          className="gap-2"
          onClick={handleToggleEditMode}
          disabled={isExtracting}
        >
          {isEditingResult ? (
            <>
              <Check className="h-4 w-4" />
              Done Editing
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Result
            </>
          )}
        </Button>

        {/* Continue Extraction is disabled for now */}
        {/* <Button
          variant="outline"
          className="gap-2"
          onClick={handleContinueGeneration}
          disabled={isExtracting || !session || contextResult.trim() === ""}
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Continuing...
            </>
          ) : (
            <>
              <StepForward className="h-4 w-4" />
              Continue Extraction
            </>
          )}
        </Button> */}
      </div>
    </div>
  )
}
