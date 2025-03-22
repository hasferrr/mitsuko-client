import { create } from "zustand"
import { Translation } from "@/types/project"
import { SubOnlyTranslated, SubtitleTranslated, Parsed } from "@/types/types"
import { updateTranslation } from "@/lib/db/translation"

export interface TranslationDataStore {
  currentId: string | null
  data: Record<string, Translation>
  // Existing methods
  setCurrentId: (id: string) => void
  mutateData: (id: string, key: keyof Translation, value: any) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Translation) => void
  removeData: (id: string) => void
  // Subtitle methods
  setTitle: (id: string, title: string) => void
  setSubtitles: (id: string, subtitles: SubtitleTranslated[]) => void
  setParsed: (id: string, parsed: Parsed) => void
  resetParsed: (id: string) => void
  updateSubtitle: (id: string, index: number, field: keyof SubtitleTranslated, value: any) => void
  // Response methods
  setResponse: (id: string, response: string) => void
  setJsonResponse: (id: string, jsonResponse: SubOnlyTranslated[]) => void
  appendJsonResponse: (id: string, arr: SubOnlyTranslated[]) => void
}

export const useTranslationDataStore = create<TranslationDataStore>((set, get) => ({
  currentId: null,
  data: {},
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
