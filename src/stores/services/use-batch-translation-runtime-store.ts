import { create } from "zustand"
import { BatchTranslationStage } from "@/types/batch"

type Updater<T> = T | ((previous: T) => T)

interface BatchTranslationRuntimeStore {
  queueSetMap: Record<string, Set<string>>
  stageMap: Record<string, Record<string, BatchTranslationStage>>
  setQueueSet: (projectId: string, value: Updater<Set<string>>) => void
  setStageMap: (
    projectId: string,
    value: Updater<Record<string, BatchTranslationStage>>,
  ) => void
}

export const EMPTY_BATCH_TRANSLATION_QUEUE = new Set<string>()
export const EMPTY_BATCH_TRANSLATION_STAGE_MAP: Record<string, BatchTranslationStage> = {}

export const useBatchTranslationRuntimeStore = create<BatchTranslationRuntimeStore>((set) => ({
  queueSetMap: {},
  stageMap: {},
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
}))
