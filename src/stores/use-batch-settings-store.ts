import { create } from "zustand"

interface BatchSettingsStore {
  /**
   * Set of batch project IDs that are in individual-settings mode
   * (i.e. NOT using shared batch settings).
   */
  individualIds: Set<string>
  /** Concurrent translation count per batch project */
  concurrentMap: Record<string, number>
  /** Extraction mode per batch project */
  extractionModeMap: Record<string, "independent" | "sequential">

  /**
   * Enable/disable shared settings for a given batch project.
   * If `useShared` is false the ID is placed into `individualIds`.
   */
  setUseSharedSettings: (projectId: string, useShared: boolean) => void
  setConcurrentTranslations: (projectId: string, value: number) => void
  setExtractionMode: (projectId: string, mode: "independent" | "sequential") => void
}

export const useBatchSettingsStore = create<BatchSettingsStore>((set) => ({
  individualIds: new Set<string>(),
  concurrentMap: {} as Record<string, number>,
  extractionModeMap: {} as Record<string, "independent" | "sequential">,
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
