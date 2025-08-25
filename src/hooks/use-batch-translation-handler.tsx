"use client"

import { useRef } from "react"
import { SubtitleType } from "@/types/subtitles"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { toast } from "sonner"
import { useSessionStore } from "@/stores/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { mergeIntervalsWithGap } from "@/lib/subtitles/utils/merge-intervals-w-gap"
import { countUntranslatedLines } from "@/lib/subtitles/utils/count-untranslated"
import { UserCreditData } from "@/types/user"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { useQuery } from "@tanstack/react-query"
import { useTranslationHandler } from "@/hooks/use-translation-handler"
import { BatchFile } from "@/types/batch"

interface UseBatchTranslationHandlerProps {
  basicSettingsId: string
  advancedSettingsId: string
  batchFiles: BatchFile[]
  isBatchTranslating: boolean
  state: {
    toType: SubtitleType | "no-change"
    setIsRestartTranslationDialogOpen: (open: boolean) => void
    setIsContinueTranslationDialogOpen: (open: boolean) => void
    setActiveTab: (tab: string) => void
    setQueueSet: React.Dispatch<React.SetStateAction<Set<string>>>
  }
}

export default function useBatchTranslationHandler({
  basicSettingsId,
  advancedSettingsId,
  batchFiles,
  isBatchTranslating,
  state: {
    toType,
    setIsRestartTranslationDialogOpen,
    setIsContinueTranslationDialogOpen,
    setActiveTab,
    setQueueSet,
  },
}: UseBatchTranslationHandlerProps) {
  const queueAbortRef = useRef(false)
  const errorCountRef = useRef(0)

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)

  // Batch Settings Store
  const isUseSharedSettings = useBatchSettingsStore(state => !state.individualIds.has(currentProject?.id ?? ""))
  const concurrentTranslations = useBatchSettingsStore(state => state.concurrentMap[currentProject?.id ?? ""] ?? 3)

  // Translation Data Store
  const translationData = useTranslationDataStore((state) => state.data)
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)

  // Translation Store
  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const setIsTranslating = useTranslationStore((state) => state.setIsTranslating)

  // Session Store
  const session = useSessionStore((state) => state.session)

  // Other Hooks
  const { setHasChanges } = useUnsavedChanges()

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
      handleStartTranslation(id).finally(() => {
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
    batchFiles.forEach(f => baseStopTranslation(f.id))
  }

  const handleStartTranslation = async (
    currentId: string,
    overrideStartIndexParam?: number,
    overrideEndIndexParam?: number,
    isContinuation?: boolean
  ) => {
    // Delegate to centralized translation handler
    const bsIdToUse = isUseSharedSettings
      ? basicSettingsId
      : (translationData[currentId]?.basicSettingsId || basicSettingsId)

    const adsIdToUse = isUseSharedSettings
      ? advancedSettingsId
      : (translationData[currentId]?.advancedSettingsId || advancedSettingsId)

    await baseStartTranslation({
      currentId,
      basicSettingsId: bsIdToUse,
      advancedSettingsId: adsIdToUse,
      overrideStartIndexParam,
      overrideEndIndexParam,
      isContinuation
    })
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

  return {
    handleStartBatchTranslation,
    handleContinueBatchTranslation,
    handleStopBatchTranslation,
    generateSubtitleContent,
  }
}
