import { create } from "zustand"

interface BatchSettingsStore {
  individualIds: Set<string>
  concurrentMap: Record<string, number>
  extractionModeMap: Record<string, "independent" | "sequential">

  getIsUseSharedSettings: (projectId: string | null | undefined) => boolean
  getConcurrent: (projectId: string | null | undefined) => number
  getExtractionMode: (projectId: string | null | undefined) => "independent" | "sequential"

  setUseSharedSettings: (projectId: string, useShared: boolean) => void
  setConcurrentTranslations: (projectId: string, value: number) => void
  setExtractionMode: (projectId: string, mode: "independent" | "sequential") => void
}

export const useBatchSettingsStore = create<BatchSettingsStore>((set, get) => ({
  individualIds: new Set<string>(),
  concurrentMap: {} as Record<string, number>,
  extractionModeMap: {} as Record<string, "independent" | "sequential">,
  getIsUseSharedSettings: (projectId) => !get().individualIds.has(projectId ?? ""),
  getConcurrent: (projectId) => get().concurrentMap[projectId ?? ""] ?? 3,
  getExtractionMode: (projectId) => get().extractionModeMap[projectId ?? ""] ?? "sequential",
  setUseSharedSettings: (projectId, useShared) =>
    set((state) => {
      const newSet = new Set(state.individualIds)
      if (useShared) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return { individualIds: newSet }
    }),
  setConcurrentTranslations: (projectId, value) =>
    set((state) => ({ concurrentMap: { ...state.concurrentMap, [projectId]: value } })),
  setExtractionMode: (projectId, mode) =>
    set((state) => ({ extractionModeMap: { ...state.extractionModeMap, [projectId]: mode } })),
}))
