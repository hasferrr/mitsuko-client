"use client"

import { useRef } from "react"
import { SubtitleType } from "@/types/subtitles"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useBatchSettingsStore } from "@/stores/settings/use-batch-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { mergeIntervalsWithGap } from "@/lib/subtitles/utils/merge-intervals-w-gap"
import { countUntranslatedLines } from "@/lib/subtitles/utils/count-untranslated"
import { UserCreditData } from "@/types/user"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { useQuery } from "@tanstack/react-query"
import { useTranslationHandler } from "@/hooks/handler/use-translation-handler"
import { useExtractionHandler } from "@/hooks/handler/use-extraction-handler"
import { BatchFile, BatchTranslationStage } from "@/types/batch"
import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import {
  type BatchAutoContextAction,
  buildBatchAutoContextPlan,
  findLinkedAutoContextExtraction,
  getBatchAutoContextAction,
  getRunningBatchAutoContextExtractionIds,
} from "@/lib/translation/batch-auto-context"
import {
  cleanExtractionContent,
  getAutoContextExtractionTitle,
  isExtractionUsable,
} from "@/lib/extraction/status"
import { combineAutoContext, getTranslationSubtitleContent } from "@/lib/translation/auto-context"

export interface BatchTranslationRunSummary {
  autoContextEnabled: boolean
  startingContextTitle: string | null
  createCount: number
  rerunCount: number
  reuseCount: number
  translationCount: number
}

interface UseBatchTranslationHandlerProps {
  settingsId: string
  batchFiles: BatchFile[]
  isBatchTranslating: boolean
  state: {
    toType: SubtitleType | "no-change"
    setIsRestartTranslationDialogOpen: (open: boolean) => void
    setIsContinueTranslationDialogOpen: (open: boolean) => void
    setActiveTab: (tab: string) => void
    setQueueSet: React.Dispatch<React.SetStateAction<Set<string>>>
    setAutoContextStageMap: React.Dispatch<React.SetStateAction<Record<string, BatchTranslationStage>>>
  }
}

export default function useBatchTranslationHandler({
  settingsId,
  batchFiles,
  isBatchTranslating,
  state: {
    toType,
    setIsRestartTranslationDialogOpen,
    setIsContinueTranslationDialogOpen,
    setActiveTab,
    setQueueSet,
    setAutoContextStageMap,
  },
}: UseBatchTranslationHandlerProps) {
  const queueAbortRef = useRef(false)
  const errorCountRef = useRef(0)
  const currentExtractionIdRef = useRef<string | null>(null)
  const currentExtractionRunTokenRef = useRef<number | null>(null)
  const wakeTranslationWaitersRef = useRef<(() => void) | null>(null)
  const batchRunTokenRef = useRef(0)
  const batchAbortControllerRef = useRef<AbortController | null>(null)

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)

  // Batch Settings Store
  const concurrentTranslations = useBatchSettingsStore(state => state.getConcurrent(currentProject?.id))

  // Translation Data Store
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)

  // Translation Store
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)

  // Session Store
  const session = useSessionStore((state) => state.session)

  // Other Hooks
  const { setHasChanges } = useUnsavedChanges()
  const scrollToTop = useScrollToTop()

  // Settings selectors
  const getModelDetail = useSettingsStore(state => state.getModelDetail)
  const getIsUseCustomModel = useSettingsStore(state => state.getIsUseCustomModel)

  // Lazy user data query
  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })

  // Translation hook
  const {
    handleStart: baseStartTranslation,
    handleStop: baseStopTranslation,
    generateSubtitleContent,
  } = useTranslationHandler({
    state: { toType, setActiveTab },
    options: {
      isBatch: true,
      onSuccessTranslation: () => {
        errorCountRef.current = Math.max(0, errorCountRef.current - 1)
      },
      onErrorTranslation: ({ isContinuation }) => {
        if (isContinuation) {
          errorCountRef.current += 1
          if (errorCountRef.current >= 5) {
            handleStopBatchTranslation()
            toast.error('Encountered 5 errors. Stopping batch translation')
          }
        }
      },
    }
  })

  const {
    handleStart: baseStartExtraction,
    handleStop: baseStopExtraction,
  } = useExtractionHandler({
    setActiveTab: () => {},
    isBatch: true,
  })

  const setAutoContextStage = (id: string, stage: BatchTranslationStage | null) => {
    setAutoContextStageMap(previous => {
      const next = { ...previous }
      if (stage) next[id] = stage
      else delete next[id]
      return next
    })
  }

  const removeFromQueue = (id: string) => {
    setQueueSet(previous => {
      const next = new Set(previous)
      next.delete(id)
      return next
    })
  }

  const refetchTranslationCredits = () => {
    const modelDetail = getModelDetail(settingsId)
    const isUseCustomModel = getIsUseCustomModel(settingsId)
    if (!isUseCustomModel && modelDetail?.isPaid) refetchUserData()
  }

  const isTranslationComplete = (id: string) => {
    const subtitles = useTranslationDataStore.getState().data[id]?.subtitles ?? []
    return subtitles.length > 0 && subtitles.every(subtitle => subtitle.translated.trim() !== "")
  }

  const loadBatchAutoContextData = async () => {
    if (!currentProject) return null
    const project = await useProjectStore.getState().getProjectDb(currentProject.id)
    if (!project) return null

    await useTranslationDataStore.getState().getTranslationsDb(project.translations)
    const extractionIds = project.batchAutoContextStartingExtractionId
      ? [...new Set([...project.extractions, project.batchAutoContextStartingExtractionId])]
      : project.extractions
    await useExtractionDataStore.getState().getExtractionsDb(extractionIds)
    return project
  }

  const getBatchRunSummary = async (
    isContinuation: boolean,
    regenerateAutoContext = false,
  ): Promise<BatchTranslationRunSummary | null> => {
    if (!currentProject) return null
    if (!currentProject.isBatchAutoContextEnabled) {
      return {
        autoContextEnabled: false,
        startingContextTitle: null,
        createCount: 0,
        rerunCount: 0,
        reuseCount: 0,
        translationCount: isContinuation
          ? batchFiles.filter(file => file.status !== "done").length
          : batchFiles.length,
      }
    }

    const project = await loadBatchAutoContextData()
    if (!project) {
      toast.error("Batch project was not found.")
      return null
    }

    const plan = buildBatchAutoContextPlan({
      projectId: project.id,
      translationIds: project.translations,
      translations: useTranslationDataStore.getState().data,
      extractions: useExtractionDataStore.getState().data,
      startingExtractionId: project.batchAutoContextStartingExtractionId,
      runningIds: useExtractionStore.getState().isExtractingSet,
      regenerate: regenerateAutoContext,
    })
    if (plan.startingContextProblem) {
      toast.error(plan.startingContextProblem)
      return null
    }

    const startingContext = project.batchAutoContextStartingExtractionId
      ? useExtractionDataStore.getState().data[project.batchAutoContextStartingExtractionId]
      : null
    return {
      autoContextEnabled: true,
      startingContextTitle: startingContext?.title || startingContext?.episodeNumber || null,
      createCount: plan.createCount,
      rerunCount: plan.rerunCount,
      reuseCount: plan.reuseCount,
      translationCount: isContinuation
        ? project.translations.filter(id => !isTranslationComplete(id)).length
        : project.translations.length,
    }
  }

  const handleStartTranslation = async (
    currentId: string,
    overrideStartIndexParam?: number,
    overrideEndIndexParam?: number,
    isContinuation?: boolean,
    contextDocumentOverride?: string,
    signal?: AbortSignal,
  ) => {
    await baseStartTranslation({
      currentId,
      settingsId,
      overrideStartIndexParam,
      overrideEndIndexParam,
      isContinuation,
      contextDocumentOverride,
      signal,
    })
  }

  const runWithoutAutoContext = (isContinuation: boolean, signal: AbortSignal) => {
    const ids = batchFiles
      .map(file => file.id)
      .filter(id => !useTranslationStore.getState().isTranslatingSet.has(id))
    if (ids.length === 0) return

    setQueueSet(new Set(ids.slice(concurrentTranslations)))
    let index = 0
    let active = 0

    const launch = () => {
      if (signal.aborted || queueAbortRef.current || index >= ids.length) {
        if (active === 0) setQueueSet(new Set())
        return
      }

      const id = ids[index++]
      if (useTranslationStore.getState().isTranslatingSet.has(id)) {
        launch()
        return
      }
      removeFromQueue(id)

      active++
      const operation = isContinuation
        ? handleContinueTranslation(id, undefined, signal)
        : handleStartTranslation(id, undefined, undefined, false, undefined, signal)
      operation.finally(() => {
        setIsTranslating(id, false)
        refetchTranslationCredits()
        active--
        launch()
      })
    }

    for (let index = 0; index < concurrentTranslations && index < ids.length; index++) {
      launch()
    }
  }

  const runWithAutoContext = async (
    isContinuation: boolean,
    regenerateAutoContext: boolean,
    runToken: number,
    signal: AbortSignal,
  ) => {
    const project = await loadBatchAutoContextData()
    if (runToken !== batchRunTokenRef.current) return
    if (!project) {
      setQueueSet(new Set())
      setAutoContextStageMap({})
      toast.error("Batch project was not found.")
      return
    }

    const translationIds = project.translations.filter(id => !useTranslationStore.getState().isTranslatingSet.has(id))
    const translationStore = useTranslationDataStore.getState()
    const extractionStore = useExtractionDataStore.getState()
    const startingExtraction = project.batchAutoContextStartingExtractionId
      ? extractionStore.data[project.batchAutoContextStartingExtractionId]
      : null
    const plan = buildBatchAutoContextPlan({
      projectId: project.id,
      translationIds,
      translations: translationStore.data,
      extractions: extractionStore.data,
      startingExtractionId: project.batchAutoContextStartingExtractionId,
      runningIds: useExtractionStore.getState().isExtractingSet,
      regenerate: regenerateAutoContext,
    })
    if (plan.startingContextProblem) {
      setQueueSet(new Set())
      setAutoContextStageMap({})
      toast.error(plan.startingContextProblem)
      return
    }

    setQueueSet(new Set(translationIds))
    setAutoContextStageMap(Object.fromEntries(
      translationIds.map(id => [id, "waiting-context" as BatchTranslationStage]),
    ))

    let activeTranslations = 0
    let translationSchedulingHalted = false
    const slotWaiters: Array<() => void> = []
    const translationTasks: Array<Promise<void>> = []
    const wakeAllWaiters = () => {
      slotWaiters.splice(0).forEach(resolve => resolve())
    }
    wakeTranslationWaitersRef.current = wakeAllWaiters

    const acquireTranslationSlot = async () => {
      while (
        activeTranslations >= concurrentTranslations
        && !queueAbortRef.current
        && !translationSchedulingHalted
        && runToken === batchRunTokenRef.current
      ) {
        await new Promise<void>(resolve => slotWaiters.push(resolve))
      }
      if (
        queueAbortRef.current
        || translationSchedulingHalted
        || runToken !== batchRunTokenRef.current
      ) return false
      activeTranslations++
      return true
    }
    const releaseTranslationSlot = () => {
      activeTranslations = Math.max(0, activeTranslations - 1)
      slotWaiters.shift()?.()
    }

    const scheduleTranslation = (id: string, contextDocumentOverride: string) => {
      setAutoContextStage(id, "queued-translation")
      const task = (async () => {
        const acquired = await acquireTranslationSlot()
        if (!acquired) {
          if (runToken === batchRunTokenRef.current) {
            setAutoContextStage(id, null)
            removeFromQueue(id)
          }
          return
        }

        if (signal.aborted || runToken !== batchRunTokenRef.current) {
          releaseTranslationSlot()
          return
        }

        setAutoContextStage(id, "translating")
        removeFromQueue(id)
        try {
          if (isContinuation) {
            await handleContinueTranslation(id, contextDocumentOverride, signal)
          } else {
            await handleStartTranslation(id, undefined, undefined, false, contextDocumentOverride, signal)
          }
        } finally {
          if (runToken === batchRunTokenRef.current) {
            setIsTranslating(id, false)
            refetchTranslationCredits()
            setAutoContextStage(id, null)
          }
          releaseTranslationSlot()
        }
      })()
      translationTasks.push(task)
    }

    let previousExtraction = startingExtraction
    let upstreamChanged = false
    let failedTranslationId: string | null = null
    const preparedExtractionIds = new Set<string>()
    const previousIdByExtractionId = new Map<string, string | null>()

    for (const translationId of translationIds) {
      if (queueAbortRef.current || runToken !== batchRunTokenRef.current) break
      const translation = useTranslationDataStore.getState().data[translationId]
      if (!translation) continue

      const currentExtractions = useExtractionDataStore.getState().data
      let extraction = findLinkedAutoContextExtraction(
        translation,
        currentExtractions,
      )
      const isAlreadyPrepared = !!extraction && preparedExtractionIds.has(extraction.id)
      const action: BatchAutoContextAction = isAlreadyPrepared
        ? "reuse"
        : getBatchAutoContextAction({
            extraction,
            expectedPreviousExtraction: previousExtraction,
            recordedPreviousExtractionId: translation.autoContextPreviousExtractionId,
            projectId: project.id,
            runningIds: useExtractionStore.getState().isExtractingSet,
            upstreamChanged,
            regenerate: regenerateAutoContext,
          })
      const previousContext = previousExtraction
        ? cleanExtractionContent(previousExtraction.contextResult)
        : ""

      if (action === "create") {
        extraction = await useExtractionDataStore.getState().createExtractionDb(project.id, {
          title: getAutoContextExtractionTitle(translation.title),
          episodeNumber: translation.title,
          subtitleContent: getTranslationSubtitleContent(translation),
          previousContext,
          contextResult: "",
          status: "idle",
          completedAt: null,
        })
        if (runToken !== batchRunTokenRef.current) break
        try {
          await useProjectStore.getState().loadProjects()
        } catch {
          // Best-effort — extraction is already persisted and available in the data store
        }
      }

      if (!extraction) {
        failedTranslationId = translationId
        setAutoContextStage(translationId, "context-error")
        toast.error(`Failed to prepare Auto Context for ${translation.title}.`)
        break
      }

      const previousExtractionId = isAlreadyPrepared
        ? previousIdByExtractionId.get(extraction.id) ?? null
        : previousExtraction?.id ?? null
      await useTranslationDataStore.getState().updateTranslationDb(translationId, {
        autoContextMode: "use-existing",
        autoContextExtractionId: extraction.id,
        autoContextPreviousMode: previousExtractionId ? "selected" : "none",
        autoContextPreviousExtractionId: previousExtractionId,
      })
      if (runToken !== batchRunTokenRef.current) break

      if (action !== "reuse") {
        await useExtractionDataStore.getState().updateExtractionDb(extraction.id, {
          title: getAutoContextExtractionTitle(translation.title),
          episodeNumber: translation.title,
          subtitleContent: getTranslationSubtitleContent(translation),
          previousContext,
        })
        if (signal.aborted || runToken !== batchRunTokenRef.current) break
        setAutoContextStage(translationId, "extracting-context")
        currentExtractionIdRef.current = extraction.id
        currentExtractionRunTokenRef.current = runToken
        const success = await baseStartExtraction(extraction.id, extraction.settingsId, signal)
        if (currentExtractionRunTokenRef.current === runToken) {
          currentExtractionIdRef.current = null
          currentExtractionRunTokenRef.current = null
        }
        if (runToken !== batchRunTokenRef.current) break
        if (!success) {
          if (!queueAbortRef.current) {
            failedTranslationId = translationId
            setAutoContextStage(translationId, "context-error")
            toast.error(`Auto Context extraction failed for ${translation.title}. Later work was halted.`)
          }
          break
        }
        extraction = await useExtractionDataStore.getState().getExtractionDb(extraction.id) ?? extraction
      }

      if (!isExtractionUsable(extraction, project.id, useExtractionStore.getState().isExtractingSet)) {
        failedTranslationId = translationId
        setAutoContextStage(translationId, "context-error")
        toast.error(`Auto Context is not usable for ${translation.title}. Later work was halted.`)
        break
      }

      const shouldTranslate = !isContinuation || !isTranslationComplete(translationId)
      if (shouldTranslate) {
        scheduleTranslation(
          translationId,
          combineAutoContext(
            cleanExtractionContent(extraction.contextResult),
            useSettingsStore.getState().getContextDocument(settingsId),
          ),
        )
      } else {
        setAutoContextStage(translationId, null)
        removeFromQueue(translationId)
      }

      if (!preparedExtractionIds.has(extraction.id)) {
        preparedExtractionIds.add(extraction.id)
        previousIdByExtractionId.set(extraction.id, previousExtractionId)
      }
      previousExtraction = extraction
      upstreamChanged = upstreamChanged || action === "create"
    }

    if (runToken !== batchRunTokenRef.current) return

    if (failedTranslationId || queueAbortRef.current) {
      translationSchedulingHalted = true
      wakeAllWaiters()
      setAutoContextStageMap(previous => Object.fromEntries(
        Object.entries(previous).filter(([id, stage]) => {
          return stage === "translating" || (id === failedTranslationId && stage === "context-error")
        }),
      ))
      setQueueSet(new Set())
    }

    await Promise.allSettled(translationTasks)
    setQueueSet(new Set())
    setAutoContextStageMap(previous => Object.fromEntries(
      Object.entries(previous).filter(([, stage]) => stage === "context-error"),
    ))
    wakeTranslationWaitersRef.current = null
    if (currentExtractionRunTokenRef.current === runToken) {
      currentExtractionIdRef.current = null
      currentExtractionRunTokenRef.current = null
    }
  }

  const safelyRunWithAutoContext = async (
    isContinuation: boolean,
    regenerateAutoContext: boolean,
    runToken: number,
    signal: AbortSignal,
  ) => {
    try {
      await runWithAutoContext(isContinuation, regenerateAutoContext, runToken, signal)
    } catch (error) {
      if (runToken !== batchRunTokenRef.current) return
      console.error("Failed to run batch Auto Context", error)
      queueAbortRef.current = true
      wakeTranslationWaitersRef.current?.()
      setQueueSet(new Set())
      setAutoContextStageMap(previous => Object.fromEntries(
        Object.entries(previous).filter(([, stage]) => stage === "translating"),
      ))
      toast.error("Failed to prepare batch Auto Context. Later work was halted.")
    } finally {
      if (runToken === batchRunTokenRef.current) {
        wakeTranslationWaitersRef.current = null
        currentExtractionIdRef.current = null
        currentExtractionRunTokenRef.current = null
      }
    }
  }

  const prepareRun = () => {
    batchAbortControllerRef.current?.abort()
    batchAbortControllerRef.current = new AbortController()
    batchRunTokenRef.current += 1
    scrollToTop()
    queueAbortRef.current = false
    errorCountRef.current = 0
    setHasChanges(true)
    setAutoContextStageMap({})
    return {
      runToken: batchRunTokenRef.current,
      signal: batchAbortControllerRef.current.signal,
    }
  }

  const markAutoContextRunPreparing = () => {
    const ids = batchFiles.map(file => file.id)
    setQueueSet(new Set(ids))
    setAutoContextStageMap(Object.fromEntries(
      ids.map(id => [id, "waiting-context" as BatchTranslationStage]),
    ))
  }

  const handleStartBatchTranslation = (regenerateAutoContext = false) => {
    if (batchFiles.length === 0 || isBatchTranslating) return
    setIsRestartTranslationDialogOpen(false)
    const { runToken, signal } = prepareRun()
    if (currentProject?.isBatchAutoContextEnabled) {
      markAutoContextRunPreparing()
      void safelyRunWithAutoContext(false, regenerateAutoContext, runToken, signal)
    } else {
      runWithoutAutoContext(false, signal)
    }
  }

  const handleContinueBatchTranslation = () => {
    if (batchFiles.length === 0 || isBatchTranslating) return
    setIsContinueTranslationDialogOpen(false)
    const { runToken, signal } = prepareRun()
    if (currentProject?.isBatchAutoContextEnabled) {
      markAutoContextRunPreparing()
      void safelyRunWithAutoContext(true, false, runToken, signal)
    } else {
      runWithoutAutoContext(true, signal)
    }
  }

  const handleStopBatchTranslation = () => {
    batchAbortControllerRef.current?.abort()
    batchAbortControllerRef.current = null
    batchRunTokenRef.current += 1
    queueAbortRef.current = true
    wakeTranslationWaitersRef.current?.()
    setQueueSet(new Set())
    setAutoContextStageMap({})
    const runningAutoContextIds = currentProject?.isBatchAutoContextEnabled
      ? getRunningBatchAutoContextExtractionIds({
          translationIds: batchFiles.map(file => file.id),
          translations: useTranslationDataStore.getState().data,
          runningIds: useExtractionStore.getState().isExtractingSet,
        })
      : []
    if (currentExtractionIdRef.current) runningAutoContextIds.push(currentExtractionIdRef.current)
    new Set(runningAutoContextIds).forEach(id => void baseStopExtraction(id))
    currentExtractionIdRef.current = null
    currentExtractionRunTokenRef.current = null
    batchFiles.forEach(file => baseStopTranslation(file.id))
  }

  const handleContinueTranslation = async (
    currentId: string,
    contextDocumentOverride?: string,
    signal?: AbortSignal,
  ) => {
    const subtitles = useTranslationDataStore.getState().data[currentId]?.subtitles ?? []

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
      if (signal?.aborted || !useTranslationStore.getState().isTranslatingSet.has(currentId)) {
        console.log("Continue Translation: Operation stopped by user before processing a block.")
        break
      }

      const [startIdx, endIdx] = block
      console.log(`Continue Translation: Processing block from index ${startIdx} to ${endIdx}.`)

      try {
        await handleStartTranslation(currentId, startIdx, endIdx, true, contextDocumentOverride, signal)
        if (signal?.aborted || !useTranslationStore.getState().isTranslatingSet.has(currentId)) {
          console.log("Continue Translation: Operation stopped by user during processing of a block.")
          break
        }
      } catch (error) {
        console.error(`Continue Translation: Error processing block ${startIdx}-${endIdx}:`, error)
        break
      }
    }

    setIsTranslating(currentId, false)
  }

  return {
    handleStartBatchTranslation,
    handleContinueBatchTranslation,
    handleStopBatchTranslation,
    getBatchRunSummary,
    generateSubtitleContent,
  }
}
