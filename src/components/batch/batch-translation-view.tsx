"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { cn, createUtf8SubtitleBlob } from "@/lib/utils"
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
  FolderInput,
  FastForward,
  Trash,
  Upload
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
import { DownloadOption, CombinedFormat, SubtitleType } from "@/types/subtitles"
import { arrayMove } from "@dnd-kit/sortable"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { ModelDetail } from "../translate/model-detail"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PopulateContextDialog } from "./populate-context-dialog"
import { CopySharedSettingsDialog } from "./copy-shared-settings-dialog"
import { DownloadSection } from "@/components/download-section"
import JSZip from "jszip"
import SubtitleTranslatorMain from "../translate/subtitle-translator-main"
import { useBatchTranslationFiles } from "@/hooks/batch/use-batch-translation-files"
import { useBatchExtractionFiles } from "@/hooks/batch/use-batch-extraction-files"
import useBatchTranslationHandler from "@/hooks/batch/use-batch-translation-handler"
import { BatchFileList } from "./batch-file-list"
import { useBatchSelection } from "@/hooks/batch/use-batch-selection"
import { ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import { MAX_BATCH_CONCURRENT_OPERATION } from "@/constants/limits"

interface BatchTranslationViewProps {
  basicSettingsId: string
  advancedSettingsId: string
}

export function BatchTranslationView({ basicSettingsId, advancedSettingsId }: BatchTranslationViewProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("translated")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")
  const [toType, setToType] = useState<SubtitleType | "no-change">("no-change")

  const [previewId, setPreviewId] = useState<string | null>(null)
  const [queueSet, setQueueSet] = useState<Set<string>>(new Set())
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)

  // Dialogs
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false)
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false)
  const [isPopulateDialogOpen, setIsPopulateDialogOpen] = useState(false)
  const [isCopySharedDialogOpen, setIsCopySharedDialogOpen] = useState(false)
  const [translatedStats, setTranslatedStats] = useState({ translated: 0, total: 0 })

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)
  const createTranslationForBatch = useProjectStore((state) => state.createTranslationForBatch)
  const removeTranslationFromBatch = useProjectStore((state) => state.removeTranslationFromBatch)

  const [localOrder, setLocalOrder] = useState<string[]>(currentProject?.translations ?? [])

  useEffect(() => {
    setLocalOrder(currentProject?.translations ?? [])
  }, [currentProject?.translations])

  // Settings Stores
  const isUseSharedSettings = useBatchSettingsStore(state => state.getIsUseSharedSettings(currentProject?.id))
  const setUseSharedSettings = useBatchSettingsStore(state => state.setUseSharedSettings)
  const concurrentOperation = useBatchSettingsStore(state => state.getConcurrent(currentProject?.id))
  const setConcurrentOperation = useBatchSettingsStore(state => state.setConcurrentTranslations)

  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(basicSettingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(basicSettingsId))
  const modelDetail = useSettingsStore((state) => state.getModelDetail(basicSettingsId))
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(basicSettingsId))

  // Data Stores
  const translationData = useTranslationDataStore((state) => state.data)
  const loadTranslation = useTranslationDataStore((state) => state.getTranslationDb)
  const setCurrentTranslationId = useTranslationDataStore((state) => state.setCurrentId)
  const saveTranslationData = useTranslationDataStore((state) => state.saveData)

  const session = useSessionStore((state) => state.session)

  // Files hooks
  const {
    batchFiles,
    finishedCount,
    isBatchTranslating: isProcessing,
  } = useBatchTranslationFiles(
    localOrder,
    queueSet
  )

  // Also need extraction files just for "Populate Context" and "Copy Shared Settings" features that might cross-reference
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
    generateSubtitleContent,
  } = useBatchTranslationHandler({
    basicSettingsId,
    advancedSettingsId,
    batchFiles,
    isBatchTranslating: isProcessing,
    state: {
      toType,
      setIsRestartTranslationDialogOpen: setIsRestartDialogOpen,
      setIsContinueTranslationDialogOpen: setIsContinueDialogOpen,
      setActiveTab,
      setQueueSet,
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
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        toast.error(`Failed to add ${file.name} to batch`)
      }
    }
  }

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
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

  const handleOpenStartBatchDialog = () => {
    if (batchFiles.length === 0 || isProcessing) return

    let totalSubtitles = 0
    let translatedSubtitles = 0

    batchFiles.forEach(file => {
      totalSubtitles += file.subtitlesCount
      translatedSubtitles += file.translatedCount
    })

    if (translatedSubtitles > 0) {
      setTranslatedStats({ translated: translatedSubtitles, total: totalSubtitles })
      setIsRestartDialogOpen(true)
    } else {
      setTranslatedStats({ translated: 0, total: totalSubtitles })
      setIsStartDialogOpen(true)
    }
  }

  const handleOpenContinueBatchDialog = () => {
    if (batchFiles.length === 0 || isProcessing) return
    setTranslatedStats({
      translated: batchFiles.reduce((acc, file) => acc + file.translatedCount, 0),
      total: batchFiles.reduce((acc, file) => acc + file.subtitlesCount, 0)
    })
    setIsContinueDialogOpen(true)
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

  const confirmDeleteFile = async () => {
    if (!currentProject || !deleteFileId) return
    try {
      await removeTranslationFromBatch(currentProject.id, deleteFileId)
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
                className="gap-2 rounded-lg"
                onClick={() => setIsDeleteSelectedDialogOpen(true)}
                disabled={selectedIds.size === 0}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={handleSelectAllToggle}
                disabled={batchFiles.length === 0}
              >
                <ListChecks className="h-4 w-4" />
                {selectedIds.size === batchFiles.length ? 'Deselect All' : 'Select All'}
              </Button>
            </>
          )}
          {!isSelecting && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => setIsPopulateDialogOpen(true)}
              disabled={isProcessing || batchFiles.length === 0}
            >
              <FolderInput className="h-4 w-4" />
              Get Context
            </Button>
          )}
          {!isSelecting && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => document.getElementById(uploadInputId)?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg"
            onClick={toggleSelectMode}
            disabled={isProcessing || batchFiles.length === 0}
          >
            <CheckSquare className="h-4 w-4" />
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
          onSelectToggle={handleSelectToggle}
          uploadInputId={uploadInputId}
        />

        <div className="flex flex-wrap items-center gap-4 w-full">
          <Button
            className="h-10 flex-1"
            onClick={handleOpenStartBatchDialog}
            disabled={isProcessing || !session || batchFiles.length === 0 || isSelecting}
          >
            {isProcessing ? (
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
            className="h-10 flex-1"
            onClick={handleStopBatchTranslation}
            disabled={!isProcessing}
          >
            <Square className="h-4 w-4" />
            Stop All
          </Button>
        </div>

        <Button
          variant="outline"
          className="h-10 w-full border-primary/25 hover:border-primary/50"
          onClick={handleOpenContinueBatchDialog}
          disabled={isProcessing || !session || batchFiles.length === 0 || (batchFiles.length - finishedCount <= 0) || isSelecting}
        >
          <FastForward className="h-4 w-4" />
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
          <div className="space-y-4 w-full p-4 mt-4 rounded-xl border border-input bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="shared-settings-switch" className="flex flex-col">
                <span className="text-sm font-semibold">Settings Mode</span>
                <span className="text-xs text-muted-foreground">
                  {isUseSharedSettings ? "Using shared batch settings" : "Individual file settings"}
                </span>
              </label>
              <Switch
                id="shared-settings-switch"
                checked={isUseSharedSettings}
                onCheckedChange={(checked) => setUseSharedSettings(currentProject?.id ?? "", checked)}
                disabled={isProcessing}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Max Concurrent Translations</span>
                <span className="text-xs text-muted-foreground">
                  Files processed simultaneously (max {MAX_BATCH_CONCURRENT_OPERATION})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                  onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.max(1, concurrentOperation - 1))}
                  disabled={concurrentOperation <= 1}
                >
                  -
                </Button>
                <input
                  type="number"
                  min={1}
                  max={MAX_BATCH_CONCURRENT_OPERATION}
                  value={concurrentOperation}
                  onChange={(e) => setConcurrentOperation(
                    currentProject?.id ?? "",
                    Math.max(1, Math.min(MAX_BATCH_CONCURRENT_OPERATION, parseInt(e.target.value) || 1))
                  )}
                  className="w-12 h-8 text-center border border-input rounded-md bg-background shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                  onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.min(MAX_BATCH_CONCURRENT_OPERATION, concurrentOperation + 1))}
                  disabled={concurrentOperation >= MAX_BATCH_CONCURRENT_OPERATION}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Copy Shared Settings trigger */}
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={() => setIsCopySharedDialogOpen(true)}
                disabled={isProcessing || batchFiles.length === 0}
              >
                <ListChecks className="h-4 w-4" />
                Copy Shared Settings...
              </Button>
            </div>
          </div>

          <TabsContent value="basic" className="flex-grow space-y-4 mt-4">
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className={cn("p-4 space-y-4", !isUseSharedSettings && "pointer-events-none opacity-50")}>
                <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                <LanguageSelection basicSettingsId={basicSettingsId} />
                <ModelSelection basicSettingsId={basicSettingsId} advancedSettingsId={advancedSettingsId} />
                <ContextDocumentInput basicSettingsId={basicSettingsId} />
                <div className="m-[2px]">
                  <CustomInstructionsInput basicSettingsId={basicSettingsId} />
                </div>
                <div className="m-[2px]">
                  <FewShotInput basicSettingsId={basicSettingsId} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className={cn("p-4 space-y-4", !isUseSharedSettings && "pointer-events-none opacity-50")}>
                <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                <ModelDetail basicSettingsId={basicSettingsId} />
                <TemperatureSlider advancedSettingsId={advancedSettingsId} />
                <div className="border border-muted-foreground/20 rounded-md p-4 space-y-4">
                  <AdvancedReasoningSwitch />
                </div>
                <p className="text-sm font-semibold">Technical Options</p>
                <SplitSizeInput advancedSettingsId={advancedSettingsId} />
                <MaxCompletionTokenInput basicSettingsId={basicSettingsId} advancedSettingsId={advancedSettingsId} />
                <StructuredOutputSwitch basicSettingsId={basicSettingsId} advancedSettingsId={advancedSettingsId} />
                <FullContextMemorySwitch advancedSettingsId={advancedSettingsId} />
                <BetterContextCachingSwitch advancedSettingsId={advancedSettingsId} />
                <AdvancedSettingsResetButton basicSettingsId={basicSettingsId} advancedSettingsId={advancedSettingsId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <PopulateContextDialog
        open={isPopulateDialogOpen}
        onOpenChange={setIsPopulateDialogOpen}
        translationBatchFiles={batchFiles}
        extractionBatchFiles={extractionBatchFiles}
      />

      <CopySharedSettingsDialog
        open={isCopySharedDialogOpen}
        onOpenChange={setIsCopySharedDialogOpen}
        operationMode="translation"
        translationBatchFiles={batchFiles}
        extractionBatchFiles={extractionBatchFiles}
        sharedBasicSettingsId={basicSettingsId}
        sharedAdvancedSettingsId={advancedSettingsId}
      />

      <AlertDialog open={!!deleteFileId} onOpenChange={(open) => !open && setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this file from the batch?</AlertDialogDescription>
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
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Already Translated Content
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block mb-2">
                You have already translated <strong>{translatedStats.translated}</strong> of <strong>{translatedStats.total}</strong> subtitles.
              </span>
              <span className="block">Are you sure you want to translate from the beginning?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsRestartDialogOpen(false); handleStartBatchTranslation() }}>Restart Translation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Dialog */}
      <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Start Batch Translation
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block mb-2">Are you sure you want to start translating <strong>{batchFiles.length}</strong> files?</span>
              {isUseSharedSettings ? (
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                  <span className="block font-semibold">Shared Settings:</span>
                  <ul className="list-disc list-inside">
                    <li>Process {concurrentOperation} files concurrently</li>
                    <li>{sourceLanguage} → {targetLanguage}</li>
                    <li>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</li>
                  </ul>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                  <span className="block font-semibold">Individual Settings:</span>
                  Each file uses its own settings.
                </div>
              )}
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
              <FastForward className="h-5 w-5 text-primary" />
              Continue Batch Translation
            </AlertDialogTitle>
            <AlertDialogDescription>
               <span className="block">Continue translating <strong>{batchFiles.length - finishedCount}</strong> remaining files?</span>
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
        <DialogContent className="max-w-6xl w-full">
          <DialogHeader>
            <DialogTitle>Translation Preview</DialogTitle>
          </DialogHeader>
          {previewId && translationData[previewId] && (
            <div className="max-h-[80vh] overflow-y-auto">
              <SubtitleTranslatorMain
                currentId={previewId}
                translation={translationData[previewId]}
                basicSettingsId={isUseSharedSettings ? basicSettingsId : translationData[previewId].basicSettingsId}
                advancedSettingsId={isUseSharedSettings ? advancedSettingsId : translationData[previewId].advancedSettingsId}
                isSharedSettings={isUseSharedSettings}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
