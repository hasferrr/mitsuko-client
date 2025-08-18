import { create } from "zustand"

interface BatchSettingsStore {
  /**
   * Set of batch project IDs that are in individual-settings mode
   * (i.e. NOT using shared batch settings).
   */
  individualIds: Set<string>
  /** Concurrent translation count per batch project */
  concurrentMap: Record<string, number>

  /**
   * Enable/disable shared settings for a given batch project.
   * If `useShared` is false the ID is placed into `individualIds`.
   */
  setUseSharedSettings: (projectId: string, useShared: boolean) => void
  setConcurrentTranslations: (projectId: string, value: number) => void
}

export const useBatchSettingsStore = create<BatchSettingsStore>((set) => ({
  individualIds: new Set<string>(),
  concurrentMap: {} as Record<string, number>,
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
    set((state) => ({ concurrentMap: { ...state.concurrentMap, [projectId]: value } }))
}))
