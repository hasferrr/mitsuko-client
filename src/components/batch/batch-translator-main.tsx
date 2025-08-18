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
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
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
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SortableBatchFile } from "./sortable-batch-file"
import { minMax, sleep } from "@/lib/utils"
import { SubOnlyTranslated, SubtitleTranslated, SubtitleNoTime } from "@/types/subtitles"
import { Translation } from "@/types/project"
import { mergeIntervalsWithGap } from "@/lib/subtitles/utils/merge-intervals-w-gap"
import { countUntranslatedLines } from "@/lib/subtitles/utils/count-untranslated"
import { DownloadSection } from "@/components/download-section"
import JSZip from "jszip"
import { logSubtitle } from "@/lib/api/subtitle-log"
import { UserCreditData } from "@/types/user"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { SUBTITLE_NAME_MAP, ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import SubtitleTranslatorMain from "../translate/subtitle-translator-main"
import { convertSubtitle } from "@/lib/subtitles/utils/convert-subtitle"

interface BatchFile {
  id: string
  status: "pending" | "partial" | "translating" | "queued" | "done" | "error"
  progress: number
  title: string
  subtitlesCount: number
  translatedCount: number
  type: string
}

const MAX_CONCURRENT_TRANSLATION = 5

interface BatchTranslatorMainProps {
  basicSettingsId: string
  advancedSettingsId: string
}

export default function BatchTranslatorMain({ basicSettingsId, advancedSettingsId }: BatchTranslatorMainProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("translated")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")
  const [toType, setToType] = useState<SubtitleType | "no-change">("no-change")

  // Selection state
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [previewTranslationId, setPreviewTranslationId] = useState<string | null>(null)
  const [queueSet, setQueueSet] = useState<Set<string>>(new Set())

  // Confirmation dialog for starting translation
  const [isRestartTranslationDialogOpen, setIsRestartTranslationDialogOpen] = useState(false)
  const [isStartTranslationDialogOpen, setIsStartTranslationDialogOpen] = useState(false)
  const [isContinueTranslationDialogOpen, setIsContinueTranslationDialogOpen] = useState(false)
  const [translatedStats, setTranslatedStats] = useState({ translated: 0, total: 0 })

  const queueAbortRef = useRef(false)
  const errorCountRef = useRef(0)
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
  const concurrentTranslations = useBatchSettingsStore(state => state.concurrentMap[currentProject?.id ?? ""] ?? 3)
  const setConcurrentTranslations = useBatchSettingsStore(state => state.setConcurrentTranslations)

  const [order, setOrder] = useState<string[]>(currentProject?.translations ?? [])

  useEffect(() => {
    if (currentProject?.translations) {
      setOrder(currentProject.translations)
    }
  }, [currentProject?.translations])

  // Translation Data Store
  const translationData = useTranslationDataStore((state) => state.data)
  const loadTranslation = useTranslationDataStore((state) => state.getTranslationDb)
  const setCurrentTranslationId = useTranslationDataStore((state) => state.setCurrentId)
  const setSubtitles = useTranslationDataStore((state) => state.setSubtitles)
  const setResponse = useTranslationDataStore((state) => state.setResponse)
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)
  const appendJsonResponse = useTranslationDataStore((state) => state.appendJsonResponse)
  const saveData = useTranslationDataStore((state) => state.saveData)

  // Translation Store
  const translateSubtitles = useTranslationStore((state) => state.translateSubtitles)
  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)
  const stopTranslation = useTranslationStore((state) => state.stopTranslation)

  // Settings Stores
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(basicSettingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(basicSettingsId))
  const modelDetail = useSettingsStore((state) => state.getModelDetail(basicSettingsId))
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(basicSettingsId))

  const customApiConfigs = useLocalSettingsStore((state) => state.customApiConfigs)
  const selectedApiConfigIndex = useLocalSettingsStore((state) => state.selectedApiConfigIndex)

  const selectedConfig =
    selectedApiConfigIndex !== null ? customApiConfigs[selectedApiConfigIndex] : null
  const apiKey = selectedConfig?.apiKey ?? ""
  const customBaseUrl = selectedConfig?.customBaseUrl ?? ""
  const customModel = selectedConfig?.customModel ?? ""

  // Session Store
  const session = useSessionStore((state) => state.session)

  // Other Hooks
  const { setHasChanges } = useUnsavedChanges()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Lazy user data query
  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })

  // Get batch files from translationData
  const batchFiles: BatchFile[] = useMemo(() => {
    if (!currentProject?.isBatch) return []
    return order.map(id => {
      const translation = translationData[id]

      const totalSubtitles = translation?.subtitles?.length || 0
      const translatedCount = translation?.subtitles?.filter(s => s.translated && s.translated.trim() !== "").length || 0
      const progress = totalSubtitles ? (translatedCount / totalSubtitles) * 100 : 0

      let status: BatchFile["status"]

      if (isTranslatingSet.has(id)) {
        status = "translating"
      } else if (queueSet.has(id)) {
        status = "queued"
      } else if (translatedCount === 0) {
        status = "pending"
      } else if (translatedCount < totalSubtitles) {
        status = "partial"
      } else {
        status = "done"
      }

      return {
        id,
        title: translation?.title || "Loading...",
        subtitlesCount: totalSubtitles,
        translatedCount,
        status,
        progress,
        type: translation?.parsed?.type || "srt",
      }
    })
  }, [currentProject?.isBatch, order, translationData, isTranslatingSet, queueSet])

  const finishedCount = useMemo(() => {
    return batchFiles.filter(file => file.status === "done").length
  }, [batchFiles])

  const isBatchTranslating = useMemo(() => {
    return batchFiles.some(file => file.status === "translating" || file.status === "queued")
  }, [batchFiles])

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

  const handleInitiateBatchTranslation = () => {
    if (batchFiles.length === 0 || isBatchTranslating) return

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
      setIsRestartTranslationDialogOpen(true)
    } else {
      setTranslatedStats({
        translated: 0,
        total: totalSubtitles
      })
      setIsStartTranslationDialogOpen(true)
    }
  }

  const handleStartBatchTranslation = () => {
    if (batchFiles.length === 0 || isBatchTranslating) return

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    setIsRestartTranslationDialogOpen(false)
    queueAbortRef.current = false
    errorCountRef.current = 0
    setHasChanges(true)

    const ids = batchFiles
      .map(f => f.id)
      .filter(id => !isTranslatingSet.has(id))

    if (ids.length === 0) {
      return
    }

    setQueueSet(new Set(ids.slice(concurrentTranslations)))

    let index = 0
    let active = 0

    const launch = () => {
      if (queueAbortRef.current) {
        if (active === 0) {
          setQueueSet(new Set())
        }
        return
      }
      if (index >= ids.length) {
        if (active === 0) {
          setQueueSet(new Set())
        }
        return
      }
      const id = ids[index++]

      if (isTranslatingSet.has(id)) {
        launch()
        return
      }

      setQueueSet(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      active++
      handleStartTranslation(id, undefined, undefined, true).finally(() => {
        setIsTranslating(id, false)
        active--
        launch()
      })
    }

    for (let i = 0; i < concurrentTranslations && i < ids.length; i++) {
      launch()
    }
  }

  const handleContinueBatchTranslation = () => {
    if (batchFiles.length === 0 || isBatchTranslating) return

    setTranslatedStats({
      translated: batchFiles.reduce((acc, file) => acc + file.translatedCount, 0),
      total: batchFiles.reduce((acc, file) => acc + file.subtitlesCount, 0)
    })

    setIsContinueTranslationDialogOpen(true)
  }

  const handleStartContinueBatchTranslation = () => {
    setIsContinueTranslationDialogOpen(false)

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    queueAbortRef.current = false
    errorCountRef.current = 0
    setHasChanges(true)

    const ids = batchFiles
      .map(f => f.id)
      .filter(id => !isTranslatingSet.has(id))

    if (ids.length === 0) {
      return
    }

    setQueueSet(new Set(ids.slice(concurrentTranslations)))

    let index = 0
    let active = 0

    const launch = () => {
      if (queueAbortRef.current) {
        if (active === 0) {
          setQueueSet(new Set())
        }
        return
      }
      if (index >= ids.length) {
        if (active === 0) {
          setQueueSet(new Set())
        }
        return
      }
      const id = ids[index++]

      if (isTranslatingSet.has(id)) {
        launch()
        return
      }

      setQueueSet(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      active++
      handleContinueTranslation(id).finally(() => {
        setIsTranslating(id, false)
        active--
        launch()
      })
    }

    for (let i = 0; i < concurrentTranslations && i < ids.length; i++) {
      launch()
    }
  }

  const handleStopBatchTranslation = () => {
    queueAbortRef.current = true
    setQueueSet(new Set())
    const handleStopTranslation = (currentId: string) => {
      stopTranslation(currentId)
      setIsTranslating(currentId, false)
      saveData(currentId)
    }
    batchFiles.forEach(f => handleStopTranslation(f.id))
  }

  const handleStartTranslation = async (
    currentId: string,
    overrideStartIndexParam?: number,
    overrideEndIndexParam?: number,
    partOfBatch?: boolean
  ) => {
    const subtitles = translationData[currentId]?.subtitles ?? []
    const title = translationData[currentId]?.title ?? ""
    const parsed = translationData[currentId]?.parsed

    // Determine settings IDs based on toggle
    const bsIdToUse = isUseSharedSettings ? basicSettingsId : (translationData[currentId]?.basicSettingsId || basicSettingsId)
    const adsIdToUse = isUseSharedSettings ? advancedSettingsId : (translationData[currentId]?.advancedSettingsId || advancedSettingsId)

    // Pull current settings values
    const settingsStoreState = useSettingsStore.getState()
    const advStoreState = useAdvancedSettingsStore.getState()

    const sourceLanguage = settingsStoreState.getSourceLanguage(bsIdToUse)
    const targetLanguage = settingsStoreState.getTargetLanguage(bsIdToUse)
    const modelDetail = settingsStoreState.getModelDetail(bsIdToUse)
    const isUseCustomModel = settingsStoreState.getIsUseCustomModel(bsIdToUse)
    const contextDocument = settingsStoreState.getContextDocument(bsIdToUse)
    const customInstructions = settingsStoreState.getCustomInstructions(bsIdToUse)
    const fewShot = settingsStoreState.getFewShot(bsIdToUse)

    const temperature = advStoreState.getTemperature(adsIdToUse)
    const maxCompletionTokens = advStoreState.getMaxCompletionTokens(adsIdToUse)
    const isMaxCompletionTokensAuto = advStoreState.getIsMaxCompletionTokensAuto(adsIdToUse)
    const splitSize = advStoreState.getSplitSize(adsIdToUse)
    const isUseStructuredOutput = advStoreState.getIsUseStructuredOutput(adsIdToUse)
    const isUseFullContextMemory = advStoreState.getIsUseFullContextMemory(adsIdToUse)
    const isBetterContextCaching = advStoreState.getIsBetterContextCaching(adsIdToUse)

    const firstChunk = (size: number, s: number, e: number) => {
      const subtitleChunks: SubtitleNoTime[][] = []
      subtitleChunks.push(subtitles.slice(s, Math.min(s + size, e + 1)).map((s) => ({
        index: s.index,
        actor: s.actor,
        content: s.content,
      })))
      return subtitleChunks
    }

    // TODO: Refactor to separate function
    // --- COPY PASTE FROM SUBTITLE TRANSLATOR MAIN ---

    if (!subtitles.length) return
    setIsTranslating(currentId, true)
    setHasChanges(true)

    if (!partOfBatch) {
      // setActiveTab("result")
      setJsonResponse(currentId, [])
      // setTimeout(() => {
      //   window.scrollTo({
      //     top: 0,
      //     behavior: "smooth",
      //   })
      // }, 300)
    }

    await saveData(currentId)

    // Validate few shot
    const fewShotSchema = z.object({
      content: z.string(),
      translated: z.string()
    })

    // Few shot examples
    let usedFewShot: z.infer<typeof fewShotSchema>[] = []

    if (fewShot.isEnabled) {
      if (fewShot.type === "manual") {
        try {
          usedFewShot = fewShotSchema.array().parse(JSON.parse(fewShot.value.trim() || "[]"))
        } catch {
          toast.error(
            <div className="select-none">
              <div>Few shot format is invalid! Please follow this format:</div>
              <div className="font-mono">
                <pre>{"[" + JSON.stringify({ content: "string", translated: "string" }, null, 2) + "]"}</pre>
              </div>
            </div>
          )
          setActiveTab("basic")
          setIsTranslating(currentId, false)
          return
        }
      } else if (fewShot.type === "linked") {
        const linkedTranslation = await useTranslationDataStore.getState().getTranslationDb(fewShot.linkedId)
        if (linkedTranslation) {
          usedFewShot = linkedTranslation.subtitles
            .slice(fewShot.fewShotStartIndex, (fewShot.fewShotEndIndex ?? 0) + 1)
            .map((s) => ({ content: s.content, translated: s.translated }))
        }
      }
      usedFewShot = usedFewShot?.filter((s) => s.content && s.translated)
    }
    console.log("usedFewShot: ", usedFewShot)

    // Accumulate raw responses
    const allRawResponses: string[] = []

    // Split subtitles into chunks, starting from startIndex - 1
    const storeStartIndex = useAdvancedSettingsStore.getState().getStartIndex(advancedSettingsId)
    const storeEndIndex = useAdvancedSettingsStore.getState().getEndIndex(advancedSettingsId)

    const sIndexToUse = overrideStartIndexParam !== undefined
      ? overrideStartIndexParam
      : storeStartIndex

    const eIndexToUse = overrideEndIndexParam !== undefined
      ? overrideEndIndexParam
      : storeEndIndex

    const size = minMax(splitSize, SPLIT_SIZE_MIN, SPLIT_SIZE_MAX)
    // adjustedStartIndex and adjustedEndIndex are 0-based for slicing
    // Ensure subtitles.length - 1 is not negative if subtitles.length is 0 (already handled by early return)
    const adjustedStartIndex = minMax(sIndexToUse - 1, 0, subtitles.length - 1)
    const adjustedEndIndex = minMax(eIndexToUse - 1, adjustedStartIndex, subtitles.length - 1)

    const subtitleChunks = firstChunk(size, adjustedStartIndex, adjustedEndIndex)

    // Set Limited Context Memory size
    const limitedContextMemorySize = 5

    // Prepare context for the first chunk
    let context: ContextCompletion[] = []

    // Split by number of split size
    if (sIndexToUse > 1) {
      // Calculate the proper context range based on context strategy
      let contextStartIndex: number

      if (isUseFullContextMemory) {
        // Use all subtitles from beginning
        contextStartIndex = 0
      } else if (isBetterContextCaching) {
        // Use split size for context
        contextStartIndex = Math.max(0, adjustedStartIndex - size)
      } else {
        // Use limited context memory size (5)
        contextStartIndex = Math.max(0, adjustedStartIndex - limitedContextMemorySize)
      }

      context.push({
        role: "user",
        content: createContextMemory(subtitles
          .slice(
            contextStartIndex,
            adjustedStartIndex,
          )
          .map((chunk) => ({
            index: chunk.index,
            actor: chunk.actor,
            content: chunk.content,
          }))
        ),
      })
      context.push({
        role: "assistant",
        content: createContextMemory(subtitles
          .slice(
            contextStartIndex,
            adjustedStartIndex,
          )
          .map((chunk) => ({
            index: chunk.index,
            content: chunk.content,
            translated: chunk.translated,
          }))
        ),
      })
    }

    // Log subtitles
    logSubtitle(title, generateSubtitleContentForTranslation(translationData[currentId], "original", "o-n-t", parsed.type), currentId, true)

    // Translate each chunk of subtitles
    let batch = 0
    while (subtitleChunks.length > 0) {
      const chunk = subtitleChunks.shift()!
      console.log(`Batch ${batch + 1}`)
      console.log(chunk)
      console.log(JSON.parse(JSON.stringify(context)))

      const requestBody = {
        title: title.slice(0, 150),
        subtitles: {
          subtitles: chunk.map((s) => ({
            index: s.index,
            actor: s.actor,
            content: s.content,
          }))
        },
        sourceLanguage,
        targetLanguage,
        contextDocument,
        customInstructions,
        baseURL: isUseCustomModel ? customBaseUrl : "http://localhost:6969",
        model: isUseCustomModel ? customModel : modelDetail?.name || "",
        temperature: minMax(temperature, TEMPERATURE_MIN, TEMPERATURE_MAX),
        maxCompletionTokens: isMaxCompletionTokensAuto ? undefined : minMax(
          maxCompletionTokens,
          MAX_COMPLETION_TOKENS_MIN,
          MAX_COMPLETION_TOKENS_MAX
        ),
        structuredOutput: isUseStructuredOutput,
        contextMessage: context,
        fewShotExamples: usedFewShot,
        uuid: currentId,
        isBatch: true,
      }

      let tlChunk: SubOnlyTranslated[] = []
      let rawResponse = ""

      try {
        const result = await translateSubtitles(
          requestBody,
          isUseCustomModel ? apiKey : "",
          (isUseCustomModel || modelDetail === null)
            ? "custom"
            : (modelDetail.isPaid ? "paid" : "free"),
          currentId,
          (response) => setResponse(currentId, response)
        )
        tlChunk = result.parsed
        rawResponse = result.raw
        errorCountRef.current = Math.max(0, errorCountRef.current - 1)

      } catch {
        if (partOfBatch) {
          errorCountRef.current += 1
          if (errorCountRef.current >= 5) {
            handleStopBatchTranslation()
            toast.error('Encountered 5 errors. Stopping batch translation')
          }
        }

        setIsTranslating(currentId, false)

        rawResponse = useTranslationDataStore.getState().data[currentId].response.response.trim()
        const rawResponseArr = rawResponse.split("\n")
        if (rawResponseArr[rawResponseArr.length - 1].startsWith("[")) {
          rawResponseArr.pop()
        }
        rawResponse = rawResponseArr.join("\n")

        // TODO: Refactor to separate function
        try {
          tlChunk = parseTranslationJson(rawResponse)
        } catch (error) {
          console.error("Error: ", error)
          console.log("Failed to parse: ", rawResponse)
          setResponse(currentId, rawResponse + "\n\n[Failed to parse]")
          // If part of a batch, don't set isTranslating to false here, let the batch handler do it.
          // The error is logged, and the loop in handleContinueTranslation should ideally break.
          if (!partOfBatch) {
            setIsTranslating(currentId, false)
          }
          break
        }

      } finally {
        console.log("result: ", tlChunk)
        allRawResponses.push(useTranslationDataStore.getState().data[currentId].response.response)

        // Update the parsed json
        appendJsonResponse(currentId, tlChunk)

        // Merge translated chunk with original subtitles
        const currentSubtitles = useTranslationDataStore.getState().data[currentId].subtitles
        const merged: SubtitleTranslated[] = [...currentSubtitles]
        for (let j = 0; j < tlChunk.length; j++) {
          const index = tlChunk[j].index - 1
          merged[index] = {
            ...merged[index],
            translated: tlChunk[j].translated || merged[index].translated,
          }
        }
        setSubtitles(currentId, merged)

        await saveData(currentId)
      }

      // Break if translation is stopped
      const translatingStatus = useTranslationStore.getState().isTranslatingSet.has(currentId)
      if (!translatingStatus) {
        console.log('translation is stopped', 'isTranslating is FALSE')
        break
      }

      // Update context for next chunk
      context.push({
        role: "user",
        content: createContextMemory(requestBody.subtitles)
      })
      context.push({
        role: "assistant",
        content: getContent(rawResponse),
      })

      // For Limited Context Memory
      if (!isUseFullContextMemory) {
        // When isBetterContextCaching is TRUE
        // Only wake the last (pair of) context.
        context = [
          context[context.length - 2],
          context[context.length - 1],
        ]

        // When isBetterContextCaching is FALSE
        // Assume: size (split size) >= contextMemorySize
        // Slice maximum of contextMemorySize of dialogues
        if (!isBetterContextCaching && context.length >= 2) {
          if (size < limitedContextMemorySize) {
            console.error(
              "Split size should be greater than or equal to context memory size " +
              "The code below only takes the last (pair of) context"
            )
          }

          const lastUser = requestBody.subtitles.subtitles
          const lastAssistant = requestBody.subtitles.subtitles.map((s, subIndex) => ({
            index: s.index,
            content: s.content,
            translated: tlChunk[subIndex]?.translated || "",
          }))

          context[0].content = createContextMemory(lastUser.slice(-limitedContextMemorySize))
          context[1].content = createContextMemory(lastAssistant.slice(-limitedContextMemorySize))
        }
      }

      // Process the next chunk
      const nextIndex = tlChunk[tlChunk.length - 1].index + 1

      const s = nextIndex - 1
      const e = minMax(adjustedEndIndex, s, subtitles.length - 1)
      if (s > adjustedEndIndex) break

      const nextChunk = firstChunk(size, s, e)[0]
      if (nextChunk.length) {
        subtitleChunks.push(nextChunk)
      }

      // Delay between each chunk
      await sleep(3000)
      batch++
    }

    // Only set isTranslating to false if not part of a batch operation,
    // or if it was stopped (in which case it would already be false or will be set by stopTranslation)
    if (!partOfBatch) {
      // Check if it was stopped during the process by looking at the store state
      const stillTranslating = useTranslationStore.getState().isTranslatingSet.has(currentId)
      if (stillTranslating) {
        setIsTranslating(currentId, false)
      }
    }

    // Add to history *after* translation is complete, including subtitles and parsed
    if (allRawResponses.length > 0) {
      // TODO: Save to history
      // addHistory(
      //   title,
      //   allRawResponses,
      //   useTranslationDataStore.getState().data[currentId].response.jsonResponse,
      //   useTranslationDataStore.getState().data[currentId].subtitles,
      //   useTranslationDataStore.getState().data[currentId].parsed,
      // )
    }

    refetchUserData()
    await saveData(currentId)
  }

  const handleContinueTranslation = async (currentId: string) => {
    const subtitles = translationData[currentId]?.subtitles ?? []

    // TODO: Refactor to separate function
    // --- COPY PASTE FROM SUBTITLE TRANSLATOR MAIN ---

    const { untranslated: initialUntranslated } = countUntranslatedLines(subtitles)
    const untranslated = mergeIntervalsWithGap(initialUntranslated, 5)
    console.log(JSON.stringify(untranslated))

    if (untranslated.length === 0) return

    setIsTranslating(currentId, true)
    setHasChanges(true)
    // setActiveTab("result")
    setJsonResponse(currentId, [])
    // setTimeout(() => {
    //   window.scrollTo({
    //     top: 0,
    //     behavior: "smooth",
    //   })
    // }, 300)

    for (const block of untranslated) {
      if (!useTranslationStore.getState().isTranslatingSet.has(currentId)) {
        console.log("Continue Translation: Operation stopped by user before processing a block.")
        break
      }

      const [startIdx, endIdx] = block
      console.log(`Continue Translation: Processing block from index ${startIdx} to ${endIdx}.`)

      try {
        await handleStartTranslation(currentId, startIdx, endIdx, true)
        if (!useTranslationStore.getState().isTranslatingSet.has(currentId)) {
          console.log("Continue Translation: Operation stopped by user during processing of a block.")
          break
        }
      } catch (error) {
        console.error(`Continue Translation: Error processing block ${startIdx}-${endIdx}:`, error)
        break
      }
    }

    setIsTranslating(currentId, false)
    refetchUserData()
  }

  const handleSingleFileDownload = (batchFileId: string) => {
    const translation = translationData[batchFileId]
    if (!translation) return

    const fileContent = generateSubtitleContentForTranslation(translation, downloadOption, combinedFormat)
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

  const generateSubtitleContentForTranslation = (
    translation: Translation,
    option: DownloadOption,
    format: CombinedFormat,
    forceToType?: SubtitleType,
  ): string => {
    const { subtitles, parsed } = translation

    const subtitleData = subtitles.map((s) => {
      let content = ""
      if (option === "original") {
        content = s.content
      } else if (option === "translated") {
        content = s.translated
      } else {
        content = combineSubtitleContent(
          s.content,
          s.translated,
          format,
          parsed.type,
        )
      }
      return {
        index: s.index,
        timestamp: s.timestamp,
        actor: s.actor,
        content,
      }
    })

    if (subtitleData.length === 0) return ""

    const fileContent = mergeSubtitle({ subtitles: subtitleData, parsed })

    return toType !== "no-change"
      ? convertSubtitle(fileContent, parsed.type, forceToType ?? toType)
      : fileContent
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
      const fileContent = generateSubtitleContentForTranslation(translation, option, format)

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
    setPreviewTranslationId(id)
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
          Delete
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
                disabled={isBatchTranslating || batchFiles.length === 0}
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
              disabled={isBatchTranslating || batchFiles.length === 0}
            >
              <CheckSquare className="h-4 w-4" />
              {isSelecting ? 'Cancel' : 'Select'}
            </Button>
          </div>

          <DragAndDrop onDropFiles={handleFileDrop} disabled={isBatchTranslating}>
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
              onClick={handleInitiateBatchTranslation}
              disabled={isBatchTranslating || !session || batchFiles.length === 0}
            >
              {isBatchTranslating ? (
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
              disabled={!isBatchTranslating}
            >
              <Square className="h-4 w-4" />
              Stop All
            </Button>
          </div>

          <Button
            variant="outline"
            className="h-10 w-full border-primary/25 hover:border-primary/50"
            onClick={handleContinueBatchTranslation}
            disabled={isBatchTranslating || !session || batchFiles.length === 0}
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
                onClick={() => setConcurrentTranslations(currentProject?.id ?? "", Math.max(1, concurrentTranslations - 1))}
                disabled={concurrentTranslations <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                max={MAX_CONCURRENT_TRANSLATION}
                value={concurrentTranslations}
                onChange={(e) => setConcurrentTranslations(currentProject?.id ?? "", Math.max(1, Math.min(MAX_CONCURRENT_TRANSLATION, parseInt(e.target.value) || 1)))}
                className="w-10 h-7 text-center border-0 bg-transparent shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 flex items-center justify-center p-0 hover:text-foreground text-lg font-medium select-none"
                onClick={() => setConcurrentTranslations(currentProject?.id ?? "", Math.min(MAX_CONCURRENT_TRANSLATION, concurrentTranslations + 1))}
                disabled={concurrentTranslations >= MAX_CONCURRENT_TRANSLATION}
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
                disabled={isBatchTranslating}
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
      <AlertDialog open={isRestartTranslationDialogOpen} onOpenChange={setIsRestartTranslationDialogOpen}>
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
      <AlertDialog open={isStartTranslationDialogOpen} onOpenChange={setIsStartTranslationDialogOpen}>
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
                  This will process up to <strong>{concurrentTranslations}</strong> files simultaneously from <strong>{sourceLanguage}</strong> to <strong>{targetLanguage}</strong> using <strong>{isUseCustomModel ? "Custom Model" : modelDetail?.name}</strong>.
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
      <AlertDialog open={isContinueTranslationDialogOpen} onOpenChange={setIsContinueTranslationDialogOpen}>
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
            <AlertDialogAction onClick={handleStartContinueBatchTranslation}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!previewTranslationId} onOpenChange={(open) => {
        if (!open) {
          setPreviewTranslationId(null)
          if (previewTranslationId) {
            saveData(previewTranslationId)
          }
        }
      }}>
        <DialogContent className="max-w-6xl w-full">
          <DialogHeader>
            <DialogTitle>Translation Preview</DialogTitle>
          </DialogHeader>
          {previewTranslationId && (
            <div className="max-h-[80vh] overflow-y-auto">
              <SubtitleTranslatorMain
                currentId={previewTranslationId}
                translation={translationData[previewTranslationId]}
                basicSettingsId={isUseSharedSettings ? basicSettingsId : translationData[previewTranslationId].basicSettingsId}
                advancedSettingsId={isUseSharedSettings ? advancedSettingsId : translationData[previewTranslationId].advancedSettingsId}
                isSharedSettings={isUseSharedSettings}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
