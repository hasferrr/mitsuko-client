"use client"

import { useRef } from "react"
import {
  Subtitle,
  SubOnlyTranslated,
  SubtitleTranslated,
  SubtitleNoTime,
  DownloadOption,
  CombinedFormat,
  SubtitleType,
} from "@/types/subtitles"
import { minMax, sleep } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useHistoryStore } from "@/stores/ui/use-history-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import {
  MAX_COMPLETION_TOKENS_MAX,
  MAX_COMPLETION_TOKENS_MIN,
  SPLIT_SIZE_MAX,
  SPLIT_SIZE_MIN,
  STUCK_CHUNK_THRESHOLD,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
  TRANSLATION_CHUNK_DELAY_MS,
} from "@/constants/limits"
import {
  buildInitialContext,
  determineContextStrategy,
  updateContextForNextChunk,
} from "@/lib/translation/context-memory"
import { toast } from "sonner"
import { getContent, parseTranslationJson } from "@/lib/parser/parser"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { logSubtitle } from "@/lib/api/subtitle-log"
import MD5 from "crypto-js/md5"
import { z } from "zod"
import { useLocalSettingsStore } from "@/stores/settings/use-local-settings-store"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { combineSubtitleContent } from "@/lib/subtitles/utils/combine-subtitle"
import { convertSubtitle } from "@/lib/subtitles/utils/convert-subtitle"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import { useExtractionHandler } from "@/hooks/handler/use-extraction-handler"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import {
  AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX,
  isAutoContextOwnedBy,
} from "@/lib/extraction/status"
import {
  cleanExtractionResult,
  combineAutoContext,
  findLatestExtraction,
  getEpisodeNumberFromTranslationTitle,
  getExtractionProblem,
  getTranslationSubtitleContent,
} from "@/lib/translation/auto-context"

interface UseTranslationHandlerProps {
  state: {
    toType: SubtitleType | "no-change"
    setActiveTab: (tab: string) => void
  }
  options: {
    isBatch: boolean
    onSuccessTranslation?: () => void
    onErrorTranslation?: (args: { currentId: string, isContinuation: boolean }) => void
    onOpenExtraction?: (extractionId: string) => void
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
    onOpenExtraction,
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
  const stopExtraction = useExtractionStore((state) => state.stopExtraction)

  // Other Store
  const addHistory = useHistoryStore((state) => state.addHistory)
  const session = useSessionStore((state) => state.session)

  // Custom Hooks
  const { setHasChanges } = useUnsavedChanges()
  const scrollToTop = useScrollToTop()
  const autoCreatedExtractionByTranslationRef = useRef<Map<string, string>>(new Map())
  const { handleStart: handleStartExtraction } = useExtractionHandler({
    setActiveTab: () => {},
    isBatch: false,
  })

  const openExtraction = (extractionId: string) => {
    useExtractionDataStore.getState().setCurrentId(extractionId)
    onOpenExtraction?.(extractionId)
  }

  const waitForExtractionToFinish = async (extractionId: string) => {
    if (!useExtractionStore.getState().isExtractingSet.has(extractionId)) return

    await new Promise<void>((resolve) => {
      const unsubscribe = useExtractionStore.subscribe((state) => {
        if (!state.isExtractingSet.has(extractionId)) {
          unsubscribe()
          resolve()
        }
      })

      if (!useExtractionStore.getState().isExtractingSet.has(extractionId)) {
        unsubscribe()
        resolve()
      }
    })
  }

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
    contextDocumentOverride?: string
  }

  const handleStart = async ({
    currentId,
    basicSettingsId,
    advancedSettingsId,
    overrideStartIndexParam,
    overrideEndIndexParam,
    isContinuation,
    contextDocumentOverride,
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
    const contextDocument = contextDocumentOverride ?? bscStoreState.getContextDocument(basicSettingsId)
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
        scrollToTop()
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

    const contextStrategy = determineContextStrategy(isUseFullContextMemory, isBetterContextCaching)

    // Prepare context for the first chunk
    let context = sIndexToUse > 1
      ? buildInitialContext(subtitles, adjustedStartIndex, {
          strategy: contextStrategy,
          splitSize: size,
        })
      : []

    // Log subtitles
    const subtitleContent = generateSubtitleContent(currentId, "original", "o-n-t", parsed.type)
    logSubtitle(title, subtitleContent, isBatch, projectName)

    const md5Hash = MD5(subtitleContent).toString()

    // Translate each chunk of subtitles
    let chunkNumber = 0
    let prevIndex: number | null = null
    let sameChunkCount = 0

    while (subtitleChunks.length > 0) {
      const chunk = subtitleChunks.shift()!
      console.log(`Translation: ${title} (Chunk ${chunkNumber + 1})`)

      const requestBody = {
        title: title.slice(0, 150),
        subtitles: chunk.map((s) => ({
          index: s.index,
          actor: s.actor,
          content: s.content,
        })),
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
        md5: md5Hash,
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

        // TODO: Refactor to separate function
        try {
          tlChunk = parseTranslationJson(rawResponse)
        } catch (error) {
          console.error("Error: ", error)
          setResponse(currentId, rawResponse + "\n\n<error>[Failed to parse]</error>")
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
      const cleanedRawResponse = getContent(rawResponse).replace(/<error>[\s\S]*?<\/error>/g, "").trimEnd()
      context = updateContextForNextChunk(
        context,
        requestBody.subtitles,
        cleanedRawResponse,
        tlChunk,
        { strategy: contextStrategy, splitSize: size }
      )

      // Process the next chunk (or restart with the same chunk)
      const nextIndex: number = tlChunk.length > 0
        ? tlChunk[tlChunk.length - 1].index + 1
        : prevIndex ?? (chunk.length > 0 ? chunk[0].index : 1)

      // Check for duplicate chunk (stuck in loop)
      if (prevIndex !== null && nextIndex <= prevIndex) {
        sameChunkCount++
        if (sameChunkCount >= STUCK_CHUNK_THRESHOLD) {
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
      await sleep(TRANSLATION_CHUNK_DELAY_MS)
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

  const resolveAutoContextDocument = async (
    currentId: string,
    basicSettingsId: string,
  ): Promise<string | null> => {
    const translationStore = useTranslationDataStore.getState()
    const extractionDataStore = useExtractionDataStore.getState()
    const projectStore = useProjectStore.getState()
    const translation = translationStore.data[currentId]
    const mode = translation.autoContextMode ?? "disabled"

    if (isBatch || mode === "disabled") return useSettingsStore.getState().getContextDocument(basicSettingsId)

    const project = await projectStore.getProjectDb(translation.projectId)
    if (!project) {
      toast.error("Project was not found.")
      return null
    }

    const projectExtractions = (await extractionDataStore.getExtractionsDb(project.extractions)).toReversed()

    const runOwnedAutoExtraction = async (extractionId: string) => {
      const extraction = useExtractionDataStore.getState().data[extractionId]
        ?? await useExtractionDataStore.getState().getExtractionDb(extractionId)
      if (!extraction) return false

      useExtractionDataStore.getState().mutateData(extractionId, "title", `${AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX} ${translation.title}`)
      useExtractionDataStore.getState().mutateData(extractionId, "episodeNumber", getEpisodeNumberFromTranslationTitle(translation.title))
      useExtractionDataStore.getState().mutateData(extractionId, "subtitleContent", getTranslationSubtitleContent(translation))
      await useExtractionDataStore.getState().saveData(extractionId)

      autoCreatedExtractionByTranslationRef.current.set(currentId, extractionId)
      try {
        return await handleStartExtraction(extractionId, extraction.basicSettingsId, extraction.advancedSettingsId)
      } finally {
        autoCreatedExtractionByTranslationRef.current.delete(currentId)
      }
    }

    const resolveExisting = async (extractionId: string | null) => {
      if (!extractionId) {
        toast.error("Auto context is set to use an existing extraction, but none is selected.")
        return null
      }

      let extraction = extractionDataStore.data[extractionId] ?? await extractionDataStore.getExtractionDb(extractionId)
      if (!extraction) {
        toast.error("Selected context extraction was not found.")
        return null
      }
      if (extraction.projectId !== translation.projectId) {
        toast.error("Selected context extraction is not in this project.", {
          action: {
            label: "Open",
            onClick: () => openExtraction(extraction.id),
          },
        })
        return null
      }

      if (useExtractionStore.getState().isExtractingSet.has(extraction.id)) {
        toast.info("Waiting for selected context extraction to finish before translation.")
        await waitForExtractionToFinish(extraction.id)
        if (!useTranslationStore.getState().isTranslatingSet.has(currentId)) return null
        const updatedExtraction = await extractionDataStore.getExtractionDb(extraction.id)
        if (!updatedExtraction) {
          toast.error("Selected context extraction was not found.")
          return null
        }
        extraction = updatedExtraction
      }

      const problem = getExtractionProblem(extraction, translation.projectId, useExtractionStore.getState().isExtractingSet)
      if (problem) {
        if (isAutoContextOwnedBy(extraction, currentId)) {
          const success = await runOwnedAutoExtraction(extraction.id)
          if (!useTranslationStore.getState().isTranslatingSet.has(currentId)) return null
          if (!success) {
            toast.error("Auto context extraction failed. Translation was not started.")
            return null
          }

          const updatedExtraction = await extractionDataStore.getExtractionDb(extraction.id)
          const updatedProblem = getExtractionProblem(
            updatedExtraction,
            translation.projectId,
            useExtractionStore.getState().isExtractingSet,
          )
          if (updatedProblem || !updatedExtraction) {
            toast.error(updatedProblem ?? "Auto context extraction was not found after rerun.", {
              action: updatedExtraction ? {
                label: "Open",
                onClick: () => openExtraction(updatedExtraction.id),
              } : undefined,
            })
            return null
          }

          return combineAutoContext(
            cleanExtractionResult(updatedExtraction.contextResult),
            useSettingsStore.getState().getContextDocument(basicSettingsId),
          )
        }

        toast.error(problem, {
          action: extraction ? {
            label: "Open",
            onClick: () => openExtraction(extraction.id),
          } : undefined,
        })
        return null
      }

      return combineAutoContext(
        cleanExtractionResult(extraction.contextResult),
        useSettingsStore.getState().getContextDocument(basicSettingsId),
      )
    }

    if (mode === "use-existing") {
      return resolveExisting(translation.autoContextExtractionId)
    }

    const getProjectExtraction = async (extractionId: string) => {
      return projectExtractions.find(extraction => extraction.id === extractionId)
        ?? await extractionDataStore.getExtractionDb(extractionId)
    }

    const previousMode = translation.autoContextPreviousMode ?? "latest"
    let previousExtraction = null as Awaited<ReturnType<typeof getProjectExtraction>> | null

    if (previousMode === "selected") {
      if (!translation.autoContextPreviousExtractionId) {
        toast.error("Auto context is set to use a selected previous extraction, but none is selected.")
        return null
      }

      const selectedPrevious = await getProjectExtraction(translation.autoContextPreviousExtractionId)
      const problem = getExtractionProblem(
        selectedPrevious,
        translation.projectId,
        useExtractionStore.getState().isExtractingSet,
        "Selected previous context",
      )
      if (problem) {
        toast.error(problem, {
          action: selectedPrevious ? {
            label: "Open",
            onClick: () => openExtraction(selectedPrevious.id),
          } : undefined,
        })
        return null
      }
      previousExtraction = selectedPrevious
    } else if (previousMode === "latest") {
      const excludedIds = new Set<string>()
      if (translation.autoContextExtractionId) excludedIds.add(translation.autoContextExtractionId)
      const latestPreviousExtraction = findLatestExtraction(
        projectExtractions,
        translation.projectId,
        useExtractionStore.getState().isExtractingSet,
        excludedIds,
      )
      if (latestPreviousExtraction) {
        previousExtraction = latestPreviousExtraction
      }
    }

    const previousContext = previousExtraction ? cleanExtractionResult(previousExtraction.contextResult) : ""

    const created = await extractionDataStore.createExtractionDb(project.id, {
      title: `${AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX} ${translation.title}`,
      episodeNumber: getEpisodeNumberFromTranslationTitle(translation.title),
      subtitleContent: getTranslationSubtitleContent(translation),
      previousContext,
      contextResult: "",
      status: "idle",
      origin: "auto-context",
      ownerTranslationId: currentId,
      completedAt: null,
    })

    autoCreatedExtractionByTranslationRef.current.set(currentId, created.id)
    translationStore.mutateData(currentId, "autoContextMode", "use-existing")
    translationStore.mutateData(currentId, "autoContextExtractionId", created.id)
    translationStore.mutateData(currentId, "autoContextPreviousExtractionId", previousExtraction?.id ?? null)
    await translationStore.saveData(currentId)
    await projectStore.loadProjects()

    if (!useTranslationStore.getState().isTranslatingSet.has(currentId)) {
      autoCreatedExtractionByTranslationRef.current.delete(currentId)
      return null
    }

    let success = false
    try {
      success = await handleStartExtraction(created.id, created.basicSettingsId, created.advancedSettingsId)
    } finally {
      autoCreatedExtractionByTranslationRef.current.delete(currentId)
    }

    translationStore.mutateData(currentId, "autoContextExtractionId", created.id)
    translationStore.mutateData(currentId, "autoContextMode", "use-existing")
    await translationStore.saveData(currentId)

    if (!useTranslationStore.getState().isTranslatingSet.has(currentId)) {
      return null
    }

    if (!success) {
      toast.error("Auto context extraction failed. Translation was not started.")
      return null
    }

    const updatedExtraction = await extractionDataStore.getExtractionDb(created.id)
    if (!updatedExtraction) {
      toast.error("Auto context extraction was not found after creation.")
      return null
    }
    const problem = getExtractionProblem(updatedExtraction, translation.projectId, useExtractionStore.getState().isExtractingSet)
    if (problem) {
      toast.error(problem, {
        action: {
          label: "Open",
          onClick: () => openExtraction(created.id),
        },
      })
      return null
    }

    return combineAutoContext(
      cleanExtractionResult(updatedExtraction.contextResult),
      useSettingsStore.getState().getContextDocument(basicSettingsId),
    )
  }

  const handleStartWithAutoContext = async (params: HandleStartParams) => {
    if (isBatch || params.isContinuation) {
      await handleStart(params)
      return
    }

    setIsTranslating(params.currentId, true)
    const contextDocumentOverride = await resolveAutoContextDocument(params.currentId, params.basicSettingsId)
    if (contextDocumentOverride === null) {
      setIsTranslating(params.currentId, false)
      return
    }

    if (!useTranslationStore.getState().isTranslatingSet.has(params.currentId)) return
    await handleStart({ ...params, contextDocumentOverride })
  }

  const handleStop = (currentId: string) => {
    const ownedExtractionId = autoCreatedExtractionByTranslationRef.current.get(currentId)
    if (ownedExtractionId) {
      stopExtraction(ownedExtractionId)
    }
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
    handleStart: handleStartWithAutoContext,
    handleStop,
    generateSubtitleContent,
  }
}
