import { create } from "zustand"
import { Extraction } from "@/types/project"
import { updateExtraction, createExtraction, getExtraction, deleteExtraction } from "@/lib/db/extraction"

export interface ExtractionDataStore {
  currentId: string | null
  data: Record<string, Extraction>
  // CRUD methods
  createExtractionDb: (projectId: string, data: Pick<Extraction, "episodeNumber" | "subtitleContent" | "previousContext" | "contextResult">) => Promise<Extraction>
  getExtractionDb: (projectId: string, extractionId: string) => Promise<Extraction | undefined>
  updateExtractionDb: (extractionId: string, changes: Partial<Pick<Extraction, "episodeNumber" | "subtitleContent" | "previousContext">>) => Promise<Extraction>
  deleteExtractionDb: (projectId: string, extractionId: string) => Promise<void>
  // getters
  getEpisodeNumber: () => string
  getSubtitleContent: () => string
  getPreviousContext: () => string
  getContextResult: () => string
  // setters and other methods
  setCurrentId: (id: string | null) => void
  setEpisodeNumber: (id: string, episodeNumber: string) => void
  setSubtitleContent: (id: string, subtitleContent: string) => void
  setPreviousContext: (id: string, previousContext: string) => void
  setContextResult: (id: string, contextResult: string) => void
  // data manipulation methods
  mutateData: <T extends keyof Extraction>(id: string, key: T, value: Extraction[T]) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Extraction) => void
  removeData: (id: string) => void
}

export const useExtractionDataStore = create<ExtractionDataStore>((set, get) => ({
  currentId: null,
  data: {},
  // CRUD methods
  createExtractionDb: async (projectId, data) => {
    const extraction = await createExtraction(projectId, data)
    set(state => ({ data: { ...state.data, [extraction.id]: extraction } }))
    return extraction
  },
  getExtractionDb: async (projectId, extractionId) => {
    const extraction = await getExtraction(projectId, extractionId)
    if (extraction) {
      set(state => ({ data: { ...state.data, [extractionId]: extraction } }))
    }
    return extraction
  },
  updateExtractionDb: async (extractionId, changes) => {
    const extraction = await updateExtraction(extractionId, changes)
    set(state => ({ data: { ...state.data, [extractionId]: extraction } }))
    return extraction
  },
  deleteExtractionDb: async (projectId, extractionId) => {
    await deleteExtraction(projectId, extractionId)
    set(state => {
      const newData = { ...state.data }
      delete newData[extractionId]
      return { data: newData }
    })
    if (get().currentId === extractionId) {
      set({ currentId: null })
    }
  },
  // getters implementation
  getEpisodeNumber: () => {
    const id = get().currentId
    return id ? get().data[id]?.episodeNumber : ""
  },
  getSubtitleContent: () => {
    const id = get().currentId
    return id ? get().data[id]?.subtitleContent : ""
  },
  getPreviousContext: () => {
    const id = get().currentId
    return id ? get().data[id]?.previousContext : ""
  },
  getContextResult: () => {
    const id = get().currentId
    return id ? get().data[id]?.contextResult : ""
  },

  // existing methods
  setCurrentId: (id) => set({ currentId: id }),
  setEpisodeNumber: (id, episodeNumber) => {
    get().mutateData(id, "episodeNumber", episodeNumber)
  },
  setSubtitleContent: (id, subtitleContent) => {
    get().mutateData(id, "subtitleContent", subtitleContent)
  },
  setPreviousContext: (id, previousContext) => {
    get().mutateData(id, "previousContext", previousContext)
  },
  setContextResult: (id, contextResult) => {
    get().mutateData(id, "contextResult", contextResult)
  },

  // data manipulation methods
  mutateData: (id, key, value) => {
    set(state => {
      const data = state.data[id]
      if (!data) return state
      return {
        ...state,
        data: {
          ...state.data,
          [id]: {
            ...data,
            [key]: value
          }
        }
      }
    })
  },
  saveData: async (id) => {
    const extraction = get().data[id]
    if (!extraction) {
      console.error("Extraction not found in store")
      return
    }
    try {
      const result = await updateExtraction(id, extraction)
      set({ data: { ...get().data, [id]: result } })
    } catch (error) {
      console.error("Failed to save extraction data:", error)
    }
  },
  upsertData: (id, value) => {
    set(state => ({ data: { ...state.data, [id]: value } }))
  },
  removeData: (id) => {
    set(state => {
      const newData = { ...state.data }
      delete newData[id]
      return { data: newData }
    })
    if (get().currentId === id) {
      set({ currentId: null })
    }
  }
}))
