"use client"

import { useState, useRef, useEffect } from "react"
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
  SquarePen,
  FolderInput,
  SquareCheckBig,
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
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
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
import { RenameEpisodesDialog } from "./rename-episodes-dialog"
import { ImportSubDialog } from "./import-sub-dialog"
import { PopulateContextDialog } from "./populate-context-dialog"
import { CopySharedSettingsDialog } from "./copy-shared-settings-dialog"
import { DownloadSection } from "@/components/download-section"
import JSZip from "jszip"
import Link from "next/link"
import { SUBTITLE_NAME_MAP, ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import SubtitleTranslatorMain from "../translate/subtitle-translator-main"
import { useBatchTranslationFiles } from "@/hooks/use-batch-translation-files"
import { useBatchExtractionFiles } from "@/hooks/use-batch-extraction-files"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import useBatchTranslationHandler from "@/hooks/use-batch-translation-handler"
import useBatchExtractionHandler from "@/hooks/use-batch-extraction-handler"
import { ContextExtractorMain } from "../extract-context/context-extractor-main"

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
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isImportSubDialogOpen, setIsImportSubDialogOpen] = useState(false)
  const [isImportSubLoading, setIsImportSubLoading] = useState(false)
  const [isPopulateDialogOpen, setIsPopulateDialogOpen] = useState(false)
  const [isCopySharedDialogOpen, setIsCopySharedDialogOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const renameProject = useProjectStore((state) => state.renameProject)
  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)

  const createTranslationForBatch = useProjectStore((state) => state.createTranslationForBatch)
  const removeTranslationFromBatch = useProjectStore((state) => state.removeTranslationFromBatch)
  const createExtractionForBatch = useProjectStore((state) => state.createExtractionForBatch)
  const removeExtractionFromBatch = useProjectStore((state) => state.removeExtractionFromBatch)

  // Batch Settings Store
  const isUseSharedSettings = useBatchSettingsStore(state => !state.individualIds.has(currentProject?.id ?? ""))
  const setUseSharedSettings = useBatchSettingsStore(state => state.setUseSharedSettings)
  const concurrentOperation = useBatchSettingsStore(state => state.concurrentMap[currentProject?.id ?? ""] ?? 3)
  const setConcurrentOperation = useBatchSettingsStore(state => state.setConcurrentTranslations)
  const extractionMode = useBatchSettingsStore(state => state.extractionModeMap[currentProject?.id ?? ""] ?? "sequential")
  const setExtractionMode = useBatchSettingsStore(state => state.setExtractionMode)

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
  const setCurrentExtractionId = useExtractionDataStore((state) => state.setCurrentId)
  const saveExtractionData = useExtractionDataStore((state) => state.saveData)
  const setContextResult = useExtractionDataStore((state) => state.setContextResult)

  // Batch Settings Stores
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
  } = useBatchTranslationFiles(
    operationMode === 'translation' ? order : currentProject?.translations ?? [],
    queueSet
  )

  const {
    batchFiles: extractionBatchFiles,
    finishedCount: extractionFinishedCount,
    isBatchExtracting,
  } = useBatchExtractionFiles(
    operationMode === 'extraction' ? order : currentProject?.extractions ?? [],
    queueSet
  )

  const batchFiles = operationMode === 'translation' ? translationBatchFiles : extractionBatchFiles
  const finishedCount = operationMode === 'translation' ? translationFinishedCount : extractionFinishedCount
  const isProcessing = operationMode === 'translation' ? isBatchTranslating : isBatchExtracting
  const isSequentialExtraction = operationMode === 'extraction' && extractionMode === 'sequential'

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
    handleContinueBatchExtraction,
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

  // --------------------- Operation handlers ---------------------

  const handleStart = () => {
    setIsStartDialogOpen(false)
    if (operationMode === 'translation') {
      handleStartBatchTranslation()
    } else {
      handleStartBatchExtraction()
    }
  }

  const handleContinue = () => {
    setIsContinueDialogOpen(false)
    if (operationMode === 'translation') {
      handleContinueBatchTranslation()
    } else {
      handleContinueBatchExtraction()
    }
  }

  const handleStop = () => {
    if (operationMode === 'translation') {
      handleStopBatchTranslation()
    } else {
      handleStopBatchExtraction()
    }
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

          // Build a File object for API shape, keep original extension
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

    if (operationMode === 'translation') {
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
    } else {
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
  }

  const handleOpenContinueBatchDialog = () => {
    if (batchFiles.length === 0 || isProcessing) return

    setTranslatedStats({
      translated: batchFiles.reduce((acc, file) => acc + file.translatedCount, 0),
      total: batchFiles.reduce((acc, file) => acc + file.subtitlesCount, 0)
    })

    setIsContinueDialogOpen(true)
  }

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
        if (operationMode === 'translation') {
          await removeTranslationFromBatch(currentProject.id, id)
        } else {
          await removeExtractionFromBatch(currentProject.id, id)
        }
      } catch {
        toast.error('Failed to delete file')
      }
    }
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  const handleToggleMarkSelected = async () => {
    if (operationMode !== 'extraction') return
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    await Promise.all(ids.map(async (id) => {
      const extraction = extractionData[id]
      if (!extraction) return
      const raw = extraction.contextResult || ''
      const hasDone = /\s*<done>\s*$/.test(raw)
      const next = hasDone ? raw.replace(/\s*<done>\s*$/, '') : (raw ? `${raw}\n\n<done>` : '<done>')
      setContextResult(id, next)
      await saveExtractionData(id)
    }))
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
    const ids = operationMode === 'translation' ? currentProject.translations : currentProject.extractions
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(order, oldIndex, newIndex)
    setOrder(newOrder)
    updateProjectItems(currentProject.id, newOrder, operationMode === 'translation' ? 'translations' : 'extractions')
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
        if (operationMode === 'translation') {
          const translationId = await createTranslationForBatch(currentProject.id, file, content)
          await loadTranslation(translationId)
        } else {
          const extractionId = await createExtractionForBatch(currentProject.id, file, content)
          await loadExtraction(extractionId)
        }
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

  const handleSingleFileDownload = (batchFileId: string) => {
    let content: string | null = null
    let fileName: string | null = null

    if (operationMode === 'translation') {
      const translation = translationData[batchFileId]
      if (!translation) return
      content = generateSubtitleContent(batchFileId, downloadOption, combinedFormat)
      if (!content) return
      const ext = translation.parsed?.type || "srt"
      const hasExt = translation.title.toLowerCase().endsWith(`.${ext}`)
      fileName = hasExt ? translation.title : `${translation.title}.${ext}`

    } else {
      const extraction = extractionData[batchFileId]
      if (!extraction) return
      content = extraction.contextResult || ''
      content = content.replace(/<done>\s*$/, '')
      if (!content.trim()) return
      const baseTitle = extraction.title || 'extraction'
      const dotIdx = baseTitle.lastIndexOf('.')
      const baseName = dotIdx > 0 ? baseTitle.slice(0, dotIdx) : baseTitle
      fileName = `${baseName}.txt`
    }

    if (!content || !fileName) return

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

  const handleGenerateZip = async (
    option: DownloadOption,
    format: CombinedFormat,
  ): Promise<Blob> => {
    const zip = new JSZip()

    const nameCountMap = new Map<string, number>()

    if (operationMode === 'translation') {
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

        zip.file(uniqueFileName, content)
      }
    } else {
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
    }

    return await zip.generateAsync({ type: "blob" })
  }

  const handlePreview = async (id: string) => {
    if (operationMode === 'translation') {
      setCurrentTranslationId(id)
      setPreviewId(id)
    } else {
      setCurrentExtractionId(id)
      setPreviewId(id)
    }
  }

  const handlePreviewDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewId(null)
      if (!previewId) return
      if (operationMode === 'translation') {
        saveTranslationData(previewId)
      } else {
        saveExtractionData(previewId)
      }
    }
  }

  const confirmDeleteFile = async () => {
    if (!currentProject || !deleteFileId) return
    try {
      if (operationMode === 'translation') {
        await removeTranslationFromBatch(currentProject.id, deleteFileId)
      } else {
        await removeExtractionFromBatch(currentProject.id, deleteFileId)
      }
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
            defaultValue={currentProject?.name || (operationMode === 'translation' ? "Batch Translation" : "Batch Extraction")}
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
                  Delete
                </Button>
                {operationMode === 'extraction' && (
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
                )}
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
            {!isSelecting && operationMode === 'extraction' && (
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
            {!isSelecting && operationMode === 'extraction' && (
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
            {!isSelecting && operationMode === 'translation' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={() => setIsPopulateDialogOpen(true)}
                disabled={isProcessing || translationBatchFiles.length === 0}
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
                onClick={handleClickFileUpload}
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
                  {operationMode === 'translation' ? 'Translating...' : 'Extracting...'}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {session ? `${operationMode === 'translation' ? 'Translate' : 'Extract'} ${batchFiles.length} files` : "Sign In to Start"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1"
              onClick={handleStop}
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
            disabled={isProcessing || !session || batchFiles.length === 0 || (batchFiles.length - finishedCount <= 0)}
          >
            <FastForward className="h-4 w-4" />
            {operationMode === 'translation' ? 'Continue Batch Translation' : 'Continue Batch Extraction'} ({batchFiles.length - finishedCount} remaining)
          </Button>

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
            showSelectors={operationMode === 'translation'}
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
                  <span className="text-sm font-semibold">Max Concurrent {operationMode === 'translation' ? 'Translations' : 'Extractions'}</span>
                  <span className="text-xs text-muted-foreground">
                    Files processed simultaneously
                    {isSequentialExtraction
                      ? ' (forced to 1)'
                      : ` (max ${MAX_CONCURRENT_OPERATION})`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                    onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.max(1, concurrentOperation - 1))}
                    disabled={isSequentialExtraction || concurrentOperation <= 1}
                    title="Decrease"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={MAX_CONCURRENT_OPERATION}
                    value={isSequentialExtraction ? 1 : concurrentOperation}
                    onChange={(e) => setConcurrentOperation(
                      currentProject?.id ?? "",
                      Math.max(1, Math.min(MAX_CONCURRENT_OPERATION, parseInt(e.target.value) || 1))
                    )}
                    disabled={isSequentialExtraction}
                    className="w-12 h-8 text-center border border-input rounded-md bg-background shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                    onClick={() => setConcurrentOperation(currentProject?.id ?? "", Math.min(MAX_CONCURRENT_OPERATION, concurrentOperation + 1))}
                    disabled={isSequentialExtraction || concurrentOperation >= MAX_CONCURRENT_OPERATION}
                    title="Increase"
                  >
                    +
                  </Button>
                </div>
              </div>

              {operationMode === 'extraction' && (
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
              )}

              {/* Copy Shared Settings trigger */}
              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg"
                  onClick={() => setIsCopySharedDialogOpen(true)}
                  disabled={
                    isProcessing || (operationMode === 'translation'
                      ? translationBatchFiles.length === 0
                      : extractionBatchFiles.length === 0)
                  }
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
                  {operationMode === 'translation' && (
                    <LanguageSelection
                      basicSettingsId={basicSettingsId}
                    />
                  )}
                  <ModelSelection
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                  />
                  {operationMode === 'translation' && (
                    <>
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
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className={cn("p-4 space-y-4", !isUseSharedSettings && "pointer-events-none opacity-50")}>
                  <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                  <ModelDetail
                    basicSettingsId={basicSettingsId}
                  />
                  {operationMode === 'translation' && (
                    <>
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
                    </>
                  )}
                  <MaxCompletionTokenInput
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                  />
                  {operationMode === 'translation' && (
                    <>
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
                    </>
                  )}
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

      {/* Rename Episodes (Extraction) Dialog */}
      <RenameEpisodesDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        batchFiles={batchFiles}
      />

      {/* Import Subtitle (from translations) Dialog */}
      <ImportSubDialog
        open={isImportSubDialogOpen}
        onOpenChange={(open) => { if (!isImportSubLoading) setIsImportSubDialogOpen(open) }}
        translationBatchFiles={translationBatchFiles}
        onConfirm={handleConfirmImportSub}
        isLoading={isImportSubLoading}
      />

      {/* Populate Translation Context Dialog */}
      <PopulateContextDialog
        open={isPopulateDialogOpen}
        onOpenChange={setIsPopulateDialogOpen}
        translationBatchFiles={translationBatchFiles}
        extractionBatchFiles={extractionBatchFiles}
      />

      {/* Copy Shared Settings Dialog */}
      <CopySharedSettingsDialog
        open={isCopySharedDialogOpen}
        onOpenChange={setIsCopySharedDialogOpen}
        operationMode={operationMode}
        translationBatchFiles={translationBatchFiles}
        extractionBatchFiles={extractionBatchFiles}
        sharedBasicSettingsId={basicSettingsId}
        sharedAdvancedSettingsId={advancedSettingsId}
      />

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
            <AlertDialogTitle>Delete Selected Files</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete ${selectedIds.size} selected file${selectedIds.size === 1 ? "" : "s"}? This action cannot be undone.`}
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
              {operationMode === 'translation' ? 'Already Translated Content' : 'Already Extracted Content'}
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 space-y-2">
              {operationMode === 'translation' ? (
                <>
                  <span className="block">
                    You have already translated <strong>{translatedStats.translated}</strong> of <strong>{translatedStats.total}</strong> subtitles in this batch.
                  </span>
                  <span className="block">Are you sure you want to translate from the beginning?</span>
                  <span className="block">Use the <strong>Continue</strong> button instead to translate only the remaining content.</span>
                  {isUseSharedSettings ? (
                    <>
                      <span className="block font-semibold">Shared Settings:</span>
                      <span className="list-item ml-4">This will process up to <strong>{concurrentOperation}</strong> files simultaneously from <strong>{sourceLanguage}</strong> to <strong>{targetLanguage}</strong> using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong>.</span>
                      <span className="list-item ml-4">A shared context document (if set) will be applied to all files.</span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold">Individual Settings:</span>
                      <span className="list-item ml-4">Each file will be processed with its own settings, which may differ in model or languages.</span>
                      <span className="list-item ml-4">Each file will use its own context document (if set).</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="block">
                    You have already processed <strong>{translatedStats.translated}</strong> of <strong>{translatedStats.total}</strong> files in this batch.
                  </span>
                  <span className="block">Are you sure you want to start extraction from the beginning?</span>
                  <span className="block">Use the <strong>Continue</strong> button instead to process only the remaining files.</span>
                  {isUseSharedSettings ? (
                    <>
                      <span className="block font-semibold">Shared Settings:</span>
                      <span className="list-item ml-4">{
                        isSequentialExtraction
                          ? <>This will process files <strong>one-by-one</strong> using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong> in <strong>{extractionMode}</strong> mode.</>
                          : <>This will process up to <strong>{concurrentOperation}</strong> files simultaneously using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong> in <strong>{extractionMode}</strong> mode.</>}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold">Individual Settings:</span>
                      <span className="list-item ml-4">Each file will be processed with its own settings, which may differ in model or parameters.</span>
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStart}>{operationMode === 'translation' ? 'Restart Translation' : 'Restart Extraction'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Translation Confirmation Dialog */}
      <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              {operationMode === 'translation' ? 'Start Batch Translation' : 'Start Batch Extraction'}
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 space-y-2">
              {operationMode === 'translation' ? (
                <>
                  <span className="block">Are you sure you want to start translating <strong>{batchFiles.length}</strong> files with <strong>{translatedStats.total}</strong> subtitles?</span>
                  {isUseSharedSettings ? (
                    <>
                      <span className="block font-semibold">Shared Settings:</span>
                      <span className="list-item ml-4">This will process up to <strong>{concurrentOperation}</strong> files simultaneously from <strong>{sourceLanguage}</strong> to <strong>{targetLanguage}</strong> using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong>.</span>
                      <span className="list-item ml-4">A shared context document (if set) will be applied to all files.</span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold">Individual Settings:</span>
                      <span className="list-item ml-4">Each file will be processed with its own settings, which may differ in model or languages.</span>
                      <span className="list-item ml-4">Each file will use its own context document (if set).</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="block">Are you sure you want to start extracting <strong>{batchFiles.length}</strong> files?</span>
                  {isUseSharedSettings ? (
                    <>
                      <span className="block font-semibold">Shared Settings:</span>
                      <span className="list-item ml-4">{
                        isSequentialExtraction
                          ? <>This will process files <strong>one-by-one</strong> using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong> in <strong>{extractionMode}</strong> mode.</>
                          : <>This will process up to <strong>{concurrentOperation}</strong> files simultaneously using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong> in <strong>{extractionMode}</strong> mode.</>}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold">Individual Settings:</span>
                      <span className="list-item ml-4">Each file will be processed with its own settings, which may differ in model or parameters.</span>
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStart}>{operationMode === 'translation' ? 'Start Translation' : 'Start Extraction'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Continue Translation Confirmation Dialog */}
      <AlertDialog open={isContinueDialogOpen} onOpenChange={setIsContinueDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FastForward className="h-5 w-5 text-primary" />
              {operationMode === 'translation' ? 'Continue Batch Translation' : 'Continue Batch Extraction'}
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 space-y-2">
              {operationMode === 'translation' ? (
                <>
                  <span className="block">Are you sure you want to continue translating <strong>{batchFiles.length - finishedCount}</strong> remaining files?</span>
                  <span className="block">Only untranslated portions of each file will be processed.</span>
                  {isUseSharedSettings ? (
                    <>
                      <span className="block font-semibold">Shared Settings:</span>
                      <span className="list-item ml-4">This will process up to <strong>{concurrentOperation}</strong> files simultaneously from <strong>{sourceLanguage}</strong> to <strong>{targetLanguage}</strong> using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong>.</span>
                      <span className="list-item ml-4">A shared context document (if set) will be applied to all files.</span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold">Individual Settings:</span>
                      <span className="list-item ml-4">Each file will be processed with its own settings, which may differ in model or languages.</span>
                      <span className="list-item ml-4">Each file will use its own context document (if set).</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="block">Are you sure you want to continue extracting <strong>{batchFiles.length - finishedCount}</strong> remaining files?</span>
                  <span className="block">Only files that are not yet done will be processed.</span>
                  {isUseSharedSettings ? (
                    <>
                      <span className="block font-semibold">Shared Settings:</span>
                      <span className="list-item ml-4">{
                        isSequentialExtraction
                          ? <>This will process files <strong>one-by-one</strong> using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong> in <strong>{extractionMode}</strong> mode.</>
                          : <>This will process up to <strong>{concurrentOperation}</strong> files simultaneously using <strong>{isUseCustomModel ? 'Custom Model' : modelDetail?.name}</strong> in <strong>{extractionMode}</strong> mode.</>}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold">Individual Settings:</span>
                      <span className="list-item ml-4">Each file will be processed with its own settings, which may differ in model or parameters.</span>
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={handlePreviewDialogOpenChange}>
        <DialogContent className="max-w-6xl w-full">
          <DialogHeader>
            <DialogTitle>
              {operationMode === 'translation'
                ? 'Translation Preview'
                : 'Extraction Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewId && (
            <div className="max-h-[80vh] overflow-y-auto">
              {operationMode === 'translation' ? (
                <SubtitleTranslatorMain
                  currentId={previewId}
                  translation={translationData[previewId]}
                  basicSettingsId={isUseSharedSettings ? basicSettingsId : translationData[previewId].basicSettingsId}
                  advancedSettingsId={isUseSharedSettings ? advancedSettingsId : translationData[previewId].advancedSettingsId}
                  isSharedSettings={isUseSharedSettings}
                />
              ) : (
                <ContextExtractorMain
                  currentId={previewId}
                  basicSettingsId={isUseSharedSettings ? basicSettingsId : extractionData[previewId].basicSettingsId}
                  advancedSettingsId={isUseSharedSettings ? advancedSettingsId : extractionData[previewId].advancedSettingsId}
                  isSharedSettings={isUseSharedSettings}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
