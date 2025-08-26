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
  ArrowLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"
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
  SubtitleTranslated,
  SubtitleNoTime,
  DownloadOption,
  CombinedFormat,
  SubtitleType,
} from "@/types/subtitles"
import { cn } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
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
import { useSessionStore } from "@/stores/use-session-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { countUntranslatedLines } from "@/lib/subtitles/utils/count-untranslated"
import { mergeIntervalsWithGap } from "@/lib/subtitles/utils/merge-intervals-w-gap"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Translation } from "@/types/project"
import { DownloadSection } from "../download-section"
import { SUBTITLE_NAME_MAP, ACCEPTED_FORMATS } from "@/constants/subtitle-formats"
import { useTranslationHandler } from "@/hooks/use-translation-handler"

interface SubtitleTranslatorMainProps {
  currentId: string
  translation: Translation
  basicSettingsId: string
  advancedSettingsId: string
  isSharedSettings?: boolean
}

export default function SubtitleTranslatorMain({
  currentId,
  translation,
  basicSettingsId,
  advancedSettingsId,
  isSharedSettings,
}: SubtitleTranslatorMainProps) {
  // Translation Data Store
  const setTitle = useTranslationDataStore((state) => state.setTitle)
  const setSubtitles = useTranslationDataStore((state) => state.setSubtitles)
  const setParsed = useTranslationDataStore((state) => state.setParsed)
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)
  const saveData = useTranslationDataStore((state) => state.saveData)

  // Get current translation data
  const title = translation.title
  const subtitles = translation.subtitles
  const parsed = translation.parsed
  const subName = SUBTITLE_NAME_MAP.get(parsed.type) ?? "SRT"
  const maxSubtitles = 1000

  // Basic Settings Store
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage(basicSettingsId))
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setContextDocument = (doc: string) => setBasicSettingsValue(basicSettingsId, "contextDocument", doc)

  // Advanced Settings Store
  const resetIndex = useAdvancedSettingsStore((state) => state.resetIndex)

  // Translation Store
  const isTranslatingSet = useTranslationStore((state) => state.isTranslatingSet)
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)
  const isTranslating = isTranslatingSet.has(currentId)

  // Other Store
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
  const router = useRouter()
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

  // Translation handler
  const { handleStart, handleStop, generateSubtitleContent } = useTranslationHandler({
    state: { toType, setActiveTab },
    options: { isBatch: false },
  })

  const handleStartTranslation = async (
    overrideStartIndexParam?: number,
    overrideEndIndexParam?: number,
    isContinuation?: boolean
  ) => {
    await handleStart({
      currentId,
      basicSettingsId,
      advancedSettingsId,
      overrideStartIndexParam,
      overrideEndIndexParam,
      isContinuation,
    })
  }

  const handleStopTranslation = () => {
    handleStop(currentId)
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
        resetIndex(advancedSettingsId, 1, parsedSubtitles.length)

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
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/project')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
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
            generateContent={(option, format) => generateSubtitleContent(currentId, option, format)}
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
                  {isSharedSettings && (
                    <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                  )}
                  <LanguageSelection
                    basicSettingsId={basicSettingsId}
                  />
                  <ModelSelection
                    basicSettingsId={basicSettingsId}
                    advancedSettingsId={advancedSettingsId}
                  />
                  <DragAndDrop onDropFiles={handleContextFileUpload} disabled={isTranslating}>
                    <ContextDocumentInput
                      basicSettingsId={basicSettingsId}
                    />
                  </DragAndDrop>
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
                <CardContent className="p-4 space-y-4">
                  <ModelDetail
                    basicSettingsId={basicSettingsId}
                  />
                  {isSharedSettings && (
                    <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
                  )}
                  <TemperatureSlider
                    advancedSettingsId={advancedSettingsId}
                  />
                  <StartIndexInput
                    advancedSettingsId={advancedSettingsId}
                  />
                  <EndIndexInput
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
