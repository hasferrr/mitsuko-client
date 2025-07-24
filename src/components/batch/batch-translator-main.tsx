/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Play,
  Upload,
  Loader2,
  Download,
  Trash,
  ArrowLeft,
} from "lucide-react"
import {
  LanguageSelection,
  ModelSelection,
  ContextDocumentInput,
  TemperatureSlider,
  SplitSizeInput,
  MaxCompletionTokenInput,
  StructuredOutputSwitch,
  FullContextMemorySwitch,
  AdvancedSettingsResetButton,
  BetterContextCachingSwitch,
  CustomInstructionsInput,
  FewShotInput,
  AdvancedReasoningSwitch,
} from "../settings"
import { DownloadOption, CombinedFormat } from "@/types/subtitles"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import {
  MAX_COMPLETION_TOKENS_MAX,
  MAX_COMPLETION_TOKENS_MIN,
  SPLIT_SIZE_MAX,
  SPLIT_SIZE_MIN,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
} from "@/constants/limits"
import { ModelDetail } from "../translate/model-detail"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { z } from "zod"
import { ContextCompletion } from "@/types/completion"
import { getContent, parseTranslationJson } from "@/lib/parser/parser"
import { createContextMemory } from "@/lib/context-memory"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { combineSubtitleContent } from "@/lib/subtitles/utils/combine-subtitle"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
// createTranslationForBatch comes from project store

interface BatchFile {
  id: string
  status: "pending" | "translating" | "done" | "error"
  progress: number
  title: string
  subtitlesCount: number
  type: string
}

export default function BatchTranslatorMain() {
  const [isTranslating, setIsTranslating] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteProject = useProjectStore((state) => state.deleteProject)
  const currentProject = useProjectStore((state) => state.currentProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const createTranslationForBatch = useProjectStore((state) => state.createTranslationForBatch)
  const renameProject = useProjectStore((state) => state.renameProject)

  const translationData = useTranslationDataStore((state) => state.data)
  const loadTranslation = useTranslationDataStore((state) => state.getTranslationDb)

  // Settings Stores
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage())
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage())
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const contextDocument = useSettingsStore((state) => state.getContextDocument())
  const customInstructions = useSettingsStore((state) => state.getCustomInstructions())
  const fewShot = useSettingsStore((state) => state.getFewShot())
  const temperature = useAdvancedSettingsStore((state) => state.getTemperature())
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.getMaxCompletionTokens())
  const isMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.getIsMaxCompletionTokensAuto())
  const splitSize = useAdvancedSettingsStore((state) => state.getSplitSize())
  const isUseStructuredOutput = useAdvancedSettingsStore((state) => state.getIsUseStructuredOutput())
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory())
  const isBetterContextCaching = useAdvancedSettingsStore((state) => state.getIsBetterContextCaching())
  const apiKey = useLocalSettingsStore((state) => state.apiKey)
  const customBaseUrl = useLocalSettingsStore((state) => state.customBaseUrl)
  const customModel = useLocalSettingsStore((state) => state.customModel)

  const translateSubtitles = useTranslationStore((state) => state.translateSubtitles)
  const session = useSessionStore((state) => state.session)
  const { setHasChanges } = useUnsavedChanges()

  // Load translations from Dexie on initial render or when project changes
  useEffect(() => {
    if (!currentProject || !currentProject.isBatch) return
    const missingIds = currentProject.translations.filter(id => !translationData[id])
    if (missingIds.length === 0) return
    missingIds.forEach(id => {
      loadTranslation(id).catch(err => console.error('Failed to load translation', err))
    })
  }, [currentProject, translationData, loadTranslation])

  const handleFileDrop = async (droppedFiles: FileList | File[]) => {
    if (!droppedFiles || !currentProject || !currentProject.isBatch) return

    // Convert to array if it's a FileList
    const filesArray = 'item' in droppedFiles ? Array.from(droppedFiles) : droppedFiles

    for await (const file of filesArray) {
      if (!file.name.endsWith(".srt") && !file.name.endsWith(".ass")) {
        toast.error(`Unsupported file type: ${file.name}`)
        continue
      }

      try {
        const content = await file.text()
        const translationId = await createTranslationForBatch(currentProject.id, file, content)
        await loadTranslation(translationId)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        toast.error(`Failed to add ${file.name} to batch`)
      }
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files)
      event.target.value = ""
      handleFileDrop(filesArray)
    }
  }

  const handleClickFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Get batch files from translationData
  const batchFiles: BatchFile[] = currentProject && currentProject.isBatch ? currentProject.translations.map(id => {
    const translation = translationData[id]
    return {
      id,
      title: translation?.title || "Loading...",
      subtitlesCount: translation?.subtitles?.length || 0,
      status: "pending", // We need to implement proper status tracking
      progress: 0,
      type: translation?.parsed?.type || "srt"
    }
  }) : []

  const handleStartBatchTranslation = async () => {
    if (batchFiles.length === 0) return
    setIsTranslating(true)
    setHasChanges(true)

    // Implementation for batch translation will be needed here
    // This can be a future task

    setIsTranslating(false)
  }

  const handleStartTranslation = async (batchFileId: string) => {
    // Implementation for single file translation will be needed here
    // This can be a future task
  }

  const handleFileDownload = (batchFileId: string, option: DownloadOption, format: CombinedFormat) => {
    // Implementation for file download will be needed here
    // This can be a future task
  }

  const handleDeleteBatch = async () => {
    if (currentProject?.id) {
      await deleteProject(currentProject.id)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleBatchNameChange = (value: string) => {
    if (currentProject?.id && value.trim()) {
      renameProject(currentProject.id, value)
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto container py-4 px-4 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex-1 min-w-40 flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => setCurrentProject(null)}
            title="Go back to batch selection"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            defaultValue={currentProject?.name || "Batch Translation"}
            className="text-xl font-semibold h-12"
            onChange={(e) => handleBatchNameChange(e.target.value)}
          />
        </div>
        <Button
          className="gap-2 h-10"
          onClick={handleStartBatchTranslation}
          disabled={isTranslating || !session || batchFiles.length === 0}
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {session ? `Translate ${batchFiles.length} files` : "Sign In to Start"}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="h-10 w-10"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-[1fr_402px] gap-6">
        {/* Left Column - Files */}
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileInputChange}
            accept=".srt,.ass"
            multiple
          />
          <DragAndDrop onDropFiles={handleFileDrop} disabled={isTranslating}>
            <div
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
              onClick={handleClickFileUpload}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Drag and drop subtitle files here or click to browse.
                <br />
                SRT or ASS formats supported.
              </p>
            </div>
          </DragAndDrop>

          <div className="space-y-2">
            {batchFiles.map((batchFile) => (
              <Card key={batchFile.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{batchFile.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {batchFile.subtitlesCount} lines
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {batchFile.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                    {batchFile.status === 'translating' && <Badge variant="outline">Translating ({batchFile.progress.toFixed(0)}%)</Badge>}
                    {batchFile.status === 'done' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleFileDownload(batchFile.id, 'translated', 'o-n-t')}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Badge variant="default">Done</Badge>
                      </>
                    )}
                    {batchFile.status === 'error' && <Badge variant="destructive">Error</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <LanguageSelection parent="project" />
                  <ModelSelection parent="project" />
                  <ContextDocumentInput parent="project" />
                  <div className="m-[2px]">
                    <CustomInstructionsInput parent="project" />
                  </div>
                  <div className="m-[2px]">
                    <FewShotInput parent="project" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <ModelDetail />
                  <TemperatureSlider parent="project" />
                  <div className="border border-muted-foreground/20 rounded-md p-4 space-y-4">
                    <AdvancedReasoningSwitch />
                  </div>
                  <div className="text-sm font-semibold">Technical Options</div>
                  <SplitSizeInput parent="project" />
                  <MaxCompletionTokenInput parent="project" />
                  <StructuredOutputSwitch parent="project" />
                  <FullContextMemorySwitch parent="project" />
                  <BetterContextCachingSwitch parent="project" />
                  <AdvancedSettingsResetButton parent="project" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this batch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBatch}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
