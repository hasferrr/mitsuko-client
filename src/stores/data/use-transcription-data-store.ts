import { create } from "zustand"
import { Transcription, TranscriptionWord, TranscriptionSegment } from "@/types/project"
import {
  updateTranscription as updateDB,
  createTranscription as createDB,
  getTranscription as getDB,
  deleteTranscription as deleteDB,
} from "@/lib/db/transcription"
import { db } from "@/lib/db/db"
import { Subtitle } from "@/types/subtitles"
import { DEFAULT_TRANSCTIPTION_SETTINGS } from "@/constants/default"

export type TranscriptionSettingKey = 'language' | 'selectedMode' | 'customInstructions' | 'models'

interface TranscriptionDataStore {
  currentId: string | null
  data: Record<string, Transcription>
  // CRUD methods
  createTranscriptionDb: (projectId: string, data: Parameters<typeof createDB>[1]) => Promise<Transcription>
  getTranscriptionDb: (transcriptionId: string, skipStoreUpdate?: boolean) => Promise<Transcription | undefined>
  getTranscriptionsDb: (transcriptionIds: string[]) => Promise<Transcription[]>
  updateTranscriptionDb: (transcriptionId: string, changes: Partial<Pick<Transcription, "title" | "transcriptionText" | "transcriptSubtitles" | "selectedMode" | "customInstructions" | "models" | "language" | "selectedUploadId">>) => Promise<Transcription>
  deleteTranscriptionDb: (projectId: string, transcriptionId: string) => Promise<void>
  // settings copy method
  copyTranscriptionSettingsKeys: (sourceId: string, targetId: string, keys: TranscriptionSettingKey[]) => Promise<void>
  // getters
  getTitle: (id: string) => string
  getTranscriptionText: (id: string) => string
  getTranscriptSubtitles: (id: string) => Subtitle[]
  getSelectedMode: (id: string) => Transcription["selectedMode"]
  getLanguage: (id: string) => string
  getCustomInstructions: (id: string) => string
  getModels: (id: string) => Transcription["models"]
  getWords: (id: string) => TranscriptionWord[]
  getSegments: (id: string) => TranscriptionSegment[]
  getSelectedUploadId: (id: string) => string | null
  // setters
  setCurrentId: (id: string | null) => void
  setTitle: (id: string, title: string) => void
  setTranscriptionText: (id: string, transcriptionText: string) => void
  setTranscriptSubtitles: (id: string, subtitles: Subtitle[]) => void
  setSelectedMode: (id: string, selectedMode: Transcription["selectedMode"]) => void
  setLanguage: (id: string, language: string) => void
  setCustomInstructions: (id: string, customInstructions: string) => void
  setModels: (id: string, models: Transcription["models"]) => void
  setWords: (id: string, words: TranscriptionWord[]) => void
  setSegments: (id: string, segments: TranscriptionSegment[]) => void
  setSelectedUploadId: (id: string, selectedUploadId: string | null) => void
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
  getTranscriptionDb: async (transcriptionId, skipStoreUpdate) => {
    const transcription = await getDB(transcriptionId)
    if (transcription && !skipStoreUpdate) {
      set(state => ({ data: { ...state.data, [transcriptionId]: transcription } }))
    }
    return transcription
  },
  getTranscriptionsDb: async (transcriptionIds) => {
    if (transcriptionIds.length === 0) return []
    const transcriptions = await db.transcriptions.bulkGet(transcriptionIds)
    const found: Transcription[] = transcriptions.filter((t): t is Transcription => t !== undefined)
    if (found.length) {
      set(state => ({
        data: {
          ...state.data,
          ...Object.fromEntries(found.map(t => [t.id, t]))
        }
      }))
    }
    return found
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
  getTitle: (id) => {
    return get().data[id]?.title ?? ""
  },
  getTranscriptionText: (id) => {
    return get().data[id]?.transcriptionText ?? ""
  },
  getTranscriptSubtitles: (id) => {
    return get().data[id]?.transcriptSubtitles ?? []
  },
  getSelectedMode: (id) => {
    return get().data[id]?.selectedMode ?? DEFAULT_TRANSCTIPTION_SETTINGS.selectedMode
  },
  getLanguage: (id) => {
    return get().data[id]?.language ?? DEFAULT_TRANSCTIPTION_SETTINGS.language
  },
  getCustomInstructions: (id) => {
    return get().data[id]?.customInstructions ?? DEFAULT_TRANSCTIPTION_SETTINGS.customInstructions
  },
  getModels: (id) => {
    return get().data[id]?.models ?? DEFAULT_TRANSCTIPTION_SETTINGS.models
  },
  getWords: (id) => {
    return get().data[id]?.words ?? []
  },
  getSegments: (id) => {
    return get().data[id]?.segments ?? []
  },
  getSelectedUploadId: (id) => {
    return get().data[id]?.selectedUploadId ?? DEFAULT_TRANSCTIPTION_SETTINGS.selectedUploadId
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
  setWords: (id, words) => {
    get().mutateData(id, "words", words)
  },
  setSegments: (id, segments) => {
    get().mutateData(id, "segments", segments)
  },
  setSelectedUploadId: (id, selectedUploadId) => {
    get().mutateData(id, "selectedUploadId", selectedUploadId)
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
        words: transcription.words,
        segments: transcription.segments,
        selectedUploadId: transcription.selectedUploadId,
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
  },
  copyTranscriptionSettingsKeys: async (sourceId, targetId, keys) => {
    const sourceData = get().data[sourceId]
    const targetData = get().data[targetId]
    if (!sourceData || !targetData) {
      console.error(`Transcription not found: source ${sourceId} or target ${targetId}`)
      return
    }

    const changes: Partial<Pick<Transcription, 'language' | 'selectedMode' | 'customInstructions' | 'models'>> = {}

    if (keys.includes('language')) {
      changes.language = sourceData.language
    }
    if (keys.includes('selectedMode')) {
      changes.selectedMode = sourceData.selectedMode
    }
    if (keys.includes('customInstructions')) {
      changes.customInstructions = sourceData.customInstructions
    }
    if (keys.includes('models')) {
      changes.models = sourceData.models
    }

    if (Object.keys(changes).length === 0) return

    // Update target transcription in database
    const result = await updateDB(targetId, changes)
    
    // Update local state
    set(state => ({
      data: {
        ...state.data,
        [targetId]: result
      }
    }))
  }
}))
