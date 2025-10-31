"use client"

import { useRef } from "react"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useExtractionHandler } from "@/hooks/use-extraction-handler"
import { BatchFile } from "@/types/batch"
import { toast } from "sonner"
import { getContent } from "@/lib/parser/parser"

interface UseBatchExtractionHandlerProps {
  basicSettingsId: string
  advancedSettingsId: string
  batchFiles: BatchFile[]
  isBatchExtracting: boolean
  state: {
    setActiveTab: (tab: string) => void
    setQueueSet: React.Dispatch<React.SetStateAction<Set<string>>>
  }
}

export default function useBatchExtractionHandler({
  basicSettingsId,
  advancedSettingsId,
  batchFiles,
  isBatchExtracting,
  state: { setActiveTab, setQueueSet },
}: UseBatchExtractionHandlerProps) {
  const queueAbortRef = useRef(false)
  const stopRequestedIdsRef = useRef<Set<string>>(new Set())

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)

  // Batch Settings Store
  const isUseSharedSettings = useBatchSettingsStore(state => !state.individualIds.has(currentProject?.id ?? ""))
  const concurrentExtractions = useBatchSettingsStore(state => state.concurrentMap[currentProject?.id ?? ""] ?? 3)
  const extractionMode = useBatchSettingsStore(state => state.extractionModeMap[currentProject?.id ?? ""] ?? "sequential")
  const getContextResult = useExtractionDataStore(state => state.getContextResult)
  const setPreviousContext = useExtractionDataStore(state => state.setPreviousContext)
  const setContextResult = useExtractionDataStore(state => state.setContextResult)

  // Extraction Data Store
  const extractionData = useExtractionDataStore((state) => state.data)

  // Extraction Store
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const setIsExtracting = useExtractionStore(state => state.setIsExtracting)

  // Other Hooks
  const { setHasChanges } = useUnsavedChanges()

  // Extraction hook
  const {
    handleStart: baseStartExtraction,
    handleStop: baseStopExtraction,
  } = useExtractionHandler({
    setActiveTab,
    isBatch: true,
    onSuccessTranslation: ({ currentId }) => {
      if (stopRequestedIdsRef.current.has(currentId)) return
      try {
        const raw = getContextResult(currentId)
        const content = getContent(raw).trim()
        const hasFinished = /\s*<done>\s*$/.test(raw)
        if (!hasFinished && content.length > 0) {
          const withMarker = raw ? `${raw}\n\n<done>` : "<done>"
          setContextResult(currentId, withMarker)
        }
      } catch (e) {
        console.error("Failed to append finished marker (batch):", e)
      }
    },
    onErrorTranslation: () => {
      // On first error: empty the queue and halt scheduling.
      // Do NOT stop currently running extractions.
      if (!queueAbortRef.current) {
        queueAbortRef.current = true
        setQueueSet(new Set())
        const runningNow = Array.from(useExtractionStore.getState().isExtractingSet)
        runningNow.forEach(id => stopRequestedIdsRef.current.add(id))
        if (extractionMode === "sequential") {
          const running = Array.from(useExtractionStore.getState().isExtractingSet)
          running.forEach(id => baseStopExtraction(id))
          toast.error("Encountered an error. Stopped all extractions")
        } else {
          toast.error("Encountered an error. Halting queue; running extractions will finish")
        }
      }
    },
  })

  const handleStartBatchExtraction = () => {
    if (extractionMode === "sequential") {
      sequentialExtraction()
    } else {
      independentExtraction()
    }
  }

  const handleContinueBatchExtraction = () => {
    if (extractionMode === "sequential") {
      sequentialContinue()
    } else {
      independentContinue()
    }
  }

  /**
   * Independent extraction: process files without sharing context.
   * For each file, extract without using previous context.
   */
  const independentExtraction = () => {
    if (batchFiles.length === 0 || isBatchExtracting) return

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 300)

    queueAbortRef.current = false
    stopRequestedIdsRef.current.clear()
    setHasChanges(true)

    const ids = batchFiles
      .filter(f => f.status !== "done")
      .map(f => f.id)
      .filter(id => !isExtractingSet.has(id))

    if (ids.length === 0) return

    setQueueSet(new Set(ids.slice(concurrentExtractions)))

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

      if (isExtractingSet.has(id)) {
        launch()
        return
      }

      setQueueSet(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      active++
      handleStartExtraction(id).finally(() => {
        setIsExtracting(id, false) // ensure cleanup in case inner handler was interrupted
        active--
        launch()
      })
    }

    for (let i = 0; i < concurrentExtractions && i < ids.length; i++) {
      launch()
    }
  }

  /**
   * Continue independently: only process files that are not done yet.
   */
  const independentContinue = () => {
    if (batchFiles.length === 0 || isBatchExtracting) return

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 300)

    queueAbortRef.current = false
    stopRequestedIdsRef.current.clear()
    setHasChanges(true)

    const ids = batchFiles
      .filter(f => f.status !== "done")
      .map(f => f.id)
      .filter(id => !isExtractingSet.has(id))

    if (ids.length === 0) return

    setQueueSet(new Set(ids.slice(concurrentExtractions)))

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

      if (isExtractingSet.has(id)) {
        launch()
        return
      }

      setQueueSet(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      active++
      handleStartExtraction(id).finally(() => {
        setIsExtracting(id, false)
        active--
        launch()
      })
    }

    for (let i = 0; i < concurrentExtractions && i < ids.length; i++) {
      launch()
    }
  }

  /**
   * Sequential extraction: process files one-by-one.
   * For each file (except the first), set its previousContext to the
   * previous file's contextResult, then start extraction and wait until it finishes.
   */
  const sequentialExtraction = async () => {
    if (batchFiles.length === 0 || isBatchExtracting) return

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 300)

    queueAbortRef.current = false
    stopRequestedIdsRef.current.clear()
    setHasChanges(true)

    const ids = batchFiles
      .filter((f) => f.status !== "done")
      .map((f) => f.id)
      .filter((id) => !isExtractingSet.has(id))

    if (ids.length === 0) return

    // For sequential, show the queue for remaining items (excluding the first)
    setQueueSet(new Set(ids.slice(1)))

    // TODO: Use the immediate previous file (if any) to seed previousContext, just like in sequentialContinue

    let prevId: string | null = null

    for (let i = 0; i < ids.length; i++) {
      if (queueAbortRef.current) {
        setQueueSet(new Set())
        return
      }

      const currentId = ids[i]

      // Set previousContext from previous file's contextResult
      if (prevId) {
        const prevContext = getContent(getContextResult(prevId)).replace(/\s*<done>\s*$/, "").trim()
        setPreviousContext(currentId, prevContext)
      }

      try {
        await handleStartExtraction(currentId)
      } finally {
        setIsExtracting(currentId, false) // ensure cleanup
      }

      // Remove the next id from queue, since we are moving on
      setQueueSet((prev) => {
        const next = new Set(prev)
        // at the end of this iteration, the next item to process is ids[i+1]
        const upcoming = ids[i + 1]
        if (upcoming) next.delete(upcoming)
        return next
      })

      prevId = currentId
    }

    // Finished all
    setQueueSet(new Set())
  }

  /**
   * Continue sequentially: start from the first file that isn't done yet,
   * using the nearest previous done file as previousContext seed.
   */
  const sequentialContinue = async () => {
    if (batchFiles.length === 0 || isBatchExtracting) return

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 300)

    queueAbortRef.current = false
    stopRequestedIdsRef.current.clear()
    setHasChanges(true)

    const firstIdx = batchFiles.findIndex(f => f.status !== "done")
    if (firstIdx === -1) return

    const continueIds = batchFiles
      .slice(firstIdx)
      .filter(f => f.status !== "done")
      .map(f => f.id)
      .filter(id => !isExtractingSet.has(id))

    if (continueIds.length === 0) return

    // Queue shows all but the first item to process
    setQueueSet(new Set(continueIds.slice(1)))

    const batchFileIdToIndexMap = new Map(batchFiles.map((f, i) => [f.id, i]))

    for (let i = 0; i < continueIds.length; i++) {
      if (queueAbortRef.current) {
        setQueueSet(new Set())
        return
      }

      const currentId = continueIds[i]
      const currentIndex = batchFileIdToIndexMap.get(currentId)

      // Always set previousContext from the immediate previous file's contextResult when available
      if (currentIndex !== undefined && currentIndex > 0) {
        const prevId = batchFiles[currentIndex - 1].id
        const prevContext = getContent(getContextResult(prevId)).replace(/\s*<done>\s*$/, "").trim()
        setPreviousContext(currentId, prevContext)
      }

      try {
        await handleStartExtraction(currentId)
      } finally {
        setIsExtracting(currentId, false)
      }

      // Remove next id from queue (we are moving on)
      setQueueSet(prev => {
        const next = new Set(prev)
        const upcoming = continueIds[i + 1]
        if (upcoming) next.delete(upcoming)
        return next
      })
    }

    setQueueSet(new Set())
  }

  const handleStopBatchExtraction = () => {
    queueAbortRef.current = true
    setQueueSet(new Set())
    const runningIds = Array.from(isExtractingSet)
    runningIds.forEach(id => stopRequestedIdsRef.current.add(id))
    batchFiles.forEach(f => baseStopExtraction(f.id))
  }

  const handleStartExtraction = async (
    currentId: string,
  ) => {
    // Delegate to centralized extraction handler
    const bsIdToUse = isUseSharedSettings
      ? basicSettingsId
      : (extractionData[currentId]?.basicSettingsId || basicSettingsId)

    const adsIdToUse = isUseSharedSettings
      ? advancedSettingsId
      : (extractionData[currentId]?.advancedSettingsId || advancedSettingsId)

    await baseStartExtraction(
      currentId,
      bsIdToUse,
      adsIdToUse,
    )
  }

  return {
    handleStartBatchExtraction,
    handleContinueBatchExtraction,
    handleStopBatchExtraction,
  }
}
