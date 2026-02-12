"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Upload,
  SquareCheckBig,
  SquarePen
} from "lucide-react"
import {
  ModelSelection,
  SubtitleCleanupSwitch,
  AdvancedSettingsResetButton,
  MaxCompletionTokenInput,
} from "../settings"
import { DownloadOption } from "@/types/subtitles"
import { arrayMove } from "@dnd-kit/sortable"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { ModelDetail } from "../translate/model-detail"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RenameEpisodesDialog } from "./rename-episodes-dialog"
import { ImportSubDialog } from "./import-sub-dialog"
import { CopySharedSettingsDialog } from "./copy-shared-settings-dialog"
import { DownloadSection } from "@/components/download-section"
import JSZip from "jszip"
import { ContextExtractorMain } from "../extract-context/context-extractor-main"
import { useBatchExtractionFiles } from "@/hooks/batch/use-batch-extraction-files"
import { useBatchTranslationFiles } from "@/hooks/batch/use-batch-translation-files"
import useBatchExtractionHandler from "@/hooks/batch/use-batch-extraction-handler"
import useBatchTranslationHandler from "@/hooks/batch/use-batch-translation-handler"
import { BatchFileList } from "./batch-file-list"
import { useBatchSelection } from "@/hooks/batch/use-batch-selection"
import { ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import { MAX_BATCH_CONCURRENT_OPERATION } from "@/constants/limits"

interface BatchExtractionViewProps {
  basicSettingsId: string
  advancedSettingsId: string
}

export function BatchExtractionView({ basicSettingsId, advancedSettingsId }: BatchExtractionViewProps) {
  const [activeTab, setActiveTab] = useState("basic")
  // Although extraction doesn't support "combinedFormat" or "toType" in the same way,
  // DownloadSection expects these props. We can keep local state or just pass defaults.
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("original")

  const [previewId, setPreviewId] = useState<string | null>(null)
  const [queueSet, setQueueSet] = useState<Set<string>>(new Set())
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)

  // Dialogs
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false)
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isImportSubDialogOpen, setIsImportSubDialogOpen] = useState(false)
  const [isImportSubLoading, setIsImportSubLoading] = useState(false)
  const [isCopySharedDialogOpen, setIsCopySharedDialogOpen] = useState(false)
  const [translatedStats, setTranslatedStats] = useState({ translated: 0, total: 0 })

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)
  const createExtractionForBatch = useProjectStore((state) => state.createExtractionForBatch)
  const removeExtractionFromBatch = useProjectStore((state) => state.removeExtractionFromBatch)

  const [localOrder, setLocalOrder] = useState<string[]>(currentProject?.extractions ?? [])

  useEffect(() => {
    setLocalOrder(currentProject?.extractions ?? [])
  }, [currentProject?.extractions])

  // Settings Stores
  const isUseSharedSettings = useBatchSettingsStore(state => state.getIsUseSharedSettings(currentProject?.id))
  const setUseSharedSettings = useBatchSettingsStore(state => state.setUseSharedSettings)
  const concurrentOperation = useBatchSettingsStore(state => state.getConcurrent(currentProject?.id))
  const setConcurrentOperation = useBatchSettingsStore(state => state.setConcurrentTranslations)
  const extractionMode = useBatchSettingsStore(state => state.getExtractionMode(currentProject?.id))
  const setExtractionMode = useBatchSettingsStore(state => state.setExtractionMode)

  const modelDetail = useSettingsStore((state) => state.getModelDetail(basicSettingsId))
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(basicSettingsId))

  // Data Stores
  const extractionData = useExtractionDataStore((state) => state.data)
  const loadExtraction = useExtractionDataStore((state) => state.getExtractionDb)
  const setCurrentExtractionId = useExtractionDataStore((state) => state.setCurrentId)
  const saveExtractionData = useExtractionDataStore((state) => state.saveData)

  const translationData = useTranslationDataStore((state) => state.data)

  const session = useSessionStore((state) => state.session)

  // Files hooks
  const {
    batchFiles,
    finishedCount,
    isBatchExtracting: isProcessing,
  } = useBatchExtractionFiles(
    localOrder,
    queueSet
  )

  const { batchFiles: translationBatchFiles } = useBatchTranslationFiles(
    currentProject?.translations ?? [],
    new Set()
  )

  const isSequentialExtraction = extractionMode === 'sequential'

  // Selection Hook
  const {
    isSelecting,
    selectedIds,
    isDeleteSelectedDialogOpen,
    setIsDeleteSelectedDialogOpen,
    toggleSelectMode,
    handleSelectToggle,
    handleDeleteSelected,
    handleToggleMarkSelected,
    handleSelectAllToggle
  } = useBatchSelection({ batchFiles, operationMode: 'extraction' })

  // Extraction Handler Hook
  const {
    handleStartBatchExtraction,
    handleContinueBatchExtraction,
    handleStopBatchExtraction,
  } = useBatchExtractionHandler({
    basicSettingsId,
    advancedSettingsId,
    batchFiles,
    isBatchExtracting: isProcessing,
    state: {
      setActiveTab,
      setQueueSet,
    },
  })

  // We need generateSubtitleContent from translation handler for importing subs
  const { generateSubtitleContent } = useBatchTranslationHandler({
    basicSettingsId,
    advancedSettingsId,
    batchFiles: translationBatchFiles,
    isBatchTranslating: false,
    state: {
      toType: "no-change",
      setIsRestartTranslationDialogOpen: () => {},
      setIsContinueTranslationDialogOpen: () => {},
      setActiveTab: () => {},
      setQueueSet: () => {},
    }
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
        const extractionId = await createExtractionForBatch(currentProject.id, file, content)
        await loadExtraction(extractionId)
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

    const ids = currentProject.extractions
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(localOrder, oldIndex, newIndex)
    setLocalOrder(newOrder)
    updateProjectItems(currentProject.id, newOrder, 'extractions')
  }

  const handleSingleFileDownload = (batchFileId: string) => {
    const extraction = extractionData[batchFileId]
    if (!extraction) return
    let content = extraction.contextResult || ''
    content = content.replace(/<done>\s*$/, '')
    if (!content.trim()) return
    const baseTitle = extraction.title || 'extraction'
    const dotIdx = baseTitle.lastIndexOf('.')
    const baseName = dotIdx > 0 ? baseTitle.slice(0, dotIdx) : baseTitle
    const fileName = `${baseName}.txt`
    const blob = new Blob([content], { type: "text/plain" })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateZip = async (): Promise<Blob> => {
    const zip = new JSZip()
    const nameCountMap = new Map<string, number>()

    for (const batchFile of batchFiles) {
      const extraction = extractionData[batchFile.id]
      if (!extraction) continue
      let content = extraction.contextResult || ''
      content = content.replace(/<done>\s*$/, '')

      const baseTitle = extraction.title || 'extraction'
      const dotIdx = baseTitle.lastIndexOf('.')
      const baseName = dotIdx > 0 ? baseTitle.slice(0, dotIdx) : baseTitle
      const ext = 'txt'

      const fileKey = `${baseName}.${ext}`
      const currentCount = nameCountMap.get(fileKey) ?? 0
      const newCount = currentCount + 1
      nameCountMap.set(fileKey, newCount)

      const uniqueFileName = newCount === 1
        ? fileKey
        : `${baseName} (${newCount}).${ext}`

      zip.file(uniqueFileName, content)
    }
    return await zip.generateAsync({ type: "blob" })
  }

  const handleConfirmImportSub = async (selectedIds: string[]) => {
    if (!currentProject) return
    setIsImportSubLoading(true)
    let success = 0
    let failed = 0
    try {
      const filesToImport = translationBatchFiles.filter(f => selectedIds.includes(f.id))
      for (const file of filesToImport) {
        const translation = translationData[file.id]
        if (!translation) {
          failed += 1
          continue
        }
        try {
          const originalContent = generateSubtitleContent(
            file.id,
            "original",
            "o-n-t",
            translation.parsed?.type,
          )
          if (!originalContent || !originalContent.trim()) {
            failed += 1
            continue
          }

          const ext = translation.parsed?.type || "srt"
          const hasExt = translation.title.toLowerCase().endsWith(`.${ext}`)
          const fileName = hasExt ? translation.title : `${translation.title}.${ext}`
          const newFile = new File([originalContent], fileName, { type: "text/plain" })

          const extractionId = await createExtractionForBatch(currentProject.id, newFile, originalContent)
          await loadExtraction(extractionId)
          success += 1
        } catch (error) {
          console.error("Import Subtitle: Failed to create extraction for", file.title, error)
          failed += 1
          toast.error(`Failed to create extraction for ${file.title}`)
        }
      }

      if (success > 0) {
        toast.success(`Created ${success} extraction${success === 1 ? "" : "s"} from original subtitles`)
      }
      if (failed > 0 && success === 0) {
        toast.error("Failed to create extractions from original subtitles")
      } else if (failed > 0) {
        toast.info(`Some files failed: ${failed}`)
      }
      setIsImportSubDialogOpen(false)
    } finally {
      setIsImportSubLoading(false)
    }
  }

  const handleOpenStartBatchDialog = () => {
    if (batchFiles.length === 0 || isProcessing) return

    const touchedCount = batchFiles.filter(f => f.status === 'partial' || f.status === 'done').length
    const totalFiles = batchFiles.length

    if (touchedCount > 0) {
      setTranslatedStats({ translated: touchedCount, total: totalFiles })
      setIsRestartDialogOpen(true)
    } else {
      setTranslatedStats({ translated: 0, total: totalFiles })
      setIsStartDialogOpen(true)
    }
  }

  const handleOpenContinueBatchDialog = () => {
    if (batchFiles.length === 0 || isProcessing) return
    setIsContinueDialogOpen(true)
  }

  const handlePreview = async (id: string) => {
    setCurrentExtractionId(id)
    setPreviewId(id)
  }

  const handlePreviewDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewId(null)
      if (previewId) saveExtractionData(previewId)
    }
  }

  const confirmDeleteFile = async () => {
    if (!currentProject || !deleteFileId) return
    try {
      await removeExtractionFromBatch(currentProject.id, deleteFileId)
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
                    className="gap-2 rounded-lg bg-green-500 hover:bg-green-600 text-white border-0"
                    onClick={handleToggleMarkSelected}
                    disabled={isProcessing || batchFiles.length === 0 || selectedIds.size === 0}
                  >
                    <SquareCheckBig className="h-4 w-4" />
                    Mark
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
                onClick={() => setIsRenameDialogOpen(true)}
                disabled={isProcessing || batchFiles.length === 0}
              >
                <SquarePen className="h-4 w-4" />
                Rename
             </Button>
          )}
          {!isSelecting && (
             <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={() => setIsImportSubDialogOpen(true)}
                disabled={isProcessing || translationBatchFiles.length === 0}
              >
                <FolderInput className="h-4 w-4" />
                Import
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
                Extracting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {session ? `Extract ${batchFiles.length} files` : "Sign In to Start"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={handleStopBatchExtraction}
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
          Continue Batch Extraction ({batchFiles.length - finishedCount} remaining)
        </Button>

        <DownloadSection
          generateContent={handleGenerateZip}
          fileName={`${currentProject?.name || "extractions"}.zip`}
          type="zip"
          downloadOption={downloadOption}
          setDownloadOption={setDownloadOption}
          noChangeOption={false}
          showSelectors={false}
          combinedFormat="o-n-t"
          setCombinedFormat={() => {}}
          toType="no-change"
          setToType={() => {}}
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
                <span className="text-sm font-semibold">Max Concurrent Extractions</span>
                <span className="text-xs text-muted-foreground">
                   {isSequentialExtraction
                      ? 'Files processed one-by-one (forced)'
                      : `Files processed simultaneously (max ${MAX_BATCH_CONCURRENT_OPERATION})`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                  onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.max(1, concurrentOperation - 1))}
                  disabled={isSequentialExtraction || concurrentOperation <= 1}
                >
                  -
                </Button>
                <input
                  type="number"
                  min={1}
                  max={MAX_BATCH_CONCURRENT_OPERATION}
                  value={isSequentialExtraction ? 1 : concurrentOperation}
                  onChange={(e) => setConcurrentOperation(
                    currentProject?.id ?? "",
                    Math.max(1, Math.min(MAX_BATCH_CONCURRENT_OPERATION, parseInt(e.target.value) || 1))
                  )}
                  disabled={isSequentialExtraction}
                  className="w-12 h-8 text-center border border-input rounded-md bg-background shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                  onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.min(MAX_BATCH_CONCURRENT_OPERATION, concurrentOperation + 1))}
                  disabled={isSequentialExtraction || concurrentOperation >= MAX_BATCH_CONCURRENT_OPERATION}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Extraction Mode</span>
                <span className="text-xs text-muted-foreground">
                  {extractionMode === 'sequential'
                    ? 'Sequential: process one-by-one using previous context'
                    : 'Independent: process files concurrently without sharing context'}
                </span>
              </div>
              <Select
                value={extractionMode}
                onValueChange={(value: "independent" | "sequential") => {
                  setExtractionMode(currentProject?.id ?? "", value)
                }}
                disabled={isProcessing}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="independent">Independent</SelectItem>
                </SelectContent>
              </Select>
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
                <ModelSelection basicSettingsId={basicSettingsId} advancedSettingsId={advancedSettingsId} />
                <SubtitleCleanupSwitch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className={cn("p-4 space-y-4", !isUseSharedSettings && "pointer-events-none opacity-50")}>
                <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                <ModelDetail basicSettingsId={basicSettingsId} />
                <MaxCompletionTokenInput basicSettingsId={basicSettingsId} advancedSettingsId={advancedSettingsId} />
                <AdvancedSettingsResetButton basicSettingsId={basicSettingsId} advancedSettingsId={advancedSettingsId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <RenameEpisodesDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        batchFiles={batchFiles}
      />

      <ImportSubDialog
        open={isImportSubDialogOpen}
        onOpenChange={(open) => { if (!isImportSubLoading) setIsImportSubDialogOpen(open) }}
        translationBatchFiles={translationBatchFiles}
        onConfirm={handleConfirmImportSub}
        isLoading={isImportSubLoading}
      />

      <CopySharedSettingsDialog
        open={isCopySharedDialogOpen}
        onOpenChange={setIsCopySharedDialogOpen}
        operationMode="extraction"
        translationBatchFiles={translationBatchFiles}
        extractionBatchFiles={batchFiles}
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
              Already Extracted Content
            </AlertDialogTitle>
            <AlertDialogDescription>
               <span className="block mb-2">
                You have already processed <strong>{translatedStats.translated}</strong> of <strong>{translatedStats.total}</strong> files.
              </span>
              <span className="block">Are you sure you want to start extraction from the beginning?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsRestartDialogOpen(false); handleStartBatchExtraction() }}>Restart Extraction</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Dialog */}
      <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Start Batch Extraction
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block mb-2">Are you sure you want to start extracting <strong>{batchFiles.length}</strong> files?</span>
               {isUseSharedSettings ? (
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                  <span className="block font-semibold">Shared Settings:</span>
                  <ul className="list-disc list-inside">
                    <li>
                       {isSequentialExtraction ? "Process one-by-one (Sequential)" : `Process up to ${concurrentOperation} concurrently`}
                    </li>
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
            <AlertDialogAction onClick={() => { setIsStartDialogOpen(false); handleStartBatchExtraction() }}>Start Extraction</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Continue Dialog */}
      <AlertDialog open={isContinueDialogOpen} onOpenChange={setIsContinueDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <AlertDialogTitle className="flex items-center gap-2">
              <FastForward className="h-5 w-5 text-primary" />
              Continue Batch Extraction
            </AlertDialogTitle>
            <AlertDialogDescription>
               <span className="block">Continue extracting <strong>{batchFiles.length - finishedCount}</strong> remaining files?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
           <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsContinueDialogOpen(false); handleContinueBatchExtraction() }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={handlePreviewDialogOpenChange}>
        <DialogContent className="max-w-6xl w-full">
          <DialogHeader>
            <DialogTitle>Extraction Preview</DialogTitle>
          </DialogHeader>
          {previewId && extractionData[previewId] && (
            <div className="max-h-[80vh] overflow-y-auto">
              <ContextExtractorMain
                currentId={previewId}
                basicSettingsId={isUseSharedSettings ? basicSettingsId : extractionData[previewId].basicSettingsId}
                advancedSettingsId={isUseSharedSettings ? advancedSettingsId : extractionData[previewId].advancedSettingsId}
                isSharedSettings={isUseSharedSettings}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
