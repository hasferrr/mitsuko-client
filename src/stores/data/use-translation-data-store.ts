import { create } from "zustand"
import { AdvancedSettings, BasicSettings, Translation } from "@/types/project"
import { SubOnlyTranslated, SubtitleTranslated, Parsed } from "@/types/subtitles"
import { updateTranslation, createTranslation, getTranslation, deleteTranslation } from "@/lib/db/translation"

export interface TranslationDataStore {
  currentId: string | null
  data: Record<string, Translation>
  // CRUD methods
  createTranslationDb: (
    projectId: string,
    data: Pick<Translation, "title" | "subtitles" | "parsed">,
    basicSettingsData: Partial<Omit<BasicSettings, "id" | "createdAt" | "updatedAt">>,
    advancedSettingsData: Partial<Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Translation>
  getTranslationDb: (projectId: string, translationId: string) => Promise<Translation | undefined>
  updateTranslationDb: (translationId: string, changes: Partial<Pick<Translation, "title" | "subtitles" | "parsed">>) => Promise<Translation>
  deleteTranslationDb: (projectId: string, translationId: string) => Promise<void>
  // Existing methods
  setCurrentId: (id: string | null) => void
  mutateData: <T extends keyof Translation>(id: string, key: T, value: Translation[T]) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Translation) => void
  removeData: (id: string) => void
  // Subtitle methods
  setTitle: (id: string, title: string) => void
  setSubtitles: (id: string, subtitles: SubtitleTranslated[]) => void
  setParsed: (id: string, parsed: Parsed) => void
  resetParsed: (id: string) => void
  updateSubtitle: <T extends keyof SubtitleTranslated>(id: string, index: number, field: T, value: SubtitleTranslated[T]) => void
  // Response methods
  setResponse: (id: string, response: string) => void
  setJsonResponse: (id: string, jsonResponse: SubOnlyTranslated[]) => void
  appendJsonResponse: (id: string, arr: SubOnlyTranslated[]) => void
}

export const useTranslationDataStore = create<TranslationDataStore>((set, get) => ({
  currentId: null,
  data: {},
  // CRUD methods
  createTranslationDb: async (projectId, data, basicSettingsData, advancedSettingsData) => {
    const translation = await createTranslation(projectId, data, basicSettingsData, advancedSettingsData)
    set(state => ({ data: { ...state.data, [translation.id]: translation } }))
    return translation
  },
  getTranslationDb: async (projectId, translationId) => {
    const translation = await getTranslation(projectId, translationId)
    if (translation) {
      set(state => ({ data: { ...state.data, [translationId]: translation } }))
    }
    return translation
  },
  updateTranslationDb: async (translationId, changes) => {
    const translation = await updateTranslation(translationId, changes)
    set(state => ({ data: { ...state.data, [translationId]: translation } }))
    return translation
  },
  deleteTranslationDb: async (projectId, translationId) => {
    await deleteTranslation(projectId, translationId)
    set(state => {
      const newData = { ...state.data }
      delete newData[translationId]
      return { data: newData }
    })
    if (get().currentId === translationId) {
      set({ currentId: null })
    }
  },
  // Existing methods
  setCurrentId: (id) => set({ currentId: id }),
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
    const translation = get().data[id]
    if (!translation) {
      console.error("Translation not found in store")
      return
    }
    try {
      const result = await updateTranslation(id, translation)
      set({ data: { ...get().data, [id]: result } })
    } catch (error) {
      console.error("Failed to save translation data:", error)
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
  },
  // Subtitle methods
  setTitle: (id, title) => {
    get().mutateData(id, "title", title)
  },
  setSubtitles: (id, subtitles) => {
    get().mutateData(id, "subtitles", subtitles)
  },
  setParsed: (id, parsed) => {
    get().mutateData(id, "parsed", parsed)
  },
  resetParsed: (id) => {
    const initialParsed: Parsed = { type: "srt", data: null }
    get().mutateData(id, "parsed", initialParsed)
  },
  updateSubtitle: (id, index, field, value) => {
    const data = get().data[id]
    if (data && data.subtitles) {
      const updated = [...data.subtitles]
      updated[index - 1] = { ...updated[index - 1], [field]: value }
      get().mutateData(id, "subtitles", updated)
    }
  },
  // Response methods
  setResponse: (id, res) => {
    const translation = get().data[id]
    if (!translation) return
    get().mutateData(id, "response", { ...translation.response, response: res })
  },
  setJsonResponse: (id, jsonRes) => {
    const translation = get().data[id]
    if (!translation) return
    get().mutateData(id, "response", { ...translation.response, jsonResponse: jsonRes })
  },
  appendJsonResponse: (id, arr) => {
    const translation = get().data[id]
    if (!translation) return
    const currentJson = translation.response.jsonResponse || []
    get().mutateData(id, "response", {
      ...translation.response,
      jsonResponse: [...currentJson, ...arr],
    })
  },
}))
