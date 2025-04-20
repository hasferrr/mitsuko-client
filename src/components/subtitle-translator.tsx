"use client"

import Link from "next/link"
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
  Download,
  Upload,
  FileText,
  Trash,
  Loader2,
  History as HistoryIcon,
  AlignCenter,
  Box,
  SquareChartGantt,
  SaveIcon,
  Eye,
  EyeOff,
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
} from "./settings-inputs"
import {
  Subtitle,
  SubOnlyTranslated,
  SubtitleTranslated,
  SubtitleNoTime,
} from "@/types/types"
import { ContextCompletion } from "@/types/completion"
import { parseSRT } from "@/lib/subtitles/srt/parse"
import { parseASS } from "@/lib/subtitles/ass/parse"
import { generateSRT } from "@/lib/subtitles/srt/generate"
import { mergeASSback } from "@/lib/subtitles/ass/merge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ModelDetail } from "./model-detail"
import { isASS, isSRT } from "@/lib/subtitles/is"
import { toast } from "sonner"
import { SubtitleTools } from "./subtitle-tools"
import { SubtitleProgress } from "./subtitle-progress"
import { SubtitleResultOutput } from "./subtitle-result-output"
import { getContent, parseTranslationJson } from "@/lib/parser/parser"
import { createContextMemory } from "@/lib/stream/context-memory"
import { useSessionStore } from "@/stores/use-session-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { getAdvancedSettings, getBasicSettings } from "@/lib/db/settings"
import { useProjectStore } from "@/stores/data/use-project-store"
import { fetchUserData } from "@/lib/api/user"
import { UserData } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { logSubtitle } from "@/lib/api/subtitle-log"

type DownloadOption = "original" | "translated" | "both"
type BothFormat = "(o)-t" | "(t)-o" | "o-n-t" | "t-n-o"

export default function SubtitleTranslator() {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)

  if (!currentId || !translationData[currentId]) {
    return <div className="p-4">No translation project selected</div>
  }

  // Get translation data and functions from store
  const {
    setTitle,
    setSubtitles,
    setParsed,
    resetParsed,
    setResponse,
    setJsonResponse,
    appendJsonResponse,
    saveData
  } = useTranslationDataStore()

  // Get current translation data
  const translation = translationData[currentId]
  const title = translation?.title ?? ""
  const subtitles = translation?.subtitles ?? []
  const parsed = translation?.parsed ?? { type: "srt", data: null }

  // Settings Store
  const {
    getSourceLanguage,
    getTargetLanguage,
    getModelDetail,
    getIsUseCustomModel,
    getContextDocument,
    customBaseUrl,
    customModel,
    apiKey,
    setCurrentId: setSettingsCurrentId,
    upsertData: upsertSettingsData,
    setContextDocument,
  } = useSettingsStore()

  const sourceLanguage = getSourceLanguage()
  const targetLanguage = getTargetLanguage()
  const modelDetail = getModelDetail()
  const isUseCustomModel = getIsUseCustomModel()
  const contextDocument = getContextDocument()

  // Advanced Settings Store
  const {
    getTemperature,
    getMaxCompletionTokens,
    getIsMaxCompletionTokensAuto,
    getSplitSize,
    getStartIndex,
    getEndIndex,
    getIsUseStructuredOutput,
    getIsUseFullContextMemory,
    getIsBetterContextCaching,
    setCurrentId: setAdvancedSettingsCurrentId,
    upsertData: upsertAdvancedSettingsData,
    resetIndex,
  } = useAdvancedSettingsStore()

  const temperature = getTemperature()
  const maxCompletionTokens = getMaxCompletionTokens()
  const isMaxCompletionTokensAuto = getIsMaxCompletionTokensAuto()
  const splitSize = getSplitSize()
  const startIndex = getStartIndex()
  const endIndex = getEndIndex()
  const isUseStructuredOutput = getIsUseStructuredOutput()
  const isUseFullContextMemory = getIsUseFullContextMemory()
  const isBetterContextCaching = getIsBetterContextCaching()

  // Translation Store
  const isTranslatingSet = useTranslationStore((state) => state.isTranslatingSet)
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)
  const translateSubtitles = useTranslationStore((state) => state.translateSubtitles)
  const stopTranslation = useTranslationStore((state) => state.stopTranslation)
  const isTranslating = isTranslatingSet.has(currentId)

  // History Store & State
  const addHistory = useHistoryStore((state) => state.addHistory)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Other Store
  const session = useSessionStore((state) => state.session)

  // Add lazy user data query that only executes manually
  const { refetch: refetchUserData } = useQuery<UserData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserData,
    enabled: false, // Lazy query - won't run automatically
    staleTime: 0, // Always refetch when requested
  })

  // Other State
  const [activeTab, setActiveTab] = useState(isTranslating ? "result" : "basic")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isContextUploadDialogOpen, setIsContextUploadDialogOpen] = useState(false)
  const [pendingContextFile, setPendingContextFile] = useState<File | null>(null)
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("translated")
  const [bothFormat, setBothFormat] = useState<BothFormat>("o-n-t")
  const [toolsOpen, setToolsOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isASSGuidanceDialogOpen, setIsASSGuidanceDialogOpen] = useState(false)
  const [subtitlesHidden, setSubtitlesHidden] = useState(true)

  // Other
  const { setHasChanges } = useUnsavedChanges()
  const subName = parsed.type === "ass" ? "SSA" : "SRT"

  // Auto-show subtitles if count is less than 1000
  const maxSubtitles = 1000
  useEffect(() => {
    if (subtitles.length < maxSubtitles) {
      setSubtitlesHidden(false)
    }
  }, [subtitles.length])

  useEffect(() => {
    if (translationData[currentId].projectId !== useProjectStore.getState().currentProject?.id) {
      useProjectStore.getState().setCurrentProject(translationData[currentId].projectId)
    }

    if (!translationData[currentId]) return
    setSettingsCurrentId(translationData[currentId].basicSettingsId)
    setAdvancedSettingsCurrentId(translationData[currentId].advancedSettingsId)

    // Fetch settings data if available
    if (translationData[currentId].basicSettingsId) {
      getBasicSettings(translationData[currentId].basicSettingsId)
        .then(settings => {
          if (settings) {
            upsertSettingsData(settings.id, settings)
          }
        })
    }

    // Fetch advanced settings data if available
    if (translationData[currentId].advancedSettingsId) {
      getAdvancedSettings(translationData[currentId].advancedSettingsId)
        .then(advancedSettings => {
          if (advancedSettings) {
            upsertAdvancedSettingsData(advancedSettings.id, advancedSettings)
          }
        })
    }

    return () => { saveData(currentId) }
  }, [])

  const fixedSplit = (size: number, s: number, e: number) => {
    const subtitleChunks: SubtitleNoTime[][] = []
    for (let i = s; i <= e; i += size) {
      subtitleChunks.push(subtitles.slice(i, Math.min(i + size, e + 1)).map((s) => ({
        index: s.index,
        actor: s.actor,
        content: s.content,
      })))
    }
    return subtitleChunks
  }

  const firstChunk = (size: number, s: number, e: number) => {
    const subtitleChunks: SubtitleNoTime[][] = []
    subtitleChunks.push(subtitles.slice(s, Math.min(s + size, e + 1)).map((s) => ({
      index: s.index,
      actor: s.actor,
      content: s.content,
    })))
    return subtitleChunks
  }

  const handleStartTranslation = async () => {
    if (!subtitles.length) return
    setIsTranslating(currentId, true)
    setHasChanges(true)
    setActiveTab("result")
    setJsonResponse(currentId, [])
    await saveData(currentId)

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    // Accumulate raw responses
    const allRawResponses: string[] = []

    // Split subtitles into chunks, starting from startIndex - 1
    const size = minMax(splitSize, SPLIT_SIZE_MIN, SPLIT_SIZE_MAX)
    const adjustedStartIndex = minMax(startIndex - 1, 0, subtitles.length - 1)
    const adjustedEndIndex = minMax(endIndex - 1, adjustedStartIndex, subtitles.length - 1)

    const isAutoContinue = true

    // NOTE: isAutoContinue is ALYWAYS true
    const subtitleChunks = isAutoContinue
      ? firstChunk(size, adjustedStartIndex, adjustedEndIndex)
      : fixedSplit(size, adjustedStartIndex, adjustedEndIndex)

    // Set Limited Context Memory size
    const limitedContextMemorySize = 5

    // Prepare context for the first chunk
    let context: ContextCompletion[] = []

    // Split by number of split size
    if (startIndex > 1) {
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
    logSubtitle(title, generateSubtitleContent("original"), currentId)

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
        uuid: currentId,
      }

      let tlChunk: SubOnlyTranslated[] = []
      let rawResponse = ""

      try {
        const result = await translateSubtitles(
          requestBody,
          isUseCustomModel ? apiKey : "",
          !isUseCustomModel,
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
      if (isAutoContinue) {
        const nextIndex = tlChunk[tlChunk.length - 1].index + 1

        const s = nextIndex - 1
        const e = minMax(adjustedEndIndex, s, subtitles.length - 1)
        if (s > adjustedEndIndex) break

        const nextChunk = firstChunk(size, s, e)[0]
        if (nextChunk.length) {
          subtitleChunks.push(nextChunk)
        }
      }

      // Delay between each chunk
      await sleep(3000)
      batch++
    }

    setIsTranslating(currentId, false)

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

    // Refetch user data after translation completes to update credits
    refetchUserData()

    await saveData(currentId)
  }

  const handleStopTranslation = () => {
    stopTranslation(currentId)
    setIsTranslating(currentId, false)
    saveData(currentId)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const fileList = event instanceof FileList ? event : event.target.files
    if (!fileList || fileList.length === 0) return

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
    if (!pendingFile) return;

    try {
      const text = await pendingFile.text()
      let type: "srt" | "ass" | null = null

      let parsedSubs: Subtitle[] = []
      if (isSRT(text)) {
        type = "srt"
        parsedSubs = parseSRT(text)
        setParsed(currentId, { type, data: null })
      } else if (isASS(text)) {
        type = "ass"
        const data = parseASS(text)
        parsedSubs = data.subtitles
        setParsed(currentId, { type, data })

        // Flag to show ASS guidance dialog
        setIsASSGuidanceDialogOpen(true)
      } else {
        console.error("Invalid file type")
        toast.error("Invalid file type")
        return
      }

      const parsedSubtitles: SubtitleTranslated[] = parsedSubs.map((subtitle) => ({
        ...subtitle,
        translated: "",
      }))

      if (parsedSubtitles.length >= maxSubtitles) {
        setSubtitlesHidden(true)
      }

      setSubtitles(currentId, parsedSubtitles)
      resetIndex(1, parsedSubtitles.length)

      const fileName = pendingFile.name.split('.')
      fileName.pop()
      setTitle(currentId, fileName.join('.'))

      await saveData(currentId)

    } catch (error) {
      console.error("Error parsing subtitle file:", error)
    } finally {
      setIsUploadDialogOpen(false) // Close dialog after processing
      setPendingFile(null) // Clear pending file
    }
  }

  const processContextFile = async () => {
    if (!pendingContextFile) return
    try {
      const text = await pendingContextFile.text()
      setContextDocument(text)
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
  }

  const handleContextCancel = () => {
    setIsContextUploadDialogOpen(false)
    setPendingContextFile(null)
  }

  const generateSubtitleContent = (option: DownloadOption): string => {
    const subtitleData: Subtitle[] = subtitles.map((s) => {
      // Determine content based on downloadOption
      let content = ""
      if (option === "original") {
        content = s.content
      } else if (option === "translated") {
        content = s.translated
      } else { // "both"
        // Remove new line
        const newContent = parsed.type === "ass"
          ? s.content.replaceAll("\\N", " ").replaceAll("  ", " ").trim()
          : s.content.replaceAll("\n", " ").replaceAll("  ", " ").trim()
        const newTranslated = parsed.type === "ass"
          ? s.translated.replaceAll("\\N", " ").replaceAll("  ", " ").trim()
          : s.translated.replaceAll("\n", " ").replaceAll("  ", " ").trim()

        // Added format options
        if (bothFormat === "(o)-t") {
          content = `(${newContent}) ${newTranslated}`
        } else if (bothFormat === "(t)-o") {
          content = `(${newTranslated}) ${newContent}`
        } else if (bothFormat === "o-n-t") {
          content = parsed.type === "ass"
            ? `${newContent}\\N${newTranslated}`
            : `${newContent}\n${newTranslated}`
        } else if (bothFormat === "t-n-o") {
          content = parsed.type === "ass"
            ? `${newTranslated}\\N${newContent}`
            : `${newTranslated}\n${newContent}`
        } else {
          content = ""
          console.error("Invalid BothFormat")
        }
      }

      return {
        index: s.index,
        timestamp: s.timestamp,
        actor: s.actor,
        content, // Use determined content
      }
    })

    if (!subtitleData.length) return ""

    let fileContent = ""
    if (parsed.type === "srt") {
      fileContent = generateSRT(subtitleData)
    } else if (parsed.type === "ass" && parsed.data) {
      fileContent = mergeASSback(subtitleData, parsed.data)
    } else {
      console.error("Invalid file type or missing parsed data for download.")
      return ""
    }

    return fileContent
  }

  const handleFileDownload = () => {
    const fileContent = generateSubtitleContent(downloadOption)
    if (!fileContent) return

    const blob = new Blob([fileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title}.${parsed.type}` // Use the original file type
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    setSubtitles(currentId, [])
    resetParsed(currentId)
    await saveData(currentId)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await saveData(currentId)
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto container py-4 px-4 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex-1 min-w-40">
          <Input
            value={title}
            onChange={(e) => setTitle(currentId, e.target.value)}
            className="text-xl font-semibold h-12"
          />
        </div>
        <input
          type="file"
          accept=".srt,.ass"
          onChange={handleFileUpload}
          className="hidden"
          id="subtitle-upload"
        />
        {/* Drag and Drop Area + Upload Button */}
        <DragAndDrop onDropFiles={handleFileUpload} disabled={isTranslating}>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => document.getElementById("subtitle-upload")?.click()}
            disabled={isTranslating}
          >
            <Upload className="h-5 w-5" />
            Upload
          </Button>
        </DragAndDrop>
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

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              className="gap-2"
              onClick={handleStartTranslation}
              disabled={isTranslating || !session}
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

          <Link
            href="/extract-context"
            className="w-full mt-2 gap-2 inline-flex items-center justify-center"
          >
            <Button variant="outline" className="w-full gap-2">
              <FileText className="h-4 w-4" />
              Extract Context from Subtitle
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 mt-2"
                disabled={isTranslating}
              >
                <Trash className="h-4 w-4" />
                Remove All Subtitles
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will remove all subtitles.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Download Section */}
          <div className="flex gap-4 mt-4 items-center">
            <Select
              value={downloadOption}
              onValueChange={(value) => {
                setDownloadOption(value as "original" | "translated" | "both")
                if (value !== "both") {
                  setBothFormat("o-n-t") // Reset format if not "both"
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Download As" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original Text</SelectItem>
                <SelectItem value="translated">Translated Text</SelectItem>
                <SelectItem value="both">Original + Translated</SelectItem>
              </SelectContent>
            </Select>

            {/* Dialog for "both" format selection */}
            {downloadOption === "both" && (
              <Dialog>
                <DialogTrigger className="w-full" asChild>
                  <Button variant="outline">
                    <AlignCenter className="w-4 h-4" />
                    Select Format
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Format</DialogTitle>
                    <DialogDescription>
                      Choose how the original and translated text should be combined:
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                      variant={bothFormat === "(o)-t" ? "default" : "outline"}
                      onClick={() => setBothFormat("(o)-t")}
                      className="py-8 flex justify-center w-56"
                    >
                      (Original Text) Translated Text
                    </Button>
                    <Button
                      variant={bothFormat === "(t)-o" ? "default" : "outline"}
                      onClick={() => setBothFormat("(t)-o")}
                      className="py-8 flex justify-center w-56"
                    >
                      (Translated Text) Original Text
                    </Button>
                    <Button
                      variant={bothFormat === "o-n-t" ? "default" : "outline"}
                      onClick={() => setBothFormat("o-n-t")}
                      className="py-8 flex justify-center w-56"
                    >
                      Original Text<br />Translated Text
                    </Button>
                    <Button
                      variant={bothFormat === "t-n-o" ? "default" : "outline"}
                      onClick={() => setBothFormat("t-n-o")}
                      className="py-8 flex justify-center w-56"
                    >
                      Translated Text<br />Original Text
                    </Button>
                  </div>
                  <DialogClose asChild>
                    <Button type="button">
                      Confirm
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}
            {/* END Dialog */}

            <Button
              variant="outline"
              className="gap-2 w-full"
              onClick={handleFileDownload}
            >
              <Download className="h-4 w-4" />
              Download {subName}
            </Button>
          </div>
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
                  <LanguageSelection />
                  <ModelSelection type="translation" />
                  {/* Wrap ContextDocumentInput with DragAndDrop */}
                  <DragAndDrop onDropFiles={handleContextFileUpload} disabled={isTranslating}>
                    <ContextDocumentInput />
                  </DragAndDrop>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <ModelDetail />
                  <TemperatureSlider />
                  <StartIndexInput />
                  <EndIndexInput />
                  <SplitSizeInput />
                  <MaxCompletionTokenInput type="translation" />
                  <StructuredOutputSwitch />
                  <FullContextMemorySwitch />
                  <BetterContextCachingSwitch />
                  <AdvancedSettingsResetButton />
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
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm File Upload</AlertDialogTitle>
            <AlertDialogDescription>
              {subtitles.length > 0
                ? "Uploading a new file will replace the current subtitles.  Are you sure you want to continue?"
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
    </div>
  )
}
