"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
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
  Upload,
  Loader2,
  Trash,
  ArrowLeft,
  FastForward,
  Square,
  CheckSquare,
  ListChecks,
  AlertTriangle,
  FileText,
  Languages,
  Layers,
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
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import { ModelDetail } from "../translate/model-detail"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SortableBatchFile } from "./sortable-batch-file"
import { mergeIntervalsWithGap } from "@/lib/subtitles/utils/merge-intervals-w-gap"
import { countUntranslatedLines } from "@/lib/subtitles/utils/count-untranslated"
import { DownloadSection } from "@/components/download-section"
import JSZip from "jszip"
import { UserCreditData } from "@/types/user"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { SUBTITLE_NAME_MAP, ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import SubtitleTranslatorMain from "../translate/subtitle-translator-main"
import { useTranslationHandler } from "@/hooks/use-translation-handler"
import { BatchFile } from "../../types/batch"
import { useBatchTranslationFiles } from "@/hooks/use-batch-translation-files"
import { useBatchExtractionFiles } from "@/hooks/use-batch-extraction-files"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionHandler } from "@/hooks/use-extraction-handler"
import useBatchTranslationHandler from "@/hooks/use-batch-translation-handler"
import useBatchExtractionHandler from "@/hooks/use-batch-extraction-handler"

const MAX_CONCURRENT_OPERATION = 5

interface BatchMainProps {
  basicSettingsId: string
  advancedSettingsId: string
}

export default function BatchMain({ basicSettingsId, advancedSettingsId }: BatchMainProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("translated")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")
  const [toType, setToType] = useState<SubtitleType | "no-change">("no-change")
  const [operationMode, setOperationMode] = useState<"translation" | "extraction">("translation")

  // Selection state
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [queueSet, setQueueSet] = useState<Set<string>>(new Set())

  // Confirmation dialog for starting translation
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false)
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false)
  const [translatedStats, setTranslatedStats] = useState({ translated: 0, total: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const createTranslationForBatch = useProjectStore((state) => state.createTranslationForBatch)
  const renameProject = useProjectStore((state) => state.renameProject)
  const removeTranslationFromBatch = useProjectStore((state) => state.removeTranslationFromBatch)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)

  // Batch Settings Store
  const isUseSharedSettings = useBatchSettingsStore(state => !state.individualIds.has(currentProject?.id ?? ""))
  const setUseSharedSettings = useBatchSettingsStore(state => state.setUseSharedSettings)
  const concurrentOperation = useBatchSettingsStore(state => state.concurrentMap[currentProject?.id ?? ""] ?? 3)
  const setConcurrentOperation = useBatchSettingsStore(state => state.setConcurrentTranslations)

  const [order, setOrder] = useState<string[]>([])

  useEffect(() => {
    if (operationMode === 'translation') {
      setOrder(currentProject?.translations ?? [])
    } else {
      setOrder(currentProject?.extractions ?? [])
    }
  }, [currentProject?.extractions, currentProject?.translations, operationMode])

  // Translation Data Store
  const translationData = useTranslationDataStore((state) => state.data)
  const loadTranslation = useTranslationDataStore((state) => state.getTranslationDb)
  const setCurrentTranslationId = useTranslationDataStore((state) => state.setCurrentId)
  const saveTranslationData = useTranslationDataStore((state) => state.saveData)

  // Extraction Data Store
  const extractionData = useExtractionDataStore((state) => state.data)
  const loadExtraction = useExtractionDataStore((state) => state.getExtractionDb)
  const saveExtractionData = useExtractionDataStore((state) => state.saveData)

  // Settings Stores
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(basicSettingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(basicSettingsId))
  const modelDetail = useSettingsStore((state) => state.getModelDetail(basicSettingsId))
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(basicSettingsId))

  // Other
  const session = useSessionStore((state) => state.session)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Get batch files
  const {
    batchFiles: translationBatchFiles,
    finishedCount: translationFinishedCount,
    isBatchTranslating,
  } = useBatchTranslationFiles(order, queueSet)

  const {
    batchFiles: extractionBatchFiles,
    finishedCount: extractionFinishedCount,
    isBatchExtracting,
  } = useBatchExtractionFiles(order, queueSet)

  const batchFiles = operationMode === 'translation' ? translationBatchFiles : extractionBatchFiles
  const finishedCount = operationMode === 'translation' ? translationFinishedCount : extractionFinishedCount
  const isProcessing = operationMode === 'translation' ? isBatchTranslating : isBatchExtracting

  // Batch hooks
  const {
    handleStartBatchTranslation,
    handleContinueBatchTranslation,
    handleStopBatchTranslation,
    generateSubtitleContent,
  } = useBatchTranslationHandler({
    basicSettingsId,
    advancedSettingsId,
    batchFiles: translationBatchFiles,
    isBatchTranslating,
    state: {
      toType,
      setIsRestartTranslationDialogOpen: setIsRestartDialogOpen,
      setIsContinueTranslationDialogOpen: setIsContinueDialogOpen,
      setActiveTab,
      setQueueSet,
    },
  })

  const {
    handleStartBatchExtraction,
    handleStopBatchExtraction,
  } = useBatchExtractionHandler({
    basicSettingsId,
    advancedSettingsId,
    batchFiles: extractionBatchFiles,
    isBatchExtracting,
    state: {
      setActiveTab,
      setQueueSet,
    },
  })

  // --------------------- Selection helpers ---------------------
  const toggleSelectMode = () => {
    setIsSelecting(prev => {
      if (prev) {
        setSelectedIds(new Set())
      }
      return !prev
    })
  }

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (!currentProject) return
    for (const id of Array.from(selectedIds)) {
      try {
        await removeTranslationFromBatch(currentProject.id, id)
      } catch {
        toast.error('Failed to delete file')
      }
    }
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  const handleSelectAllToggle = () => {
    if (selectedIds.size === batchFiles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(batchFiles.map(f => f.id)))
    }
  }

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event
    if (!over || !currentProject) return
    if (active.id === over.id) return
    const oldIndex = currentProject.translations.indexOf(active.id as string)
    const newIndex = currentProject.translations.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(order, oldIndex, newIndex)
    setOrder(newOrder)
    updateProjectItems(currentProject.id, newOrder, 'translations')
  }

  const handleFileDrop = async (droppedFiles: FileList | File[]) => {
    if (!droppedFiles || !currentProject || !currentProject.isBatch) return

    // Convert to array if it's a FileList
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

  const handleOpenStartBatchDialog = () => {
    if (batchFiles.length === 0 || isProcessing) return

    let totalSubtitles = 0
    let translatedSubtitles = 0

    batchFiles.forEach(file => {
      totalSubtitles += file.subtitlesCount
      translatedSubtitles += file.translatedCount
    })

    if (translatedSubtitles > 0) {
      setTranslatedStats({
        translated: translatedSubtitles,
        total: totalSubtitles
      })
      setIsRestartDialogOpen(true)
    } else {
      setTranslatedStats({
        translated: 0,
        total: totalSubtitles
      })
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

  const handleSingleFileDownload = (batchFileId: string) => {
    const translation = translationData[batchFileId]
    if (!translation) return

    const fileContent = generateSubtitleContent(batchFileId, downloadOption, combinedFormat)
    if (!fileContent) return

    const ext = translation.parsed?.type || "srt"
    const hasExt = translation.title.toLowerCase().endsWith(`.${ext}`)
    const fileName = hasExt ? translation.title : `${translation.title}.${ext}`

    const blob = new Blob([fileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateZip = async (
    option: DownloadOption,
    format: CombinedFormat,
  ): Promise<Blob> => {
    const zip = new JSZip()

    const nameCountMap = new Map<string, number>()

    for (const batchFile of batchFiles) {
      const translation = translationData[batchFile.id]
      if (!translation) continue
      const fileContent = generateSubtitleContent(batchFile.id, option, format)

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

      zip.file(uniqueFileName, fileContent)
    }

    return await zip.generateAsync({ type: "blob" })
  }

  const handlePreview = async (id: string) => {
    await loadTranslation(id)
    setCurrentTranslationId(id)
    setPreviewId(id)
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
        <Select value={operationMode} onValueChange={(value: "translation" | "extraction") => setOperationMode(value)}>
          <SelectTrigger className="w-fit h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="translation">
              <div className="flex items-center gap-2 pr-1">
                <div className="h-4 w-4">
                  <Languages className="h-4 w-4" />
                </div>
                Translation
              </div>
            </SelectItem>
            <SelectItem value="extraction">
              <div className="flex items-center gap-2 pr-1">
                <div className="h-4 w-4">
                  <Layers className="h-4 w-4" />
                </div>
                Extraction
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Link href="/project">
          <Button variant="outline" className="h-10">
            <FileText className="h-5 w-5" />
            See as Project
          </Button>
        </Link>
        <Button
          variant="outline"
          className="h-10"
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
            hidden
            onChange={handleFileInputChange}
            accept={ACCEPTED_FORMATS.join(",")}
            multiple
          />

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
                  Delete Subtitle
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
                onClick={handleClickFileUpload}
                disabled={isProcessing || batchFiles.length === 0}
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

          <DragAndDrop onDropFiles={handleFileDrop} disabled={isProcessing}>
            <div className="space-y-2 h-[510px] pr-2 overflow-x-hidden overflow-y-auto">
              {batchFiles.length ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={order} strategy={verticalListSortingStrategy}>
                    {batchFiles.map(batchFile => (
                      <SortableBatchFile
                        key={batchFile.id}
                        batchFile={batchFile}
                        onDelete={id => setDeleteFileId(id)}
                        onDownload={handleSingleFileDownload}
                        onClick={handlePreview}
                        selectMode={isSelecting}
                        selected={selectedIds.has(batchFile.id)}
                        onSelectToggle={handleSelectToggle}
                        downloadOption={downloadOption}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div
                  className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                  onClick={handleClickFileUpload}
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground text-center">
                    Drag and drop file here, or click to select a file.
                    <br />
                    {Array.from(SUBTITLE_NAME_MAP.keys()).join(", ").toUpperCase()} subtitles file.
                  </p>
                </div>
              )}
            </div>
          </DragAndDrop>

          <div className="flex flex-wrap items-center gap-4 w-full">
            <Button
              className="h-10 flex-1"
              onClick={handleOpenStartBatchDialog}
              disabled={isProcessing || !session || batchFiles.length === 0}
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
            disabled={isProcessing || !session || batchFiles.length === 0}
          >
            <FastForward className="h-4 w-4" />
            Continue Batch Translation ({batchFiles.length - finishedCount} remaining)
          </Button>

          <div className="flex items-center justify-between w-full h-9 px-3 py-2 rounded-md border border-input">
            <span className="text-sm font-medium">Max Concurrent Translations</span>
            <div className="flex items-center gap-[0.5]">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.max(1, concurrentOperation - 1))}
                disabled={concurrentOperation <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                max={MAX_CONCURRENT_OPERATION}
                value={concurrentOperation}
                onChange={(e) => setConcurrentOperation(currentProject?.id ?? "", Math.max(1, Math.min(MAX_CONCURRENT_OPERATION, parseInt(e.target.value) || 1)))}
                className="w-10 h-7 text-center border-0 bg-transparent shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.min(MAX_CONCURRENT_OPERATION, concurrentOperation + 1))}
                disabled={concurrentOperation >= MAX_CONCURRENT_OPERATION}
              >
                +
              </Button>
            </div>
          </div>

          {/* Download All Subtitles */}
          <DownloadSection
            generateContent={handleGenerateZip}
            fileName={`${currentProject?.name || "subtitles"}.zip`}
            type="zip"
            downloadOption={downloadOption}
            setDownloadOption={setDownloadOption}
            combinedFormat={combinedFormat}
            setCombinedFormat={setCombinedFormat}
            toType={toType}
            setToType={setToType}
            noChangeOption
          />
        </div>

        {/* Right Column - Settings */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <div className="flex items-center justify-between w-full p-4 mt-4 rounded-xl border border-input bg-card shadow-sm">
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

            <TabsContent value="basic" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className={cn("p-4 space-y-4", !isUseSharedSettings && "pointer-events-none opacity-50")}>
                  <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                  <LanguageSelection
                    basicSettingsId={basicSettingsId}
                  />
                  <ModelSelection
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                  />
                  <ContextDocumentInput
                    basicSettingsId={basicSettingsId}
                  />
                  <div className="m-[2px]">
                    <CustomInstructionsInput
                      basicSettingsId={basicSettingsId}
                    />
                  </div>
                  <div className="m-[2px]">
                    <FewShotInput
                      basicSettingsId={basicSettingsId}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className={cn("p-4 space-y-4", !isUseSharedSettings && "pointer-events-none opacity-50")}>
                  <ModelDetail
                    basicSettingsId={basicSettingsId}
                  />
                  <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                  <TemperatureSlider
                    advancedSettingsId={advancedSettingsId}
                  />
                  <div className="border border-muted-foreground/20 rounded-md p-4 space-y-4">
                    <AdvancedReasoningSwitch />
                  </div>
                  <p className="text-sm font-semibold">Technical Options</p>
                  <SplitSizeInput
                    advancedSettingsId={advancedSettingsId}
                  />
                  <MaxCompletionTokenInput
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                  />
                  <StructuredOutputSwitch
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                  />
                  <FullContextMemorySwitch
                    advancedSettingsId={advancedSettingsId}
                  />
                  <BetterContextCachingSwitch
                    advancedSettingsId={advancedSettingsId}
                  />
                  <AdvancedSettingsResetButton
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Batch Dialog */}
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

      {/* Delete Single File Dialog */}
      <AlertDialog open={!!deleteFileId} onOpenChange={(open) => !open && setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this file from the batch? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFileId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Subtitles Dialog */}
      <AlertDialog open={isDeleteSelectedDialogOpen} onOpenChange={(open) => !open && setIsDeleteSelectedDialogOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Subtitles</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete ${selectedIds.size} selected subtitle${selectedIds.size === 1 ? "" : "s"}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteSelectedDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleDeleteSelected(); setIsDeleteSelectedDialogOpen(false) }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restart Translation Confirmation Dialog */}
      <AlertDialog open={isRestartDialogOpen} onOpenChange={setIsRestartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Already Translated Content
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 space-y-2">
              <span className="block">
                You have already translated <strong>{translatedStats.translated}</strong> of <strong>{translatedStats.total}</strong> subtitles in this batch.
              </span>
              <span className="block">
                Are you sure you want to translate from the beginning?
              </span>
              <span className="block">
                Use the <strong>Continue</strong> button instead to translate only the remaining content.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartBatchTranslation}>Restart Translation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Translation Confirmation Dialog */}
      <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Start Batch Translation
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 space-y-2">
              <span className="block">
                Are you sure you want to start translating <strong>{batchFiles.length}</strong> files with <strong>{translatedStats.total}</strong> subtitles?
              </span>
              {isUseSharedSettings ? (
                <span className="block">
                  This will process up to <strong>{concurrentOperation}</strong> files simultaneously from <strong>{sourceLanguage}</strong> to <strong>{targetLanguage}</strong> using <strong>{isUseCustomModel ? "Custom Model" : modelDetail?.name}</strong>.
                </span>
              ) : (
                <span className="block">
                  Each file will be processed with its own settings, which may differ in model or languages.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartBatchTranslation}>Start Translation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Continue Translation Confirmation Dialog */}
      <AlertDialog open={isContinueDialogOpen} onOpenChange={setIsContinueDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FastForward className="h-5 w-5 text-primary" />
              Continue Batch Translation
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 space-y-2">
              <span className="block">
                Are you sure you want to continue translating <strong>{batchFiles.length - finishedCount}</strong> remaining files?
              </span>
              <span className="block">
                Only untranslated portions of each file will be processed.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueBatchTranslation}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Translation Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={(open) => {
        if (!open) {
          setPreviewId(null)
          if (previewId) {
            saveTranslationData(previewId)
          }
        }
      }}>
        <DialogContent className="max-w-6xl w-full">
          <DialogHeader>
            <DialogTitle>Translation Preview</DialogTitle>
          </DialogHeader>
          {previewId && (
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
