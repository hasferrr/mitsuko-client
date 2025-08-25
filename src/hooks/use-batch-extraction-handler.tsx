"use client"

import { useRef } from "react"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useExtractionHandler } from "@/hooks/use-extraction-handler"
import { BatchFile } from "@/types/batch"

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

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)

  // Batch Settings Store
  const isUseSharedSettings = useBatchSettingsStore(state => !state.individualIds.has(currentProject?.id ?? ""))
  const concurrentExtractions = useBatchSettingsStore(state => state.concurrentMap[currentProject?.id ?? ""] ?? 3)

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
  })

  const handleStartBatchExtraction = () => {
    if (batchFiles.length === 0 || isBatchExtracting) return

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 300)

    queueAbortRef.current = false
    setHasChanges(true)

    const ids = batchFiles
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

  const handleStopBatchExtraction = () => {
    queueAbortRef.current = true
    setQueueSet(new Set())
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
    handleStopBatchExtraction,
  }
}
