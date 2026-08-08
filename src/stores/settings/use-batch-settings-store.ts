import { create } from "zustand"

interface BatchSettingsStore {
  concurrentMap: Record<string, number>
  extractionModeMap: Record<string, "independent" | "sequential">

  getConcurrent: (projectId: string | null | undefined) => number
  getExtractionMode: (projectId: string | null | undefined) => "independent" | "sequential"

  setConcurrentTranslations: (projectId: string, value: number) => void
  setExtractionMode: (projectId: string, mode: "independent" | "sequential") => void
}

export const useBatchSettingsStore = create<BatchSettingsStore>((set, get) => ({
  concurrentMap: {} as Record<string, number>,
  extractionModeMap: {} as Record<string, "independent" | "sequential">,
  getConcurrent: (projectId) => get().concurrentMap[projectId ?? ""] ?? 3,
  getExtractionMode: (projectId) => get().extractionModeMap[projectId ?? ""] ?? "sequential",
  setConcurrentTranslations: (projectId, value) =>
    set((state) => ({ concurrentMap: { ...state.concurrentMap, [projectId]: value } })),
  setExtractionMode: (projectId, mode) =>
    set((state) => ({ extractionModeMap: { ...state.extractionModeMap, [projectId]: mode } })),
}))
