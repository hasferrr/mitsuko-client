import { create } from "zustand"
import { Transcription } from "@/types/project"
import {
  updateTranscription as updateDB,
  createTranscription as createDB,
  getTranscription as getDB,
  deleteTranscription as deleteDB,
} from "@/lib/db/transcription"
import { Subtitle } from "@/types/subtitles"
import { DEFAULT_TRANSCTIPTION_SETTINGS } from "@/constants/default"

interface TranscriptionDataStore {
  currentId: string | null
  data: Record<string, Transcription>
  // CRUD methods
  createTranscriptionDb: (projectId: string, data: Pick<Transcription, "title" | "transcriptionText" | "transcriptSubtitles">) => Promise<Transcription>
  getTranscriptionDb: (transcriptionId: string) => Promise<Transcription | undefined>
  updateTranscriptionDb: (transcriptionId: string, changes: Partial<Pick<Transcription, "title" | "transcriptionText" | "transcriptSubtitles" | "selectedMode" | "customInstructions" | "models" | "language">>) => Promise<Transcription>
  deleteTranscriptionDb: (projectId: string, transcriptionId: string) => Promise<void>
  // getters
  getTitle: () => string
  getTranscriptionText: () => string
  getTranscriptSubtitles: () => Subtitle[]
  getSelectedMode: () => Transcription["selectedMode"]
  getLanguage: () => string
  getCustomInstructions: () => string
  getModels: () => Transcription["models"]
  // setters
  setCurrentId: (id: string | null) => void
  setTitle: (id: string, title: string) => void
  setTranscriptionText: (id: string, transcriptionText: string) => void
  setTranscriptSubtitles: (id: string, subtitles: Subtitle[]) => void
  setSelectedMode: (id: string, selectedMode: Transcription["selectedMode"]) => void
  setLanguage: (id: string, language: string) => void
  setCustomInstructions: (id: string, customInstructions: string) => void
  setModels: (id: string, models: Transcription["models"]) => void
  // data manipulation methods
  mutateData: <T extends keyof Transcription>(id: string, key: T, value: Transcription[T]) => void
  mutateDataNoRender: <T extends keyof Transcription>(id: string, key: T, value: Transcription[T]) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Transcription) => void
  removeData: (id: string) => void
}

export const useTranscriptionDataStore = create<TranscriptionDataStore>((set, get) => ({
  currentId: null,
  data: {},
  // CRUD methods
  createTranscriptionDb: async (projectId, data) => {
    const transcription = await createDB(projectId, data)
    set(state => ({ data: { ...state.data, [transcription.id]: transcription } }))
    return transcription
  },
  getTranscriptionDb: async (transcriptionId) => {
    const transcription = await getDB(transcriptionId)
    if (transcription) {
      set(state => ({ data: { ...state.data, [transcriptionId]: transcription } }))
    }
    return transcription
  },
  updateTranscriptionDb: async (transcriptionId, changes) => {
    const transcription = await updateDB(transcriptionId, changes)
    set(state => ({ data: { ...state.data, [transcriptionId]: transcription } }))
    return transcription
  },
  deleteTranscriptionDb: async (projectId, transcriptionId) => {
    await deleteDB(projectId, transcriptionId)
    set(state => {
      const newData = { ...state.data }
      delete newData[transcriptionId]
      return { data: newData }
    })
    if (get().currentId === transcriptionId) {
      set({ currentId: null })
    }
  },
  // getters implementation
  getTitle: () => {
    const id = get().currentId
    return id ? get().data[id]?.title : ""
  },
  getTranscriptionText: () => {
    const id = get().currentId
    return id ? get().data[id]?.transcriptionText : ""
  },
  getTranscriptSubtitles: () => {
    const id = get().currentId
    return id ? get().data[id]?.transcriptSubtitles : []
  },
  getSelectedMode: () => {
    const id = get().currentId
    return id ? get().data[id]?.selectedMode : DEFAULT_TRANSCTIPTION_SETTINGS.selectedMode
  },
  getLanguage: () => {
    const id = get().currentId
    return id ? get().data[id]?.language ?? DEFAULT_TRANSCTIPTION_SETTINGS.language : DEFAULT_TRANSCTIPTION_SETTINGS.language
  },
  getCustomInstructions: () => {
    const id = get().currentId
    return id ? get().data[id]?.customInstructions : DEFAULT_TRANSCTIPTION_SETTINGS.customInstructions
  },
  getModels: () => {
    const id = get().currentId
    return id ? get().data[id]?.models : DEFAULT_TRANSCTIPTION_SETTINGS.models
  },
  // setters implementation
  setCurrentId: (id) => set({ currentId: id }),
  setTitle: (id, title) => {
    get().mutateData(id, "title", title)
  },
  setTranscriptionText: (id, transcriptionText) => {
    if (get().currentId === id) {
      get().mutateData(id, "transcriptionText", transcriptionText)
    } else {
      get().mutateDataNoRender(id, "transcriptionText", transcriptionText)
    }
  },
  setTranscriptSubtitles: (id, subtitles) => {
    get().mutateData(id, "transcriptSubtitles", subtitles)
  },
  setSelectedMode: (id, selectedMode) => {
    get().mutateData(id, "selectedMode", selectedMode)
  },
  setLanguage: (id, language) => {
    get().mutateData(id, "language", language)
  },
  setCustomInstructions: (id, customInstructions) => {
    get().mutateData(id, "customInstructions", customInstructions)
  },
  setModels: (id, models) => {
    get().mutateData(id, "models", models)
  },
  // data manipulation methods
  mutateData: (id, key, value) => {
    set(state => ({
      data: {
        ...state.data,
        [id]: {
          ...state.data[id],
          [key]: value
        }
      }
    }))
  },
  mutateDataNoRender: (id, key, value) => {
    const data = get().data[id]
    if (!data) return
    data[key] = value
  },
  saveData: async (id) => {
    const transcription = get().data[id]
    if (!transcription) {
      console.error("Transcription not found in store")
      return
    }
    try {
      const result = await updateDB(id, {
        title: transcription.title,
        transcriptionText: transcription.transcriptionText,
        transcriptSubtitles: transcription.transcriptSubtitles,
        selectedMode: transcription.selectedMode,
        language: transcription.language,
        customInstructions: transcription.customInstructions,
        models: transcription.models,
      })
      set({ data: { ...get().data, [id]: result } })
    } catch (error) {
      console.error("Failed to save transcription data:", error)
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
