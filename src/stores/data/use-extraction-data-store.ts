import { create } from "zustand"
import { Extraction, ExtractionStatus, Settings } from "@/types/project"
import {
  ExtractionCreateInput,
  updateExtraction as updateDB,
  createExtraction as createDB,
  getExtraction as getDB,
  getExtractions as getBulkDB,
  deleteExtraction as deleteDB,
  moveExtraction as moveDB,
} from "@/lib/db/extraction"
import { getSettings } from "@/lib/db/settings"
import { getProject } from "@/lib/db/project"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { DEFAULT_EXTRACTION_SETTINGS } from "@/constants/default"
import { GLOBAL_EXTRACTION_SETTINGS_ID } from "@/constants/global-settings"

export interface ExtractionDataStore {
  currentId: string | null
  data: Record<string, Extraction>
  // CRUD methods
  createExtractionDb: (
    projectId: string,
    data: ExtractionCreateInput,
    settingsData?: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Extraction>
  getExtractionDb: (extractionId: string, skipStoreUpdate?: boolean) => Promise<Extraction | undefined>
  getExtractionsDb: (extractionIds: string[]) => Promise<Extraction[]>
  updateExtractionDb: (extractionId: string, changes: Partial<Extraction>) => Promise<Extraction>
  deleteExtractionDb: (projectId: string, extractionId: string) => Promise<void>
  moveExtractionDb: (sourceProjectId: string, targetProjectId: string, extractionId: string) => Promise<void>
  // getters
  getTitle: (id: string) => string
  getEpisodeNumber: (id: string) => string
  getSubtitleContent: (id: string) => string
  getPreviousContext: (id: string) => string
  getContextResult: (id: string) => string
  // setters and other methods
  setCurrentId: (id: string | null) => void
  setTitle: (id: string, title: string) => void
  setEpisodeNumber: (id: string, episodeNumber: string) => void
  setSubtitleContent: (id: string, subtitleContent: string) => void
  setPreviousContext: (id: string, previousContext: string) => void
  setContextResult: (id: string, contextResult: string) => void
  setStatus: (id: string, status: ExtractionStatus) => void
  setCompletedAt: (id: string, completedAt: Date | null) => void
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
  createExtractionDb: async (projectId, data, settingsData) => {
    let settingsInput = settingsData
    if (settingsInput === undefined) {
      const project = await getProject(projectId)
      if (!project) throw new Error('Project not found')

      const settingsId = (project.isBatch || project.isDefaultExtractionEnabled)
        ? project.defaultExtractionSettingsId
        : GLOBAL_EXTRACTION_SETTINGS_ID
      const inherited = await getSettings(settingsId)
      const base = inherited ?? DEFAULT_EXTRACTION_SETTINGS
      settingsInput = useSettingsStore.getState().applyModelDefaults(base, base.modelDetail)
    }

    const extraction = await createDB(projectId, data, settingsInput ?? {})
    set(state => ({ data: { ...state.data, [extraction.id]: extraction } }))

    // upsert associated settings into stores
    const createdSettings = await getSettings(extraction.settingsId)
    if (createdSettings) useSettingsStore.getState().upsertData(createdSettings.id, createdSettings)

    return extraction
  },
  getExtractionDb: async (extractionId, skipStoreUpdate) => {
    const extraction = await getDB(extractionId)
    if (extraction && !skipStoreUpdate) {
      set(state => ({ data: { ...state.data, [extractionId]: extraction } }))
    }
    return extraction
  },
  updateExtractionDb: async (extractionId, changes) => {
    const extraction = await updateDB(extractionId, changes)
    set(state => ({ data: { ...state.data, [extractionId]: extraction } }))
    return extraction
  },
  getExtractionsDb: async (extractionIds) => {
    if (extractionIds.length === 0) return []
    const found = await getBulkDB(extractionIds)
    if (found.length) {
      set(state => ({
        data: {
          ...state.data,
          ...Object.fromEntries(found.map(e => [e.id, e]))
        }
      }))
    }
    return found
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
  moveExtractionDb: async (sourceProjectId, targetProjectId, extractionId) => {
    await moveDB(sourceProjectId, targetProjectId, extractionId)
    const data = get().data[extractionId]
    if (data) {
      set(state => ({
        data: { ...state.data, [extractionId]: { ...data, projectId: targetProjectId, updatedAt: new Date() } }
      }))
    }
  },
  // getters implementation
  getTitle: (id: string) => {
    return get().data[id]?.title ?? ""
  },
  getEpisodeNumber: (id: string) => {
    return get().data[id]?.episodeNumber ?? ""
  },
  getSubtitleContent: (id: string) => {
    return get().data[id]?.subtitleContent ?? ""
  },
  getPreviousContext: (id: string) => {
    return get().data[id]?.previousContext ?? ""
  },
  getContextResult: (id: string) => {
    return get().data[id]?.contextResult ?? ""
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
  setStatus: (id, status) => {
    get().mutateData(id, "status", status)
  },
  setCompletedAt: (id, completedAt) => {
    get().mutateData(id, "completedAt", completedAt)
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
