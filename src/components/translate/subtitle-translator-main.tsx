"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe2,
  MessageSquare,
  Play,
  Square,
  Upload,
  Trash,
  Loader2,
  History as HistoryIcon,
  Box,
  SquareChartGantt,
  SaveIcon,
  Eye,
  EyeOff,
  FastForward,
} from "lucide-react"
import { SubtitleList } from "./subtitle-list"
import {
  LanguageSelection,
  ModelSelection,
  ContextDocumentInput,
  TemperatureSlider,
  SplitSizeInput,
  MaxCompletionTokenInput,
  StartIndexInput,
  EndIndexInput,
  StructuredOutputSwitch,
  FullContextMemorySwitch,
  AdvancedSettingsResetButton,
  BetterContextCachingSwitch,
  CustomInstructionsInput,
  FewShotInput,
  AdvancedReasoningSwitch,
} from "../settings"
import {
  Subtitle,
  SubOnlyTranslated,
  SubtitleTranslated,
  SubtitleNoTime,
  DownloadOption,
  CombinedFormat,
  SubtitleType,
} from "@/types/subtitles"
import { ContextCompletion } from "@/types/completion"
import { cn, minMax, sleep } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useHistoryStore } from "@/stores/use-history-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DragAndDrop } from "@/components/ui-custom/drag-and-drop"
import {
  MAX_COMPLETION_TOKENS_MAX,
  MAX_COMPLETION_TOKENS_MIN,
  SPLIT_SIZE_MAX,
  SPLIT_SIZE_MIN,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
} from "@/constants/limits"
import { HistoryPanel } from "./history-panel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ModelDetail } from "./model-detail"
import { toast } from "sonner"
import { SubtitleTools } from "./subtitle-tools"
import { SubtitleProgress } from "./subtitle-progress"
import { SubtitleResultOutput } from "./subtitle-result-output"
import { getContent, parseTranslationJson } from "@/lib/parser/parser"
import { createContextMemory } from "@/lib/context-memory"
import { useSessionStore } from "@/stores/use-session-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { logSubtitle } from "@/lib/api/subtitle-log"
import { z } from "zod"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { countUntranslatedLines } from "@/lib/subtitles/utils/count-untranslated"
import { mergeIntervalsWithGap } from "@/lib/subtitles/utils/merge-intervals-w-gap"
import { combineSubtitleContent } from "@/lib/subtitles/utils/combine-subtitle"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SettingsParentType, Translation } from "@/types/project"
import { DownloadSection } from "../download-section"
import { SUBTITLE_NAME_MAP, ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import { convertSubtitle } from "@/lib/subtitles/utils/convert-subtitle"

interface SubtitleTranslatorMainProps {
  currentId: string
  translation: Translation
  basicSettingsId: string
  advancedSettingsId: string
}

export default function SubtitleTranslatorMain({
  currentId,
  translation,
  basicSettingsId,
  advancedSettingsId,
}: SubtitleTranslatorMainProps) {
  // Translation Data Store
  const setTitle = useTranslationDataStore((state) => state.setTitle)
  const setSubtitles = useTranslationDataStore((state) => state.setSubtitles)
  const setParsed = useTranslationDataStore((state) => state.setParsed)
  const setResponse = useTranslationDataStore((state) => state.setResponse)
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)
  const appendJsonResponse = useTranslationDataStore((state) => state.appendJsonResponse)
  const saveData = useTranslationDataStore((state) => state.saveData)

  // Get current translation data
  const title = translation.title
  const subtitles = translation.subtitles
  const parsed = translation.parsed
  const subName = SUBTITLE_NAME_MAP.get(parsed.type) ?? "SRT"
  const maxSubtitles = 1000

  // API Settings Store
  const customApiConfigs = useLocalSettingsStore((state) => state.customApiConfigs)
  const selectedApiConfigIndex = useLocalSettingsStore((state) => state.selectedApiConfigIndex)
  const selectedConfig =
    selectedApiConfigIndex !== null ? customApiConfigs[selectedApiConfigIndex] : null
  const apiKey = selectedConfig?.apiKey ?? ""
  const customBaseUrl = selectedConfig?.customBaseUrl ?? ""
  const customModel = selectedConfig?.customModel ?? ""

  // Basic Settings Store
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(basicSettingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(basicSettingsId))
  const modelDetail = useSettingsStore((state) => state.getModelDetail(basicSettingsId))
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(basicSettingsId))
  const contextDocument = useSettingsStore((state) => state.getContextDocument(basicSettingsId))
  const customInstructions = useSettingsStore((state) => state.getCustomInstructions(basicSettingsId))
  const fewShot = useSettingsStore((state) => state.getFewShot(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setContextDocument = (doc: string, parent: SettingsParentType) => setBasicSettingsValue(basicSettingsId, "contextDocument", doc, parent)

  // Advanced Settings Store
  const temperature = useAdvancedSettingsStore((state) => state.getTemperature(advancedSettingsId))
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.getMaxCompletionTokens(advancedSettingsId))
  const isMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.getIsMaxCompletionTokensAuto(advancedSettingsId))
  const splitSize = useAdvancedSettingsStore((state) => state.getSplitSize(advancedSettingsId))
  const isUseStructuredOutput = useAdvancedSettingsStore((state) => state.getIsUseStructuredOutput(advancedSettingsId))
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory(advancedSettingsId))
  const isBetterContextCaching = useAdvancedSettingsStore((state) => state.getIsBetterContextCaching(advancedSettingsId))
  const resetIndex = useAdvancedSettingsStore((state) => state.resetIndex)

  // Translation Store
  const isTranslatingSet = useTranslationStore((state) => state.isTranslatingSet)
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)
  const translateSubtitles = useTranslationStore((state) => state.translateSubtitles)
  const stopTranslation = useTranslationStore((state) => state.stopTranslation)
  const isTranslating = isTranslatingSet.has(currentId)

  // Other Store
  const addHistory = useHistoryStore((state) => state.addHistory)
  const session = useSessionStore((state) => state.session)

  // Other State
  const [activeTab, setActiveTab] = useState(isTranslating ? "result" : "basic")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isContextUploadDialogOpen, setIsContextUploadDialogOpen] = useState(false)
  const [pendingContextFile, setPendingContextFile] = useState<File | null>(null)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isASSGuidanceDialogOpen, setIsASSGuidanceDialogOpen] = useState(false)
  const [subtitlesHidden, setSubtitlesHidden] = useState(true)
  const [isInitialUploadDialogOpen, setIsInitialUploadDialogOpen] = useState(false)
  const [uploadMode, setUploadMode] = useState<"normal" | "as-translated">("normal")
  const [isMismatchDialogOpen, setIsMismatchDialogOpen] = useState(false)
  const [pendingNewSubtitles, setPendingNewSubtitles] = useState<SubtitleNoTime[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("translated")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")
  const [toType, setToType] = useState<SubtitleType>(parsed.type)

  // Custom Hooks
  const { setHasChanges } = useUnsavedChanges()

  // Auto-show subtitles if count is less than 1000
  useEffect(() => {
    if (subtitles.length < maxSubtitles) {
      setSubtitlesHidden(false)
    }
  }, [subtitles.length])

  // Lazy user data query
  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })


  const firstChunk = (size: number, s: number, e: number) => {
    const subtitleChunks: SubtitleNoTime[][] = []
    subtitleChunks.push(subtitles.slice(s, Math.min(s + size, e + 1)).map((s) => ({
      index: s.index,
      actor: s.actor,
      content: s.content,
    })))
    return subtitleChunks
  }

  const handleStartTranslation = async (
    overrideStartIndexParam?: number,
    overrideEndIndexParam?: number,
    partOfBatch?: boolean
  ) => {
    if (!subtitles.length) return
    setIsTranslating(currentId, true)
    setHasChanges(true)

    if (!partOfBatch) {
      setActiveTab("result")
      setJsonResponse(currentId, [])
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }, 300)
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
    logSubtitle(title, generateSubtitleContent("original", "o-n-t", parsed.type), currentId)

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

      } catch {
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
        refetchUserData()
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
      addHistory(
        title,
        allRawResponses,
        useTranslationDataStore.getState().data[currentId].response.jsonResponse,
        useTranslationDataStore.getState().data[currentId].subtitles,
        useTranslationDataStore.getState().data[currentId].parsed,
      )
    }

    await saveData(currentId)
  }

  const handleStopTranslation = () => {
    stopTranslation(currentId)
    setIsTranslating(currentId, false)
    saveData(currentId)
  }

  const handleContinueTranslation = async () => {
    const { untranslated: initialUntranslated } = countUntranslatedLines(subtitles)
    const untranslated = mergeIntervalsWithGap(initialUntranslated, 5)
    console.log(JSON.stringify(untranslated))

    if (untranslated.length === 0) return

    setIsTranslating(currentId, true)
    setHasChanges(true)
    setActiveTab("result")
    setJsonResponse(currentId, [])
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    for (const block of untranslated) {
      if (!useTranslationStore.getState().isTranslatingSet.has(currentId)) {
        console.log("Continue Translation: Operation stopped by user before processing a block.")
        break
      }

      const [startIdx, endIdx] = block
      console.log(`Continue Translation: Processing block from index ${startIdx} to ${endIdx}.`)

      try {
        await handleStartTranslation(startIdx, endIdx, true)
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const fileList = event instanceof FileList ? event : event.target.files
    if (!fileList || fileList.length === 0) return

    setIsInitialUploadDialogOpen(false)

    const file = fileList[0]
    setPendingFile(file) // Store the file
    setIsUploadDialogOpen(true) // Open the dialog

    // Reset the input if it's a file input event
    if (!(event instanceof FileList)) {
      event.target.value = ""
    }
  }

  const handleContextFileUpload = async (fileList: FileList) => {
    if (!fileList || fileList.length === 0) return

    const file = fileList[0]
    setPendingContextFile(file)
    setIsContextUploadDialogOpen(true)
  }

  const processFile = async () => {
    if (!pendingFile) return

    try {
      if (uploadMode === "as-translated") {
        if (!subtitles || subtitles.length === 0) {
          toast.error("You must have subtitles loaded to upload a translation.")
          return
        }

        const text = await pendingFile.text()
        const data = parseSubtitle({ content: text })
        const newSubtitles = data.subtitles

        if (newSubtitles.length !== subtitles.length) {
          setPendingNewSubtitles(newSubtitles)
          setIsMismatchDialogOpen(true)
          return // Stop processing, wait for user confirmation
        }

        const updatedSubtitles = subtitles.map((subtitle, index) => ({
          ...subtitle,
          translated: newSubtitles[index]?.content || "",
        }))

        setSubtitles(currentId, updatedSubtitles)
        await saveData(currentId)
        toast.success("Successfully updated translations from file.")
      } else {
        const text = await pendingFile.text()

        const data = parseSubtitle({ content: text })
        const parsedSubtitles: SubtitleTranslated[] = data.subtitles.map((subtitle) => ({
          ...subtitle,
          translated: "",
        }))

        setParsed(currentId, data.parsed)
        if (data.parsed.type === "ass") {
          setIsASSGuidanceDialogOpen(true)
        }
        if (parsedSubtitles.length >= maxSubtitles) {
          setSubtitlesHidden(true)
        }

        setSubtitles(currentId, parsedSubtitles)
        resetIndex(advancedSettingsId, 1, parsedSubtitles.length, "translation")

        const fileName = pendingFile.name.split('.')
        fileName.pop()
        setTitle(currentId, fileName.join('.'))

        await saveData(currentId)
      }
    } catch (error) {
      console.error("Error parsing subtitle file:", error)
      toast.error("Failed to parse subtitle file. Please ensure it is a valid SRT or ASS file.")
    } finally {
      setIsUploadDialogOpen(false) // Close dialog after processing
      setPendingFile(null) // Clear pending file
      setUploadMode("normal")
    }
  }

  const processContextFile = async () => {
    if (!pendingContextFile) return
    try {
      const text = await pendingContextFile.text()
      setContextDocument(text, "translation")
    } catch (error) {
      console.error("Error reading context file:", error)
    } finally {
      setIsContextUploadDialogOpen(false)
      setPendingContextFile(null)
    }
  }

  const handleCancel = () => {
    setIsUploadDialogOpen(false)
    setPendingFile(null)
    setUploadMode("normal")
  }

  const handleContextCancel = () => {
    setIsContextUploadDialogOpen(false)
    setPendingContextFile(null)
  }

  const handleMismatchConfirm = async () => {
    if (pendingNewSubtitles.length === 0 || subtitles.length === 0) return

    const updatedSubtitles = subtitles.map((subtitle, index) => {
      const newTranslationContent = pendingNewSubtitles[index]?.content
      return {
        ...subtitle,
        translated: newTranslationContent !== undefined ? newTranslationContent : subtitle.translated,
      }
    })

    setSubtitles(currentId, updatedSubtitles)
    await saveData(currentId)
    toast.success("Successfully updated translations from file despite line mismatch.")

    // Cleanup
    setIsMismatchDialogOpen(false)
    setPendingNewSubtitles([])
  }

  const handleMismatchCancel = () => {
    setIsMismatchDialogOpen(false)
    setPendingNewSubtitles([])
  }

  const generateSubtitleContent = (
    option: DownloadOption,
    format: CombinedFormat,
    forceToType?: SubtitleType,
  ): string => {
    const subtitleData: Subtitle[] = subtitles.map((s) => {
      // Determine content based on downloadOption
      let content = ""
      if (option === "original") {
        content = s.content
      } else if (option === "translated") {
        content = s.translated
      } else { // "combined"
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
        content, // Use determined content
      }
    })

    if (!subtitleData.length) return ""

    const fileContent = mergeSubtitle({
      subtitles: subtitleData,
      parsed: parsed,
    })

    return convertSubtitle(fileContent, parsed.type, forceToType ?? toType)
  }

  // handleFileDownload logic is now inside DownloadSection

  const handleClearAllTranslations = async () => {
    const updatedSubtitles = subtitles.map(subtitle => ({
      ...subtitle,
      translated: "",
    }))
    setSubtitles(currentId, updatedSubtitles)
    await saveData(currentId)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await saveData(currentId)
    setIsSaving(false)
  }

  const handleInitialUploadDialogChange = (isOpen: boolean) => {
    setIsInitialUploadDialogOpen(isOpen)
    if (!isOpen) {
      setUploadMode("normal")
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto container py-4 px-4 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex-1 min-w-40">
          <Input
            value={title}
            onChange={(e) => setTitle(currentId, e.target.value)}
            onBlur={() => saveData(currentId)}
            className="text-xl font-semibold h-12"
          />
        </div>
        <input
          type="file"
          accept={ACCEPTED_FORMATS.join(",")}
          onChange={handleFileUpload}
          className="hidden"
          id="subtitle-upload"
        />
        {/* Upload Button */}
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => setIsInitialUploadDialogOpen(true)}
          disabled={isTranslating}
        >
          <Upload className="h-5 w-5" />
          Upload
        </Button>
        {/* Save Button */}
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={handleSave}
          disabled={isTranslating || isSaving}
        >
          <SaveIcon className="h-5 w-5" />
          Save
        </Button>
        {/* History Button */}
        <Button
          variant={isHistoryOpen ? "default" : "outline"}
          size="lg"
          className="gap-2 px-4"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <HistoryIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div
        className={cn("grid md:grid-cols-[1fr_402px] gap-6", isHistoryOpen && "hidden")}
      >
        {/* Left Column - Subtitles */}
        <div className="space-y-4">
          <div className="flex items-center mb-4 justify-between mr-4 gap-[6px]">
            <div className="flex flex-wrap items-center gap-[6px]">
              <Badge variant="secondary" className="gap-1">
                <Globe2 className="h-4 w-4" />
                {sourceLanguage} → {targetLanguage}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <MessageSquare className="h-4 w-4" /> {subtitles.length} Lines
              </Badge>
              <Badge variant="secondary" className="gap-1 uppercase">
                {subName}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-[6px] justify-end">
              {subtitles.length >= maxSubtitles && (
                <Badge
                  variant="outline"
                  className="gap-1 cursor-pointer hover:bg-secondary select-none"
                  onClick={() => setSubtitlesHidden(!subtitlesHidden)}
                >
                  {subtitlesHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {subtitlesHidden ? "Show" : "Hide"}
                </Badge>
              )}
              <SubtitleProgress isOpen={progressOpen} setIsOpen={setProgressOpen}>
                <Badge
                  variant="outline"
                  className="gap-1 cursor-pointer hover:bg-secondary select-none"
                >
                  <SquareChartGantt className="h-4 w-4" />
                  Progress
                </Badge>
              </SubtitleProgress>
              <SubtitleTools isOpen={toolsOpen} setIsOpen={setToolsOpen}>
                <Badge
                  variant="outline"
                  className="gap-1 cursor-pointer hover:bg-secondary select-none"
                >
                  <Box className="h-4 w-4" />
                  Tools
                </Badge>
              </SubtitleTools>
            </div>
          </div>

          {/* Wrap SubtitleList with DragAndDrop */}
          <DragAndDrop onDropFiles={handleFileUpload} disabled={isTranslating}>
            <SubtitleList hidden={subtitlesHidden} />
          </DragAndDrop>

          {/* Grid for Start and Stop buttons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Start Translation Button */}
            <Button
              className="gap-2"
              onClick={() => handleStartTranslation()} // Uses store's startIndex/endIndex
              disabled={isTranslating || !session || subtitles.length === 0}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {session ? "Start Translation" : "Sign In to Start"}
                </>
              )}
            </Button>

            {/* Stop Button */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleStopTranslation}
              disabled={!isTranslating || !translation.response.response}
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>

          {/* Continue Translation Button - Moved here, full width */}
          <Button
            variant="outline"
            className="gap-2 w-full mt-2 border-primary/25 hover:border-primary/50"
            onClick={handleContinueTranslation}
            disabled={isTranslating || !session || subtitles.length === 0}
          >
            <FastForward className="h-4 w-4" />
            Continue and Fill Missing Translations
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 mt-2"
                disabled={isTranslating}
              >
                <Trash className="h-4 w-4" />
                Clear All Translations
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will clear all translated text from the subtitles. The original text will remain.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllTranslations}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DownloadSection
            generateContent={generateSubtitleContent}
            fileName={title}
            type={toType}
            downloadOption={downloadOption}
            setDownloadOption={setDownloadOption}
            combinedFormat={combinedFormat}
            setCombinedFormat={setCombinedFormat}
            toType={toType}
            setToType={setToType}
          />
        </div>

        {/* Right Column - Settings */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <LanguageSelection
                    basicSettingsId={basicSettingsId}
                    parent="translation"
                  />
                  <ModelSelection
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <DragAndDrop onDropFiles={handleContextFileUpload} disabled={isTranslating}>
                    <ContextDocumentInput
                      basicSettingsId={basicSettingsId}
                      parent="translation"
                    />
                  </DragAndDrop>
                  <div className="m-[2px]">
                    <CustomInstructionsInput
                      basicSettingsId={basicSettingsId}
                      parent="translation"
                    />
                  </div>
                  <div className="m-[2px]">
                    <FewShotInput
                      basicSettingsId={basicSettingsId}
                      parent="translation"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <ModelDetail
                    basicSettingsId={basicSettingsId}
                  />
                  <TemperatureSlider
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <StartIndexInput
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <EndIndexInput
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <div className="border border-muted-foreground/20 rounded-md p-4 space-y-4">
                    <AdvancedReasoningSwitch />
                  </div>
                  <div className="text-sm font-semibold">Technical Options</div>
                  <SplitSizeInput
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <MaxCompletionTokenInput
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <StructuredOutputSwitch
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <FullContextMemorySwitch
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <BetterContextCachingSwitch
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                  <AdvancedSettingsResetButton
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                    parent="translation"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="result" className="flex-grow space-y-4 mt-4">
              <SubtitleResultOutput />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* History Panel */}
      <HistoryPanel
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        advancedSettingsId={advancedSettingsId}
      />

      {/* Initial Upload Dialog */}
      <Dialog open={isInitialUploadDialogOpen} onOpenChange={handleInitialUploadDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Subtitle File</DialogTitle>
            <DialogDescription>
              Upload a SRT or ASS file. Check the box below to upload as a translation only.
            </DialogDescription>
          </DialogHeader>

          <DragAndDrop onDropFiles={handleFileUpload} disabled={isTranslating}>
            <div
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
              onClick={() => document.getElementById("subtitle-upload")?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Drag and drop file here, or click to select a file.
                <br />
                {Array.from(SUBTITLE_NAME_MAP.keys()).join(", ").toUpperCase()} subtitles file.
              </p>
            </div>
          </DragAndDrop>
          <div className="flex items-center justify-center space-x-2">
            <Checkbox
              id="upload-mode"
              checked={uploadMode === "as-translated"}
              onCheckedChange={(checked) => {
                setUploadMode(checked ? "as-translated" : "normal")
              }}
            />
            <Label
              htmlFor="upload-mode"
              className="text-muted-foreground"
            >
              Only update the current translation text
            </Label>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm File Upload</AlertDialogTitle>
            <AlertDialogDescription>
              {uploadMode === "as-translated"
                ? "This will replace all existing translations with content from the uploaded file. The original text will remain unchanged. Are you sure?"
                : subtitles.length > 0
                  ? "Uploading a new file will replace the current subtitles. Are you sure you want to continue?"
                  : "Are you sure you want to upload this file?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={processFile}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Context Confirmation Dialog */}
      <AlertDialog open={isContextUploadDialogOpen} onOpenChange={setIsContextUploadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Context Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to upload this context file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContextCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={processContextFile}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ASS Subtitle Guidance Dialog */}
      <AlertDialog open={isASSGuidanceDialogOpen} onOpenChange={setIsASSGuidanceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ASS Subtitle Guidelines</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>For best translation results:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Remove/Comment out karaoke effects</li>
                  <li>Remove/Comment out signs</li>
                  <li>Include only dialogue text</li>
                </ul>
                <p className="pt-2">
                  If you need to <span className="font-bold">translate signs</span>,
                  we recommend translating them <span className="font-bold">separately</span> to ensure better quality.
                </p>
                <p className="pt-1 text-sm text-muted-foreground">
                  You may need to <span className="font-bold">re-upload</span> your subtitle after making these changes.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              I understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mismatch Confirmation Dialog */}
      <AlertDialog open={isMismatchDialogOpen} onOpenChange={setIsMismatchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subtitle Line Mismatch</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                The uploaded file has {pendingNewSubtitles.length} lines, but the current project has {subtitles.length} lines.
              </span>
              <span className="block">
                Continuing will update translations line-by-line. Extra lines will be ignored. ASS Comments will be ignored (only consider Dialogue text).
              </span>
              <span className="block">
                Do you want to proceed?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleMismatchCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMismatchConfirm}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
