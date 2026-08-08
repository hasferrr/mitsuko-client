"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { createUtf8SubtitleBlob } from "@/lib/utils/file"
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
  Loader2,
  Square,
  CheckSquare,
  ListChecks,
  AlertTriangle,
  FastForward,
  Trash,
  Upload
} from "lucide-react"
import { RiLinksLine, RiSparkling2Line } from "@remixicon/react"
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
  MinimalContextModeSwitch,
  CustomInstructionsInput,
  FewShotInput,
  AdvancedReasoningSwitch,
} from "../settings"
import { DownloadOption, CombinedFormat, SubtitleType } from "@/types/subtitles"
import { arrayMove } from "@dnd-kit/sortable"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useBatchSettingsStore } from "@/stores/settings/use-batch-settings-store"
import { ModelDetail } from "../translate/model-detail"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PopulateContextDialog } from "./populate-context-dialog"
import { CopySharedSettingsDialog } from "./copy-shared-settings-dialog"
import { DownloadSection } from "@/components/shared/download-section"
import JSZip from "jszip"
import SubtitleTranslatorMain from "../translate/subtitle-translator-main"
import { useBatchTranslationFiles } from "@/hooks/batch/use-batch-translation-files"
import { useBatchExtractionFiles } from "@/hooks/batch/use-batch-extraction-files"
import useBatchTranslationHandler, { BatchTranslationRunSummary } from "@/hooks/batch/use-batch-translation-handler"
import { BatchFileList } from "./batch-file-list"
import { useBatchSelection } from "@/hooks/batch/use-batch-selection"
import { ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import { MAX_BATCH_CONCURRENT_OPERATION } from "@/constants/limits"
import { useSetUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { BatchTranslationStage } from "@/types/batch"
import { BatchAutoContextSettings } from "@/components/batch/batch-auto-context-settings"
import { BatchAutoContextPreviewDialog } from "@/components/batch/batch-auto-context-preview-dialog"
import { ContextExtractorMain } from "@/components/extract-context/context-extractor-main"
import { SettingsDialogue } from "@/components/settings/settings-dialogue"
import { GLOBAL_EXTRACTION_SETTINGS_ID } from "@/constants/global-settings"

function CopySharedSettingsButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <div className="flex justify-end">
      <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
        <ListChecks data-icon="inline-start" />
        Copy Shared Settings...
      </Button>
    </div>
  )
}

function BatchRunSummary({
  summary,
  concurrentTranslations,
}: {
  summary: BatchTranslationRunSummary | null
  concurrentTranslations: number
}) {
  if (!summary?.autoContextEnabled) return null

  return (
    <Alert>
      <RiSparkling2Line />
      <AlertTitle>Auto Context is on</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          <li>Starting Context: {summary.startingContextTitle ?? "None"}</li>
          <li>{summary.createCount} context{summary.createCount === 1 ? "" : "s"} to create</li>
          <li>{summary.rerunCount} context{summary.rerunCount === 1 ? "" : "s"} to rerun</li>
          <li>{summary.reuseCount} context{summary.reuseCount === 1 ? "" : "s"} to reuse</li>
          <li>{summary.translationCount} translation{summary.translationCount === 1 ? "" : "s"} to process</li>
          <li>Contexts run serially; up to {concurrentTranslations} translations run concurrently</li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export function BatchTranslationView({ settingsId }: { settingsId: string }) {
  const [activeTab, setActiveTab] = useState("basic")
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("translated")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")
  const [toType, setToType] = useState<SubtitleType | "no-change">("no-change")

  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewAutoContextId, setPreviewAutoContextId] = useState<string | null>(null)
  const [previewExtractionId, setPreviewExtractionId] = useState<string | null>(null)
  const [queueSet, setQueueSet] = useState<Set<string>>(new Set())
  const [autoContextStageMap, setAutoContextStageMap] = useState<Record<string, BatchTranslationStage>>({})
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)

  // Dialogs
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false)
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false)
  const [isLinkContextDialogOpen, setIsLinkContextDialogOpen] = useState(false)
  const [isCopySharedDialogOpen, setIsCopySharedDialogOpen] = useState(false)
  const [isExtractionSettingsOpen, setIsExtractionSettingsOpen] = useState(false)
  const [isGlobalExtractionSettingsOpen, setIsGlobalExtractionSettingsOpen] = useState(false)
  const [translatedStats, setTranslatedStats] = useState({ translated: 0, total: 0 })
  const [runSummary, setRunSummary] = useState<BatchTranslationRunSummary | null>(null)
  const [regenerateAutoContext, setRegenerateAutoContext] = useState(false)

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)
  const createTranslationForBatch = useProjectStore((state) => state.createTranslationForBatch)
  const removeTranslationFromBatch = useProjectStore((state) => state.removeTranslationFromBatch)
  const setHasChanges = useSetUnsavedChanges()

  const [localOrder, setLocalOrder] = useState<string[]>(currentProject?.translations ?? [])

  useEffect(() => {
    setLocalOrder(currentProject?.translations ?? [])
  }, [currentProject?.translations])

  // Settings Stores
  const concurrentOperation = useBatchSettingsStore(state => state.getConcurrent(currentProject?.id))
  const setConcurrentOperation = useBatchSettingsStore(state => state.setConcurrentTranslations)

  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(settingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(settingsId))
  const modelDetail = useSettingsStore((state) => state.getModelDetail(settingsId))
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(settingsId))

  // Data Stores
  const translationData = useTranslationDataStore((state) => state.data)
  const loadTranslation = useTranslationDataStore((state) => state.getTranslationDb)
  const setCurrentTranslationId = useTranslationDataStore((state) => state.setCurrentId)
  const saveTranslationData = useTranslationDataStore((state) => state.saveData)
  const extractionData = useExtractionDataStore((state) => state.data)
  const getExtractionDb = useExtractionDataStore((state) => state.getExtractionDb)
  const setCurrentExtractionId = useExtractionDataStore((state) => state.setCurrentId)
  const isExtractingSet = useExtractionStore((state) => state.isExtractingSet)

  const previewAutoContextTranslation = previewAutoContextId
    ? translationData[previewAutoContextId]
    : null
  const previewAutoContextExtraction = previewAutoContextTranslation?.autoContextExtractionId
    ? extractionData[previewAutoContextTranslation.autoContextExtractionId]
    : null
  const previewAutoContextSettingsId = previewAutoContextTranslation ? settingsId : null
  const previewAutoContextDocument = useSettingsStore((state) => previewAutoContextSettingsId
    ? state.getContextDocument(previewAutoContextSettingsId)
    : "")

  const session = useSessionStore((state) => state.session)

  // Files hooks
  const {
    batchFiles,
    finishedCount,
    isBatchTranslating: isProcessing,
  } = useBatchTranslationFiles(
    localOrder,
    queueSet,
    autoContextStageMap,
  )

  // Also need extraction files just for "Link Context" and "Copy Shared Settings" features that might cross-reference
  const { batchFiles: extractionBatchFiles } = useBatchExtractionFiles(
    currentProject?.extractions ?? [],
    new Set()
  )

  // Selection Hook
  const {
    isSelecting,
    selectedIds,
    isDeleteSelectedDialogOpen,
    setIsDeleteSelectedDialogOpen,
    toggleSelectMode,
    handleSelectToggle,
    handleDeleteSelected,
    handleSelectAllToggle
  } = useBatchSelection({ batchFiles, operationMode: 'translation' })

  // Translation Handler Hook
  const {
    handleStartBatchTranslation,
    handleContinueBatchTranslation,
    handleStopBatchTranslation,
    getBatchRunSummary,
    generateSubtitleContent,
  } = useBatchTranslationHandler({
    settingsId,
    batchFiles,
    isBatchTranslating: isProcessing,
    state: {
      toType,
      setIsRestartTranslationDialogOpen: setIsRestartDialogOpen,
      setIsContinueTranslationDialogOpen: setIsContinueDialogOpen,
      setActiveTab,
      setQueueSet,
      setAutoContextStageMap,
    },
  })

  // Handlers
  const handleFileDrop = async (droppedFiles: FileList | File[]) => {
    if (!droppedFiles || !currentProject || !currentProject.isBatch) return
    const filesArray = 'item' in droppedFiles ? Array.from(droppedFiles) : droppedFiles

    for await (const file of filesArray) {
      if (!ACCEPTED_FORMATS.some(format => file.name.endsWith(format))) {
        toast.error(`Unsupported file type: ${file.name}`)
        continue
      }
      try {
        const content = await file.text()
        const translationId = await createTranslationForBatch(currentProject.id, file, content)
        await loadTranslation(translationId)
        setHasChanges(true)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        toast.error(`Failed to add ${file.name} to batch`)
      }
    }
  }

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    if (isProcessing) return
    const { active, over } = event
    if (!over || !currentProject) return
    if (active.id === over.id) return

    const ids = currentProject.translations
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(localOrder, oldIndex, newIndex)
    setLocalOrder(newOrder)
    updateProjectItems(currentProject.id, newOrder, 'translations')
    setHasChanges(true)
  }

  const handleSingleFileDownload = (batchFileId: string) => {
    const translation = translationData[batchFileId]
    if (!translation) return
    const content = generateSubtitleContent(batchFileId, downloadOption, combinedFormat)
    if (!content) return

    const ext = translation.parsed?.type || "srt"
    const hasExt = translation.title.toLowerCase().endsWith(`.${ext}`)
    const fileName = hasExt ? translation.title : `${translation.title}.${ext}`
    const blob = createUtf8SubtitleBlob(content, ext)

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateZip = async (option: DownloadOption, format: CombinedFormat): Promise<Blob> => {
    const zip = new JSZip()
    const nameCountMap = new Map<string, number>()

    for (const batchFile of batchFiles) {
      const translation = translationData[batchFile.id]
      if (!translation) continue
      const content = generateSubtitleContent(batchFile.id, option, format)

      let ext = translation.parsed.type
      const hasExt = translation.title.toLowerCase().endsWith(`.${ext}`)
      const baseName = hasExt
        ? translation.title.slice(0, -(`.${ext}`.length))
        : translation.title

      if (ext !== toType && toType !== "no-change") {
        ext = toType
      }

      const fileKey = `${baseName}.${ext}`
      const currentCount = nameCountMap.get(fileKey) ?? 0
      const newCount = currentCount + 1
      nameCountMap.set(fileKey, newCount)

      const uniqueFileName = newCount === 1
        ? fileKey
        : `${baseName} (${newCount}).${ext}`

      const fileContent = ext === "vtt" ? content : "\ufeff" + content
      zip.file(uniqueFileName, fileContent)
    }
    return await zip.generateAsync({ type: "blob" })
  }

  const handleOpenStartBatchDialog = async () => {
    if (batchFiles.length === 0 || isProcessing) return

    let totalSubtitles = 0
    let translatedSubtitles = 0

    batchFiles.forEach(file => {
      totalSubtitles += file.subtitlesCount
      translatedSubtitles += file.translatedCount
    })

    if (translatedSubtitles > 0) {
      const summary = await getBatchRunSummary(false, false)
      if (!summary) return
      setRunSummary(summary)
      setRegenerateAutoContext(false)
      setTranslatedStats({ translated: translatedSubtitles, total: totalSubtitles })
      setIsRestartDialogOpen(true)
    } else {
      const summary = await getBatchRunSummary(false, false)
      if (!summary) return
      setRunSummary(summary)
      setTranslatedStats({ translated: 0, total: totalSubtitles })
      setIsStartDialogOpen(true)
    }
  }

  const handleOpenContinueBatchDialog = async () => {
    if (batchFiles.length === 0 || isProcessing) return
    const summary = await getBatchRunSummary(true, false)
    if (!summary) return
    setRunSummary(summary)
    setTranslatedStats({
      translated: batchFiles.reduce((acc, file) => acc + file.translatedCount, 0),
      total: batchFiles.reduce((acc, file) => acc + file.subtitlesCount, 0)
    })
    setIsContinueDialogOpen(true)
  }

  const handleRegenerateAutoContextChange = async (checked: boolean) => {
    setRegenerateAutoContext(checked)
    const summary = await getBatchRunSummary(false, checked)
    if (summary) setRunSummary(summary)
  }

  const handlePreview = async (id: string) => {
    setCurrentTranslationId(id)
    setPreviewId(id)
  }

  const handlePreviewDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewId(null)
      if (previewId) saveTranslationData(previewId)
    }
  }

  const handleOpenExtraction = async (id: string) => {
    const extraction = await getExtractionDb(id)
    if (!extraction) {
      toast.error("Linked Auto Context extraction was not found.")
      return
    }
    setCurrentExtractionId(id)
    setPreviewExtractionId(id)
  }

  const confirmDeleteFile = async () => {
    if (!currentProject || !deleteFileId || isProcessing) return
    try {
      await removeTranslationFromBatch(currentProject.id, deleteFileId)
      setHasChanges(true)
      setDeleteFileId(null)
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const uploadInputId = "batch-file-upload-input"

  return (
    <div className="grid md:grid-cols-[1fr_402px] gap-6">
      {/* Left Column - Files */}
      <div className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center gap-2 px-2">
          {!isSelecting && (
            <div className="text-sm mr-auto">Finished: {finishedCount} / {batchFiles.length}</div>
          )}
          {isSelecting && (
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-sm">Selected: {selectedIds.size} / {batchFiles.length}</span>
            </div>
          )}
          {isSelecting && (
            <>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-lg"
                onClick={() => setIsDeleteSelectedDialogOpen(true)}
                disabled={selectedIds.size === 0}
              >
                <Trash className="size-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={handleSelectAllToggle}
                disabled={batchFiles.length === 0}
              >
                <ListChecks className="size-4" />
                {selectedIds.size === batchFiles.length ? 'Deselect All' : 'Select All'}
              </Button>
            </>
          )}
          {!isSelecting && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setIsLinkContextDialogOpen(true)}
              disabled={
                isProcessing
                || batchFiles.length === 0
                || !currentProject?.isBatchAutoContextEnabled
              }
            >
              <RiLinksLine data-icon="inline-start" />
              Link Context
            </Button>
          )}
          {!isSelecting && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => document.getElementById(uploadInputId)?.click()}
              disabled={isProcessing}
            >
              <Upload className="size-4" />
              Upload
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={toggleSelectMode}
            disabled={isProcessing || batchFiles.length === 0}
          >
            <CheckSquare className="size-4" />
            {isSelecting ? 'Cancel' : 'Select'}
          </Button>
        </div>

        <BatchFileList
          files={batchFiles}
          order={localOrder}
          isProcessing={isProcessing}
          selectMode={isSelecting}
          selectedIds={selectedIds}
          downloadOption={downloadOption}
          onDrop={handleFileDrop}
          onDragEnd={handleDragEnd}
          onDelete={setDeleteFileId}
          onDownload={handleSingleFileDownload}
          onClick={handlePreview}
          onPreviewAutoContext={currentProject?.isBatchAutoContextEnabled
            ? setPreviewAutoContextId
            : undefined}
          onSelectToggle={handleSelectToggle}
          uploadInputId={uploadInputId}
        />

        <div className="flex flex-wrap items-center gap-4 w-full">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleOpenStartBatchDialog}
            disabled={isProcessing || !session || batchFiles.length === 0 || isSelecting}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Play className="size-4" />
                {session ? `Translate ${batchFiles.length} files` : "Sign In to Start"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleStopBatchTranslation}
            disabled={!isProcessing}
          >
            <Square className="size-4" />
            Stop All
          </Button>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="w-full border-primary/25 hover:border-primary/50"
          onClick={handleOpenContinueBatchDialog}
          disabled={isProcessing || !session || batchFiles.length === 0 || (batchFiles.length - finishedCount <= 0) || isSelecting}
        >
          <FastForward className="size-4" />
          Continue Batch Translation ({batchFiles.length - finishedCount} remaining)
        </Button>

        <DownloadSection
          generateContent={handleGenerateZip}
          fileName={`${currentProject?.name}_translation.zip`}
          type="zip"
          downloadOption={downloadOption}
          setDownloadOption={setDownloadOption}
          combinedFormat={combinedFormat}
          setCombinedFormat={setCombinedFormat}
          toType={toType}
          setToType={setToType}
          noChangeOption
          showSelectors
        />
      </div>

      {/* Right Column - Settings */}
      <div className="flex flex-col h-full">
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Batch Settings */}
          <Card size="sm" className="mt-4 w-full shadow-xs">
            <CardContent className="flex flex-col gap-4">
              <FieldGroup className="gap-4 [&_[data-slot=field-description]]:text-xs">
                <Field orientation="horizontal" data-disabled={isProcessing || undefined}>
                  <FieldContent>
                    <FieldTitle>Max Concurrent Translations</FieldTitle>
                    <FieldDescription>
                      Files processed simultaneously (max 5)
                    </FieldDescription>
                  </FieldContent>
                  <div className="flex shrink-0 items-center gap-1 self-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.max(1, concurrentOperation - 1))}
                      disabled={isProcessing || concurrentOperation <= 1}
                      aria-label="Decrease concurrent translations"
                    >
                      −
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={MAX_BATCH_CONCURRENT_OPERATION}
                      value={concurrentOperation}
                      onChange={event => setConcurrentOperation(
                        currentProject?.id ?? "",
                        Math.max(1, Math.min(MAX_BATCH_CONCURRENT_OPERATION, parseInt(event.target.value) || 1)),
                      )}
                      className="w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isProcessing}
                      aria-label="Concurrent translations"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.min(MAX_BATCH_CONCURRENT_OPERATION, concurrentOperation + 1))}
                      disabled={isProcessing || concurrentOperation >= MAX_BATCH_CONCURRENT_OPERATION}
                      aria-label="Increase concurrent translations"
                    >
                      +
                    </Button>
                  </div>
                </Field>

                <BatchAutoContextSettings
                  isProcessing={isProcessing}
                  onOpenExtractionSettings={() => setIsExtractionSettingsOpen(true)}
                />
              </FieldGroup>

            </CardContent>
          </Card>

          <TabsContent value="basic" className="grow space-y-4 mt-4">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                <LanguageSelection settingsId={settingsId} />
                <ModelSelection settingsId={settingsId} />
                <ContextDocumentInput settingsId={settingsId} />
                <CustomInstructionsInput settingsId={settingsId} />
                <FewShotInput settingsId={settingsId} />
                <CopySharedSettingsButton
                  onClick={() => setIsCopySharedDialogOpen(true)}
                  disabled={isProcessing || batchFiles.length === 0}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="grow space-y-4 mt-4">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                <ModelDetail settingsId={settingsId} />
                <TemperatureSlider settingsId={settingsId} />
                <div className="border border-muted-foreground/20 rounded-md p-4 space-y-4">
                  <AdvancedReasoningSwitch />
                </div>
                <p className="text-sm font-semibold">Technical Options</p>
                <SplitSizeInput settingsId={settingsId} />
                <MaxCompletionTokenInput settingsId={settingsId} />
                <StructuredOutputSwitch settingsId={settingsId} />
                <FullContextMemorySwitch settingsId={settingsId} />
                <MinimalContextModeSwitch settingsId={settingsId} />
                <AdvancedSettingsResetButton settingsId={settingsId} />
                <CopySharedSettingsButton
                  onClick={() => setIsCopySharedDialogOpen(true)}
                  disabled={isProcessing || batchFiles.length === 0}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <PopulateContextDialog
        open={isLinkContextDialogOpen}
        onOpenChange={setIsLinkContextDialogOpen}
        translationBatchFiles={batchFiles}
        extractionBatchFiles={extractionBatchFiles}
        mode="link"
        startingExtractionId={currentProject?.batchAutoContextStartingExtractionId}
      />

      <CopySharedSettingsDialog
        open={isCopySharedDialogOpen}
        onOpenChange={setIsCopySharedDialogOpen}
        operationMode="translation"
        translationBatchFiles={batchFiles}
        extractionBatchFiles={extractionBatchFiles}
        sharedSettingsId={settingsId}
      />

      {currentProject && (
        <>
          <SettingsDialogue
            mode="project"
            isOpen={isExtractionSettingsOpen}
            onOpenChange={setIsExtractionSettingsOpen}
            projectName={currentProject.name}
            settingsId={currentProject.defaultExtractionSettingsId}
            resetFromSettingsId={GLOBAL_EXTRACTION_SETTINGS_ID}
            settingsParentType="extraction"
            onOpenGlobalSettings={() => {
              setIsExtractionSettingsOpen(false)
              setIsGlobalExtractionSettingsOpen(true)
            }}
          />
          <SettingsDialogue
            mode="global"
            isOpen={isGlobalExtractionSettingsOpen}
            onOpenChange={setIsGlobalExtractionSettingsOpen}
            settingsId={GLOBAL_EXTRACTION_SETTINGS_ID}
            settingsParentType="extraction"
          />
        </>
      )}

      <AlertDialog open={!!deleteFileId} onOpenChange={(open) => !open && setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this file from the batch?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFileId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteSelectedDialogOpen} onOpenChange={setIsDeleteSelectedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Files</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete ${selectedIds.size} selected file${selectedIds.size === 1 ? "" : "s"}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteSelectedDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleDeleteSelected(); setIsDeleteSelectedDialogOpen(false) }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restart Dialog */}
      <AlertDialog open={isRestartDialogOpen} onOpenChange={setIsRestartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Already Translated Content
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-4">
                <p>
                  You have already translated <strong>{translatedStats.translated}</strong> of <strong>{translatedStats.total}</strong> subtitles. Restart from the beginning?
                </p>
                <BatchRunSummary summary={runSummary} concurrentTranslations={concurrentOperation} />
                {runSummary?.autoContextEnabled && (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="regenerate-batch-auto-context"
                      checked={regenerateAutoContext}
                      onCheckedChange={checked => void handleRegenerateAutoContextChange(checked === true)}
                    />
                    <FieldLabel htmlFor="regenerate-batch-auto-context">
                      Regenerate Auto Context before restarting
                    </FieldLabel>
                  </Field>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsRestartDialogOpen(false)
              handleStartBatchTranslation(regenerateAutoContext)
            }}>
              Restart Translation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Dialog */}
      <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="size-5 text-sidebar-primary" />
              Start Batch Translation
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="w-full">
                <span className="block mb-2">Are you sure you want to start translating <strong>{batchFiles.length}</strong> files?</span>
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                  <span className="block font-semibold">Batch Settings:</span>
                  <ul className="list-disc list-inside">
                    <li>Process {concurrentOperation} files concurrently</li>
                    <li>{sourceLanguage} → {targetLanguage}</li>
                    <li>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <BatchRunSummary summary={runSummary} concurrentTranslations={concurrentOperation} />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsStartDialogOpen(false); handleStartBatchTranslation() }}>Start Translation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Continue Dialog */}
      <AlertDialog open={isContinueDialogOpen} onOpenChange={setIsContinueDialogOpen}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FastForward className="size-5 text-sidebar-primary" />
              Continue Batch Translation
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-4">
                <p>Continue translating <strong>{batchFiles.length - finishedCount}</strong> remaining files?</p>
                <BatchRunSummary summary={runSummary} concurrentTranslations={concurrentOperation} />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsContinueDialogOpen(false); handleContinueBatchTranslation() }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={handlePreviewDialogOpenChange}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Translation Preview</DialogTitle>
          </DialogHeader>
          {previewId && translationData[previewId] && (
            <div className="max-h-[80vh] overflow-y-auto">
              <SubtitleTranslatorMain
                currentId={previewId}
                translation={translationData[previewId]}
                settingsId={settingsId}
                isSharedSettings
                hideBackButton
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {previewAutoContextTranslation && (
        <BatchAutoContextPreviewDialog
          open={!!previewAutoContextId}
          onOpenChange={(open) => {
            if (!open) setPreviewAutoContextId(null)
          }}
          translation={previewAutoContextTranslation}
          extraction={previewAutoContextExtraction}
          contextDocument={previewAutoContextDocument}
          autoContextEnabled={!!currentProject?.isBatchAutoContextEnabled}
          runningIds={isExtractingSet}
          onOpenExtraction={handleOpenExtraction}
        />
      )}

      <Dialog
        open={!!previewExtractionId}
        onOpenChange={(open) => {
          if (!open) setPreviewExtractionId(null)
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[min(1100px,calc(100%-2rem))]">
          <DialogHeader>
            <DialogTitle>{previewExtractionId ? extractionData[previewExtractionId]?.title : "Auto Context"}</DialogTitle>
          </DialogHeader>
          {previewExtractionId && extractionData[previewExtractionId] && (
            <ContextExtractorMain
              currentId={previewExtractionId}
              settingsId={extractionData[previewExtractionId].settingsId}
              hideBackButton
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
