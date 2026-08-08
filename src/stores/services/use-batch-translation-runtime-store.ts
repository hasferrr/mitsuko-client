import { create } from "zustand"
import { BatchTranslationStage } from "@/types/batch"

type Updater<T> = T | ((previous: T) => T)

export interface BatchTranslationRunControl {
  abortController: AbortController | null
  currentExtractionId: string | null
  currentExtractionRunToken: number | null
  queueAborted: boolean
  runToken: number
  wakeTranslationWaiters: (() => void) | null
}

interface BatchTranslationRuntimeStore {
  queueSetMap: Record<string, Set<string>>
  stageMap: Record<string, Record<string, BatchTranslationStage>>
  runControlMap: Record<string, BatchTranslationRunControl>
  setQueueSet: (projectId: string, value: Updater<Set<string>>) => void
  setStageMap: (
    projectId: string,
    value: Updater<Record<string, BatchTranslationStage>>,
  ) => void
  beginRun: (projectId: string) => {
    control: BatchTranslationRunControl
    runToken: number
    signal: AbortSignal
  }
  stopRun: (projectId: string) => { currentExtractionId: string | null } | null
}

export const EMPTY_BATCH_TRANSLATION_QUEUE = new Set<string>()
export const EMPTY_BATCH_TRANSLATION_STAGE_MAP: Record<string, BatchTranslationStage> = {}

export const useBatchTranslationRuntimeStore = create<BatchTranslationRuntimeStore>((set, get) => {
  const getOrCreateRunControl = (projectId: string) => {
    const existing = get().runControlMap[projectId]
    if (existing) return existing

    const control: BatchTranslationRunControl = {
      abortController: null,
      currentExtractionId: null,
      currentExtractionRunToken: null,
      queueAborted: false,
      runToken: 0,
      wakeTranslationWaiters: null,
    }
    set(state => ({ runControlMap: { ...state.runControlMap, [projectId]: control } }))
    return control
  }

  return {
    queueSetMap: {},
    stageMap: {},
    runControlMap: {},
    setQueueSet: (projectId, value) => set((state) => {
      const previous = state.queueSetMap[projectId] ?? EMPTY_BATCH_TRANSLATION_QUEUE
      const next = typeof value === "function" ? value(previous) : value
      return { queueSetMap: { ...state.queueSetMap, [projectId]: next } }
    }),
    setStageMap: (projectId, value) => set((state) => {
      const previous = state.stageMap[projectId] ?? EMPTY_BATCH_TRANSLATION_STAGE_MAP
      const next = typeof value === "function" ? value(previous) : value
      return { stageMap: { ...state.stageMap, [projectId]: next } }
    }),
    beginRun: (projectId) => {
      const control = getOrCreateRunControl(projectId)
      control.abortController?.abort()
      control.wakeTranslationWaiters?.()
      control.abortController = new AbortController()
      control.currentExtractionId = null
      control.currentExtractionRunToken = null
      control.queueAborted = false
      control.runToken += 1
      control.wakeTranslationWaiters = null
      return {
        control,
        runToken: control.runToken,
        signal: control.abortController.signal,
      }
    },
    stopRun: (projectId) => {
      const control = get().runControlMap[projectId]
      if (!control) return null

      const currentExtractionId = control.currentExtractionId
      control.abortController?.abort()
      control.abortController = null
      control.queueAborted = true
      control.runToken += 1
      control.wakeTranslationWaiters?.()
      control.wakeTranslationWaiters = null
      control.currentExtractionId = null
      control.currentExtractionRunToken = null
      return { currentExtractionId }
    },
  }
})
