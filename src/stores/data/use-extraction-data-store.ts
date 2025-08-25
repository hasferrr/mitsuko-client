import { create } from "zustand"
import { Extraction, BasicSettings, AdvancedSettings } from "@/types/project"
import {
  updateExtraction as updateDB,
  createExtraction as createDB,
  getExtraction as getDB,
  deleteExtraction as deleteDB,
} from "@/lib/db/extraction"
import { getBasicSettings, getAdvancedSettings } from "@/lib/db/settings"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"

export interface ExtractionDataStore {
  currentId: string | null
  data: Record<string, Extraction>
  // CRUD methods
  createExtractionDb: (
    projectId: string,
    data: Pick<Extraction, "title" | "episodeNumber" | "subtitleContent" | "previousContext" | "contextResult">,
    basicSettingsData: Partial<Omit<BasicSettings, "id" | "createdAt" | "updatedAt">>,
    advancedSettingsData: Partial<Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Extraction>
  getExtractionDb: (extractionId: string) => Promise<Extraction | undefined>
  updateExtractionDb: (extractionId: string, changes: Partial<Pick<Extraction, "title" | "episodeNumber" | "subtitleContent" | "previousContext">>) => Promise<Extraction>
  deleteExtractionDb: (projectId: string, extractionId: string) => Promise<void>
  // getters
  getTitle: () => string
  getEpisodeNumber: () => string
  getSubtitleContent: () => string
  getPreviousContext: () => string
  getContextResult: () => string
  // setters and other methods
  setCurrentId: (id: string | null) => void
  setTitle: (id: string, title: string) => void
  setEpisodeNumber: (id: string, episodeNumber: string) => void
  setSubtitleContent: (id: string, subtitleContent: string) => void
  setPreviousContext: (id: string, previousContext: string) => void
  setContextResult: (id: string, contextResult: string) => void
  // data manipulation methods
  mutateData: <T extends keyof Extraction>(id: string, key: T, value: Extraction[T]) => void
  mutateDataNoRender: <T extends keyof Extraction>(id: string, key: T, value: Extraction[T]) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Extraction) => void
  removeData: (id: string) => void
}

export const useExtractionDataStore = create<ExtractionDataStore>((set, get) => ({
  currentId: null,
  data: {},
  // CRUD methods
  createExtractionDb: async (projectId, data, basicSettingsData, advancedSettingsData) => {
    const extraction = await createDB(projectId, data, basicSettingsData, advancedSettingsData)
    set(state => ({ data: { ...state.data, [extraction.id]: extraction } }))

    // upsert associated settings into stores
    const settingsStore = useSettingsStore.getState()
    const advancedSettingsStore = useAdvancedSettingsStore.getState()
    const bs = await getBasicSettings(extraction.basicSettingsId)
    if (bs) settingsStore.upsertData(bs.id, bs)
    const ads = await getAdvancedSettings(extraction.advancedSettingsId)
    if (ads) advancedSettingsStore.upsertData(ads.id, ads)

    return extraction
  },
  getExtractionDb: async (extractionId) => {
    const extraction = await getDB(extractionId)
    if (extraction) {
      set(state => ({ data: { ...state.data, [extractionId]: extraction } }))
    }
    return extraction
  },
  updateExtractionDb: async (extractionId, changes) => {
    const extraction = await updateDB(extractionId, changes)
    set(state => ({ data: { ...state.data, [extractionId]: extraction } }))
    return extraction
  },
  deleteExtractionDb: async (projectId, extractionId) => {
    await deleteDB(projectId, extractionId)
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
  getTitle: () => {
    const id = get().currentId
    return id ? get().data[id]?.title ?? "" : ""
  },
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
  setTitle: (id: string, title: string) => {
    get().mutateData(id, "title", title)
  },
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
    if (get().currentId === id) {
      get().mutateData(id, "contextResult", contextResult)
    } else {
      get().mutateDataNoRender(id, "contextResult", contextResult)
    }
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
  mutateDataNoRender: (id, key, value) => {
    const data = get().data[id]
    if (!data) return
    data[key] = value
  },
  saveData: async (id) => {
    const extraction = get().data[id]
    if (!extraction) {
      console.error("Extraction not found in store")
      return
    }
    try {
      const result = await updateDB(id, extraction)
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
