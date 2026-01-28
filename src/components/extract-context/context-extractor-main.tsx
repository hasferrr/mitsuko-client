"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Save,
  Play,
  Square,
  Loader2,
  Check,
  Edit,
  FolderDown,
  ArrowLeft,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { useRouter } from "next/navigation"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { getContent } from "@/lib/parser/parser"
import { cn } from "@/lib/utils"
import { MaxCompletionTokenInput, ModelSelection, SubtitleCleanupSwitch } from "../settings"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { useSessionStore } from "@/stores/use-session-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { db } from "@/lib/db/db"
import { Extraction, Translation } from "@/types/project"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { AiStreamOutput } from "../ai-stream/ai-stream-output"
import { ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import { useExtractionHandler } from "@/hooks/handler/use-extraction-handler"

interface ContextExtractorMainProps {
  currentId: string
  basicSettingsId: string
  advancedSettingsId: string
  isSharedSettings?: boolean
}

export const ContextExtractorMain = ({ currentId, basicSettingsId, advancedSettingsId, isSharedSettings }: ContextExtractorMainProps) => {
  const [activeTab, setActiveTab] = useState("result")
  const [isEpisodeNumberValid, setIsEpisodeNumberValid] = useState(true)
  const [isSubtitleContentValid, setIsSubtitleContentValid] = useState(true)
  const [isEditingResult, setIsEditingResult] = useState(false)
  const [isPreviousContextDialogOpen, setIsPreviousContextDialogOpen] = useState(false)
  const [projectExtractions, setProjectExtractions] = useState<Extraction[]>([])
  const [isSubtitleImportDialogOpen, setIsSubtitleImportDialogOpen] = useState(false)
  const [projectTranslations, setProjectTranslations] = useState<Translation[]>([])

  // Extraction Data Store
  const title = useExtractionDataStore((state) => state.getTitle(currentId))
  const episodeNumber = useExtractionDataStore((state) => state.getEpisodeNumber(currentId))
  const subtitleContent = useExtractionDataStore((state) => state.getSubtitleContent(currentId))
  const previousContext = useExtractionDataStore((state) => state.getPreviousContext(currentId))
  const contextResult = useExtractionDataStore((state) => state.getContextResult(currentId))
  const setTitle = useExtractionDataStore((state) => state.setTitle)
  const setEpisodeNumber = useExtractionDataStore((state) => state.setEpisodeNumber)
  const setSubtitleContent = useExtractionDataStore((state) => state.setSubtitleContent)
  const setPreviousContext = useExtractionDataStore((state) => state.setPreviousContext)
  const setContextResult = useExtractionDataStore((state) => state.setContextResult)
  const saveData = useExtractionDataStore((state) => state.saveData)

  // Extraction Store
  const isExtractingSet = useExtractionStore((state) => state.isExtractingSet)
  const isExtracting = isExtractingSet.has(currentId)

  // Other Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const session = useSessionStore((state) => state.session)

  // Hooks
  const router = useRouter()
  const episodeNumberInputRef = useRef<HTMLInputElement | null>(null)
  const subtitleContentRef = useRef<HTMLTextAreaElement | null>(null)
  const previousContextRef = useRef<HTMLTextAreaElement | null>(null)
  const contextResultRef = useRef<HTMLDivElement | null>(null)
  const contextResultEditRef = useRef<HTMLTextAreaElement | null>(null)

  const { setHasChanges } = useUnsavedChanges()
  useAutoScroll(contextResult, contextResultRef)

  useEffect(() => {
    return () => {
      saveData(currentId)
    }
  }, [currentId, saveData])

  // Content Change Handlers

  const handleSubtitleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setSubtitleContent(currentId, e.target.value)
    setIsSubtitleContentValid(true)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [setHasChanges, setSubtitleContent, currentId])

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
  }, [setHasChanges, setPreviousContext, currentId])

  // Extraction Hook

  const { handleStart, handleStop } = useExtractionHandler({
    setActiveTab,
    setIsEpisodeNumberValid,
    setIsSubtitleContentValid,
    setIsEditingResult,
  })

  const handleStartExtraction = async () => await handleStart(currentId, basicSettingsId, advancedSettingsId)
  const handleStopExtraction = () => handleStop(currentId)

  // Import Select Handlers

  const handleSubtitleSelect = (content: string) => {
    setHasChanges(true)
    setSubtitleContent(currentId, content)
    setIsSubtitleContentValid(true)
    setIsSubtitleImportDialogOpen(false)
    if (subtitleContentRef.current) {
      subtitleContentRef.current.style.height = "auto"
      subtitleContentRef.current.style.height = `${Math.min(subtitleContentRef.current.scrollHeight, 900)}px`
    }
    saveData(currentId)
  }

  const handlePreviousContextSelect = (contextResult: string) => {
    setHasChanges(true)
    setPreviousContext(currentId, getContent(contextResult).replace(/<done>\s*$/, "").trim())
    setIsPreviousContextDialogOpen(false)
    if (previousContextRef.current) {
      previousContextRef.current.style.height = "auto"
      previousContextRef.current.style.height = `${Math.min(previousContextRef.current.scrollHeight, 900)}px`
    }
    saveData(currentId)
  }

  const handleSelectAndGenerateSubtitle = (translation: Translation) => {
    const generatedContent = mergeSubtitle({
      subtitles: translation.subtitles,
      parsed: translation.parsed,
    })
    if (translation.title) {
      setTitle(currentId, translation.title)
    }
    handleSubtitleSelect(generatedContent)
  }

  // File Upload Handlers

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

  // File Handlers

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

    if (newEditingState) {
      setTimeout(() => {
        contextResultEditRef.current?.focus()
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }, 0)
    } else {
      await saveData(currentId)
    }
  }

  // Project Handlers

  const loadProjectExtractions = useCallback(async () => {
    if (!currentProject) return
    const extractionsData = await db.extractions.bulkGet(currentProject.extractions)
    setProjectExtractions(extractionsData.filter((e): e is Extraction => !!e && e.id !== currentId).toReversed())
  }, [currentProject, currentId])

  const loadProjectTranslations = useCallback(async () => {
    if (!currentProject) return
    const translationsData = await db.translations.bulkGet(currentProject.translations)
    setProjectTranslations(translationsData.filter((t): t is Translation => !!t).toReversed())
  }, [currentProject])

  return (
    <div translate="no" className="grid md:grid-cols-2 gap-6 gap-y-4 container mx-auto py-2 px-4 mt-2 mb-6 max-w-5xl">
      {/* Header */}
      <div className="md:col-span-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/project')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(currentId, e.target.value)}
          onBlur={() => saveData(currentId)}
          className="text-xl font-semibold h-12"
        />
      </div>

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

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Subtitle Content</label>
            <input
              type="file"
              accept={ACCEPTED_FORMATS.join(",")}
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
              size="sm"
              className="h-2 py-3 px-2"
              onClick={() => document.getElementById("subtitle-content-upload")?.click()}
              disabled={isExtracting}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadProjectTranslations()
                setIsSubtitleImportDialogOpen(true)
              }}
              className="h-2 py-3 px-2"
              disabled={isExtracting}
            >
              <FolderDown className="h-4 w-4" />
              Import
            </Button>
          </div>
          <DragAndDrop onDropFiles={(files) => handleFileUploadSingle(files, (text) => setSubtitleContent(currentId, text), subtitleContentRef.current)} disabled={isExtracting}>
            <Textarea
              ref={subtitleContentRef}
              value={subtitleContent}
              onChange={handleSubtitleContentChange}
              className={cn(
                "min-h-[181px] h-[181px] max-h-[250px] bg-background dark:bg-muted/30 resize-none overflow-y-auto",
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
              size="sm"
              className="h-2 py-3 px-2"
              onClick={() => document.getElementById("previous-context-upload")?.click()}
              disabled={isExtracting}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadProjectExtractions()
                setIsPreviousContextDialogOpen(true)
              }}
              className="h-2 py-3 px-2"
              disabled={isExtracting}
            >
              <FolderDown className="h-4 w-4" />
              Import
            </Button>
          </div>
          <DragAndDrop onDropFiles={(files) => handleFileUploadSingle(files, (text) => setPreviousContext(currentId, text), previousContextRef.current)} disabled={isExtracting}>
            <Textarea
              ref={previousContextRef}
              value={previousContext}
              onChange={handlePreviousContextChange}
              className="min-h-[130px] h-[130px] max-h-[250px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
              placeholder="Paste previous context here..."
              onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
            />
          </DragAndDrop>
        </div>
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
              <CardContent className={cn("p-4 space-y-4", isSharedSettings && "pointer-events-none opacity-50")}>
                {isSharedSettings && (
                  <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                )}
                <ModelSelection
                  basicSettingsId={basicSettingsId}
                  advancedSettingsId={advancedSettingsId}
                />
                <MaxCompletionTokenInput
                  basicSettingsId={basicSettingsId}
                  advancedSettingsId={advancedSettingsId}
                />
                <SubtitleCleanupSwitch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="flex-grow space-y-4 mt-4">
            <div className="space-y-2">
              {isEditingResult ? (
                <Textarea
                  ref={contextResultEditRef}
                  value={contextResult}
                  onChange={handleResultChange}
                  readOnly={!isEditingResult}
                  className="min-h-[412px] h-[412px] max-h-[412px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
                  placeholder="Extracted context will appear here..."
                />
              ) : (
                <div
                  ref={contextResultRef}
                  className={cn(
                    "min-h-[412px] h-[412px] bg-background dark:bg-muted/30 overflow-y-auto rounded-md border p-3 pr-2",
                    !contextResult && "text-muted-foreground",
                  )}
                >
                  <AiStreamOutput
                    content={contextResult || "Extracted context will appear here..."}
                    isProcessing={isExtracting}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Controls */}
      <div className="lg:col-span-2 flex items-center justify-center gap-4 flex-wrap">
        <Button
          className="gap-2 w-[152px]"
          onClick={handleStartExtraction}
          disabled={isExtracting || !session}
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {!!session ? "Start Extraction" : "Sign In to Start"}
            </>
          )}
        </Button>

        <Button variant="outline" className="gap-2" onClick={handleStopExtraction} disabled={!isExtracting || !contextResult}>
          <Square className="h-4 w-4" />
          Stop
        </Button>

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

      </div>

      {/* Subtitle Import Dialog */}
      <Dialog open={isSubtitleImportDialogOpen} onOpenChange={setIsSubtitleImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Subtitle Document</DialogTitle>
            <DialogDescription>
              Choose a subtitle document from your project translations.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {projectTranslations.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No subtitle documents found in this project
              </div>
            ) : isSubtitleImportDialogOpen ? (
              <div className="space-y-2 mr-1">
                {projectTranslations.map((translation) => {
                  const previewContent = translation.subtitles
                    .slice(0, 5)
                    .map(sub => sub.content)
                    .join("\n")

                  return (
                    <div
                      key={translation.id}
                      className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                      onClick={() => handleSelectAndGenerateSubtitle(translation)}
                    >
                      <div className="font-medium">{translation.title || "Untitled Subtitle"}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {previewContent.length
                          ? previewContent.substring(0, 150) + (previewContent.length > 150 || translation.subtitles.length > 5 ? "..." : "")
                          : "No content"}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (null)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Previous Context Dialog */}
      <Dialog open={isPreviousContextDialogOpen} onOpenChange={setIsPreviousContextDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Previous Context Document</DialogTitle>
            <DialogDescription>
              Choose a context document from your project extractions to use as previous context.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {projectExtractions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No context documents found in this project
              </div>
            ) : isPreviousContextDialogOpen ? (
              <div className="space-y-2 mr-1">
                {projectExtractions.map((extraction) => (
                  <div
                    key={extraction.id}
                    className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => handlePreviousContextSelect(extraction.contextResult)}
                  >
                    <div className="font-medium">Episode {extraction.episodeNumber || "X"}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {extraction.contextResult.length ? extraction.contextResult.substring(0, 150) + "..." : "No content"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (null)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}