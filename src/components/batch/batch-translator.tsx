"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Upload,
  Loader2,
  Download,
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
import { SubtitleTranslated, SubtitleNoTime, SubOnlyTranslated, DownloadOption, CombinedFormat, Subtitle, Parsed } from "@/types/subtitles"
import { minMax, sleep } from "@/lib/utils"
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
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { z } from "zod"
import { ContextCompletion } from "@/types/completion"
import { getContent, parseTranslationJson } from "@/lib/parser/parser"
import { createContextMemory } from "@/lib/context-memory"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { combineSubtitleContent } from "@/lib/subtitles/utils/combine-subtitle"

interface BatchFile {
  file: File
  id: string
  status: "pending" | "translating" | "done" | "error"
  progress: number
  subtitles: SubtitleTranslated[]
  parsed: Parsed
  response: {
    response: string
    jsonResponse: SubOnlyTranslated[][]
  }
}

export default function BatchTranslator() {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

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

  const handleFileDrop = async (droppedFiles: FileList) => {
    if (!droppedFiles) return;
    const newFiles: BatchFile[] = [];
    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      if (!file.name.endsWith(".srt") && !file.name.endsWith(".ass")) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }
      const text = await file.text();
      const data = parseSubtitle({ content: text });
      const parsedSubtitles: SubtitleTranslated[] = data.subtitles.map(
        (subtitle) => ({
          ...subtitle,
          translated: "",
        })
      );

      newFiles.push({
        file,
        id: crypto.randomUUID(),
        status: "pending",
        progress: 0,
        subtitles: parsedSubtitles,
        parsed: data.parsed,
        response: {
          response: "",
          jsonResponse: [],
        },
      });
    }
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleStartBatchTranslation = async () => {
    if (!files.length) return
    setIsTranslating(true)
    setHasChanges(true)

    const promises = files.map(async (batchFile) => {
      if (batchFile.status !== 'pending') return
      await handleStartTranslation(batchFile)
    })

    await Promise.all(promises)
    setIsTranslating(false)
  }

  const handleStartTranslation = async (batchFile: BatchFile) => {
    if (!batchFile.subtitles.length) return

    setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, status: 'translating' } : f))

    const fewShotSchema = z.object({
      content: z.string(),
      translated: z.string()
    })

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
          setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, status: 'error' } : f))
          return
        }
      }
    }

    const size = minMax(splitSize, SPLIT_SIZE_MIN, SPLIT_SIZE_MAX)
    const adjustedStartIndex = 0
    const adjustedEndIndex = batchFile.subtitles.length - 1

    const firstChunk = (s: number, e: number) => {
      const subtitleChunks: SubtitleNoTime[][] = []
      subtitleChunks.push(batchFile.subtitles.slice(s, Math.min(s + size, e + 1)).map((s) => ({
        index: s.index,
        actor: s.actor,
        content: s.content,
      })))
      return subtitleChunks
    }

    const subtitleChunks = firstChunk(adjustedStartIndex, adjustedEndIndex)
    const limitedContextMemorySize = 5
    let context: ContextCompletion[] = []
    const allRawResponses: string[] = []
    const allJsonResponses: SubOnlyTranslated[][] = []

    let batch = 0
    while (subtitleChunks.length > 0) {
      const chunk = subtitleChunks.shift()!

      const isAdvancedReasoningEnabled = useAdvancedSettingsStore.getState().getIsAdvancedReasoningEnabled()

      const requestBody = {
        title: batchFile.file.name.slice(0, 150),
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
        promptWithPlanning: isAdvancedReasoningEnabled,
        uuid: batchFile.id,
      }

      let tlChunk: SubOnlyTranslated[] = []
      let rawResponse = ""
      let currentResponse = ""

      try {
        const result = await translateSubtitles(
          requestBody,
          isUseCustomModel ? apiKey : "",
          (isUseCustomModel || modelDetail === null)
            ? "custom"
            : (modelDetail.isPaid ? "paid" : "free"),
          batchFile.id,
          (response) => {
            currentResponse = response
            const progress = Math.min(99, (batch / (batchFile.subtitles.length / size)) * 100 + (response.length / 1000))
            setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, progress: progress } : f))
          }
        )
        tlChunk = result.parsed
        rawResponse = result.raw

      } catch {
        rawResponse = currentResponse.trim()
        const rawResponseArr = rawResponse.split("\n")
        if (rawResponseArr[rawResponseArr.length - 1].startsWith("[")) {
          rawResponseArr.pop()
        }
        rawResponse = rawResponseArr.join("\n")

        try {
          tlChunk = parseTranslationJson(rawResponse)
        } catch {
          setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, status: 'error' } : f))
          break
        }
      } finally {
        allRawResponses.push(rawResponse)
        allJsonResponses.push(tlChunk)

        const currentSubtitles = batchFile.subtitles
        const merged: SubtitleTranslated[] = [...currentSubtitles]
        for (let j = 0; j < tlChunk.length; j++) {
          const index = tlChunk[j].index - 1
          if (merged[index]) {
            merged[index] = {
              ...merged[index],
              translated: tlChunk[j].translated || merged[index].translated,
            }
          }
        }

        setFiles(prev => prev.map(f => f.id === batchFile.id ? {
          ...f,
          subtitles: merged,
          response: { response: allRawResponses.join("\n\n---\n\n"), jsonResponse: allJsonResponses }
        } : f))
      }

      context.push({
        role: "user",
        content: createContextMemory(requestBody.subtitles)
      })
      context.push({
        role: "assistant",
        content: getContent(rawResponse),
      })

      if (!isUseFullContextMemory) {
        context = [
          context[context.length - 2],
          context[context.length - 1],
        ]
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

      const nextIndex = tlChunk.length > 0 ? tlChunk[tlChunk.length - 1].index + 1 : adjustedEndIndex + 1
      const s = nextIndex - 1
      const e = minMax(adjustedEndIndex, s, batchFile.subtitles.length - 1)
      if (s > adjustedEndIndex) break

      const nextChunk = firstChunk(s, e)[0]
      if (nextChunk.length) {
        subtitleChunks.push(nextChunk)
      }

      await sleep(3000)
      batch++
    }

    setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, status: 'done', progress: 100 } : f))
  }

  const handleFileDownload = (batchFile: BatchFile, option: DownloadOption, format: CombinedFormat) => {
    const subtitleData: Subtitle[] = batchFile.subtitles.map((s) => {
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
          batchFile.parsed.type,
        )
      }

      return {
        index: s.index,
        timestamp: s.timestamp,
        actor: s.actor,
        content,
      }
    })

    if (!subtitleData.length) return

    const fileContent = mergeSubtitle({
      subtitles: subtitleData,
      parsed: batchFile.parsed,
    })

    const blob = new Blob([fileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${batchFile.file.name.replace(/\.[^/.]+$/, "")}_translated.${batchFile.parsed.type}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto container py-4 px-4 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex-1 min-w-40">
          <Input
            value="Batch Translation"
            className="text-xl font-semibold h-12"
            readOnly
          />
        </div>
        <Button
          className="gap-2"
          onClick={handleStartBatchTranslation}
          disabled={isTranslating || !session || files.length === 0}
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {session ? `Translate ${files.length} files` : "Sign In to Start"}
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-[1fr_402px] gap-6">
        {/* Left Column - Files */}
        <div className="space-y-4">
          <DragAndDrop onDropFiles={handleFileDrop} disabled={isTranslating}>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:border-primary">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Drag and drop subtitle files here.
                <br />
                SRT or ASS formats supported.
              </p>
            </div>
          </DragAndDrop>

          <div className="space-y-2">
            {files.map((batchFile) => (
              <Card key={batchFile.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{batchFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {batchFile.subtitles.length} lines
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {batchFile.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                    {batchFile.status === 'translating' && <Badge variant="outline">Translating ({batchFile.progress.toFixed(0)}%)</Badge>}
                    {batchFile.status === 'done' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleFileDownload(batchFile, 'translated', 'o-n-t')}>
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
                  <LanguageSelection type="translation" />
                  <ModelSelection type="translation" />
                  <ContextDocumentInput />
                  <div className="m-[2px]">
                    <CustomInstructionsInput />
                  </div>
                  <div className="m-[2px]">
                    <FewShotInput />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="flex-grow space-y-4 mt-4">
              <Card className="border border-border bg-card text-card-foreground">
                <CardContent className="p-4 space-y-4">
                  <ModelDetail />
                  <TemperatureSlider type="translation" />
                  <div className="border border-muted-foreground/20 rounded-md p-4 space-y-4">
                    <AdvancedReasoningSwitch />
                  </div>
                  <div className="text-sm font-semibold">Technical Options</div>
                  <SplitSizeInput />
                  <MaxCompletionTokenInput type="translation" />
                  <StructuredOutputSwitch />
                  <FullContextMemorySwitch />
                  <BetterContextCachingSwitch />
                  <AdvancedSettingsResetButton />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
