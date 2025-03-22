import { create } from "zustand"
import { Extraction } from "@/types/project"
import { updateExtraction } from "@/lib/db/extraction"

interface ExtractionDataStore {
  currentId: string | null
  data: Record<string, Extraction>
  // getters
  getEpisodeNumber: () => string
  getSubtitleContent: () => string
  getPreviousContext: () => string
  getContextResult: () => string
  // setters and other methods
  setCurrentId: (id: string) => void
  setEpisodeNumber: (id: string, episodeNumber: string) => void
  setSubtitleContent: (id: string, subtitleContent: string) => void
  setPreviousContext: (id: string, previousContext: string) => void
  setContextResult: (id: string, contextResult: string) => void
  // data manipulation methods
  mutateData: (id: string, key: keyof Extraction, value: any) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Extraction) => void
  removeData: (id: string) => void
}

export const useExtractionDataStore = create<ExtractionDataStore>((set, get) => ({
  currentId: null,
  data: {},

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
  }
}))
