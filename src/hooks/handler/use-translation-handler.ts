"use client"

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
import { minMax, sleep } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useHistoryStore } from "@/stores/use-history-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import {
  MAX_COMPLETION_TOKENS_MAX,
  MAX_COMPLETION_TOKENS_MIN,
  SPLIT_SIZE_MAX,
  SPLIT_SIZE_MIN,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
} from "@/constants/limits"
import { toast } from "sonner"
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
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { combineSubtitleContent } from "@/lib/subtitles/utils/combine-subtitle"
import { convertSubtitle } from "@/lib/subtitles/utils/convert-subtitle"
import { useProjectStore } from "@/stores/data/use-project-store"

interface UseTranslationHandlerProps {
  state: {
    toType: SubtitleType | "no-change"
    setActiveTab: (tab: string) => void
  }
  options: {
    isBatch: boolean
    onSuccessTranslation?: () => void
    onErrorTranslation?: (args: { currentId: string, isContinuation: boolean }) => void
  }
}

export const useTranslationHandler = ({
  state: {
    toType,
    setActiveTab,
  },
  options: {
    isBatch,
    onSuccessTranslation,
    onErrorTranslation,
  },
}: UseTranslationHandlerProps) => {
  // Translation Data Store
  const setSubtitles = useTranslationDataStore((state) => state.setSubtitles)
  const setResponse = useTranslationDataStore((state) => state.setResponse)
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)
  const appendJsonResponse = useTranslationDataStore((state) => state.appendJsonResponse)
  const saveData = useTranslationDataStore((state) => state.saveData)

  // API Settings Store
  const customApiConfigs = useLocalSettingsStore((state) => state.customApiConfigs)
  const selectedApiConfigIndex = useLocalSettingsStore((state) => state.selectedApiConfigIndex)
  const selectedConfig = selectedApiConfigIndex !== null ? customApiConfigs[selectedApiConfigIndex] : null
  const apiKey = selectedConfig?.apiKey ?? ""
  const customBaseUrl = selectedConfig?.customBaseUrl ?? ""
  const customModel = selectedConfig?.customModel ?? ""

  // Translation Store
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)
  const translateSubtitles = useTranslationStore((state) => state.translateSubtitles)
  const stopTranslation = useTranslationStore((state) => state.stopTranslation)

  // Other Store
  const addHistory = useHistoryStore((state) => state.addHistory)
  const session = useSessionStore((state) => state.session)

  // Custom Hooks
  const { setHasChanges } = useUnsavedChanges()

  // Lazy user data query
  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })


  interface HandleStartParams {
    currentId: string
    basicSettingsId: string
    advancedSettingsId: string
    overrideStartIndexParam?: number
    overrideEndIndexParam?: number
    isContinuation?: boolean
  }

  const handleStart = async ({
    currentId,
    basicSettingsId,
    advancedSettingsId,
    overrideStartIndexParam,
    overrideEndIndexParam,
    isContinuation,
  }: HandleStartParams) => {
    // Get current translation data
    const translation = useTranslationDataStore.getState().data[currentId]
    const title = translation.title
    const subtitles = translation.subtitles
    const parsed = translation.parsed
    const project = await useProjectStore.getState().getProjectDb(translation.projectId)
    const projectName = project?.name || ""

    // Basic Settings Store
    const bscStoreState = useSettingsStore.getState()
    const sourceLanguage = bscStoreState.getSourceLanguage(basicSettingsId)
    const targetLanguage = bscStoreState.getTargetLanguage(basicSettingsId)
    const modelDetail = bscStoreState.getModelDetail(basicSettingsId)
    const isUseCustomModel = bscStoreState.getIsUseCustomModel(basicSettingsId)
    const contextDocument = bscStoreState.getContextDocument(basicSettingsId)
    const customInstructions = bscStoreState.getCustomInstructions(basicSettingsId)
    const fewShot = bscStoreState.getFewShot(basicSettingsId)

    // Advanced Settings Store
    const advStoreState = useAdvancedSettingsStore.getState()
    const temperature = advStoreState.getTemperature(advancedSettingsId)
    const maxCompletionTokens = advStoreState.getMaxCompletionTokens(advancedSettingsId)
    const isMaxCompletionTokensAuto = advStoreState.getIsMaxCompletionTokensAuto(advancedSettingsId)
    const splitSize = advStoreState.getSplitSize(advancedSettingsId)
    const isUseStructuredOutput = advStoreState.getIsUseStructuredOutput(advancedSettingsId)
    const isUseFullContextMemory = advStoreState.getIsUseFullContextMemory(advancedSettingsId)
    const isBetterContextCaching = advStoreState.getIsBetterContextCaching(advancedSettingsId)

    const firstChunk = (size: number, s: number, e: number) => {
      const subtitleChunks: SubtitleNoTime[][] = []
      subtitleChunks.push(subtitles.slice(s, Math.min(s + size, e + 1)).map((s) => ({
        index: s.index,
        actor: s.actor,
        content: s.content,
      })))
      return subtitleChunks
    }

    if (!subtitles.length) return
    setIsTranslating(currentId, true)
    setHasChanges(true)

    if (!isContinuation) {
      if (!isBatch) {
        setActiveTab("result")
      }
      setJsonResponse(currentId, [])
      if (!isBatch) {
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }, 300)
      }
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
          toast.error("Few shot format is invalid! Please follow this format:", {
            description: "[" + JSON.stringify({ content: "string", translated: "string" }, null, 2) + "]",
            className: "select-none",
            classNames: {
              title: "font-normal",
              description: "font-mono whitespace-pre-wrap text-foreground",
            },
          })
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
    logSubtitle(
      title,
      generateSubtitleContent(currentId, "original", "o-n-t", parsed.type),
      currentId,
      isBatch,
      projectName,
    )

    // Translate each chunk of subtitles
    let chunkNumber = 0
    let prevIndex: number | null = null
    let sameChunkCount = 0

    while (subtitleChunks.length > 0) {
      const chunk = subtitleChunks.shift()!
      console.log(`Translation: ${title} (Chunk ${chunkNumber + 1})`)

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
        isBatch,
        projectName,
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
          (response) => setResponse(currentId, response),
          modelDetail?.isFormatReasoning,
        )
        tlChunk = result.parsed
        rawResponse = result.raw

        onSuccessTranslation?.()
      } catch {
        onErrorTranslation?.({ currentId, isContinuation: !!isContinuation })

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
          setResponse(currentId, rawResponse + "\n\n[Failed to parse]")
          // If part of a batch, don't set isTranslating to false here, let the batch handler do it.
          // The error is logged, and the loop in handleContinueTranslation should ideally break.
          if (!isContinuation) {
            setIsTranslating(currentId, false)
          }
          break
        }

      } finally {
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

        // Refetch user credits after each chunk for non-batch mode
        const isUsingCredits = !isUseCustomModel && !!modelDetail?.isPaid
        if (isUsingCredits && !isBatch) refetchUserData()

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

      // Process the next chunk (or restart with the same chunk)
      const nextIndex: number = tlChunk.length > 0
        ? tlChunk[tlChunk.length - 1].index + 1
        : prevIndex ?? (chunk.length > 0 ? chunk[0].index : 1)

      // Check for duplicate chunk (stuck in loop)
      if (prevIndex !== null && nextIndex <= prevIndex) {
        sameChunkCount++
        if (sameChunkCount >= 3) {
          console.error("Translation stopped: Stuck on the same chunk")
          toast.error("Translation stopped: Stuck on the same chunk")
          stopTranslation(currentId)
          break
        }
      } else {
        sameChunkCount = 0
      }
      prevIndex = nextIndex

      const s = nextIndex - 1
      const e = minMax(adjustedEndIndex, s, subtitles.length - 1)
      if (s > adjustedEndIndex) break

      const nextChunk = firstChunk(size, s, e)[0]
      if (nextChunk.length) {
        subtitleChunks.push(nextChunk)
      }

      // Delay between each chunk
      await sleep(1000)
      chunkNumber++
    }

    // Only set isTranslating to false if not part of a batch operation,
    // or if it was stopped (in which case it would already be false or will be set by stopTranslation)
    if (!isContinuation) {
      // Check if it was stopped during the process by looking at the store state
      const stillTranslating = useTranslationStore.getState().isTranslatingSet.has(currentId)
      if (stillTranslating) {
        setIsTranslating(currentId, false)
      }
    }

    // Add to history *after* translation is complete, including subtitles and parsed
    if (allRawResponses.length > 0 && !isBatch) {
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

  const handleStop = (currentId: string) => {
    stopTranslation(currentId)
    setIsTranslating(currentId, false)
    saveData(currentId)
  }

  const generateSubtitleContent = (
    currentId: string,
    option: DownloadOption,
    format: CombinedFormat,
    forceToType?: SubtitleType,
  ): string => {
    const translation = useTranslationDataStore.getState().data[currentId]
    const subtitles = translation.subtitles
    const parsed = translation.parsed

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

    return toType !== "no-change"
      ? convertSubtitle(fileContent, parsed.type, forceToType ?? toType)
      : fileContent
  }

  return {
    handleStart,
    handleStop,
    generateSubtitleContent,
  }
}
