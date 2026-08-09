import { create } from "zustand"

interface BatchSettingsStore {
  concurrentMap: Record<string, number>
  extractionModeMap: Record<string, "independent" | "sequential">
  reuseCompletedAutoContextMap: Record<string, boolean>

  getConcurrent: (projectId: string | null | undefined) => number
  getExtractionMode: (projectId: string | null | undefined) => "independent" | "sequential"
  getReuseCompletedAutoContext: (projectId: string | null | undefined) => boolean

  setConcurrentTranslations: (projectId: string, value: number) => void
  setExtractionMode: (projectId: string, mode: "independent" | "sequential") => void
  setReuseCompletedAutoContext: (projectId: string, value: boolean) => void
}

export const useBatchSettingsStore = create<BatchSettingsStore>((set, get) => ({
  concurrentMap: {} as Record<string, number>,
  extractionModeMap: {} as Record<string, "independent" | "sequential">,
  reuseCompletedAutoContextMap: {} as Record<string, boolean>,
  getConcurrent: (projectId) => get().concurrentMap[projectId ?? ""] ?? 3,
  getExtractionMode: (projectId) => get().extractionModeMap[projectId ?? ""] ?? "sequential",
  getReuseCompletedAutoContext: (projectId) => get().reuseCompletedAutoContextMap[projectId ?? ""] ?? true,
  setConcurrentTranslations: (projectId, value) =>
    set((state) => ({ concurrentMap: { ...state.concurrentMap, [projectId]: value } })),
  setExtractionMode: (projectId, mode) =>
    set((state) => ({ extractionModeMap: { ...state.extractionModeMap, [projectId]: mode } })),
  setReuseCompletedAutoContext: (projectId, value) =>
    set((state) => ({
      reuseCompletedAutoContextMap: {
        ...state.reuseCompletedAutoContextMap,
        [projectId]: value,
      },
    })),
}))
