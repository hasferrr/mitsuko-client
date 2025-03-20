import { create } from "zustand"
import { Extraction, Transcription, Translation } from "@/types/project"
import { updateExtraction } from "@/lib/db/extraction"
import { updateTranscription } from "@/lib/db/transcription"
import { updateTranslation } from "@/lib/db/translation"

type ProjectType = "extraction" | "transcription" | "translation"

interface ProjectDataStore {
  currentTranslationId: string | null
  currentTranscriptionId: string | null
  currentExtractionId: string | null
  setCurrentTranslationId: (id: string) => void
  setCurrentTranscriptionId: (id: string) => void
  setCurrentExtractionId: (id: string) => void
  translationData: Record<string, Translation>
  transcriptionData: Record<string, Transcription>
  extractionData: Record<string, Extraction>
  mutateData: (id: string, type: ProjectType, key: keyof Translation | keyof Transcription | keyof Extraction, value: any) => void
  saveData: (id: string, type: ProjectType) => Promise<void>
  upsertTranslationData: (id: string, value: Translation) => void
  upsertTranscriptionData: (id: string, value: Transcription) => void
  upsertExtractionData: (id: string, value: Extraction) => void
  removeTranslationData: (id: string) => void
  removeTranscriptionData: (id: string) => void
  removeExtractionData: (id: string) => void
  renameTranslationData: (id: string, name: string) => void
  renameTranscriptionData: (id: string, name: string) => void
  renameExtractionData: (id: string, name: string) => void
}

export const useProjectDataStore = create<ProjectDataStore>((set, get) => ({
  currentTranslationId: null,
  currentTranscriptionId: null,
  currentExtractionId: null,

  setCurrentTranslationId: (id) => set({ currentTranslationId: id }),
  setCurrentTranscriptionId: (id) => set({ currentTranscriptionId: id }),
  setCurrentExtractionId: (id) => set({ currentExtractionId: id }),

  translationData: {},
  transcriptionData: {},
  extractionData: {},

  mutateData: (id, type, key, value) => {
    const state = get()
    if (type === "translation") {
      const obj = state.translationData[id]
      if (!obj) return
      obj[key as keyof Translation] = value
    } else if (type === "transcription") {
      const obj = state.transcriptionData[id]
      if (!obj) return
      obj[key as keyof Transcription] = value
    } else if (type === "extraction") {
      const obj = state.extractionData[id]
      if (!obj) return
      obj[key as keyof Extraction] = value
    }
  },

  saveData: async (id, type) => {
    const state = get()

    try {
      if (type === "translation") {
        const translation = state.translationData[id]
        if (!translation) {
          console.error("Translation not found in store")
          return
        }
        await updateTranslation(id, translation)
      } else if (type === "transcription") {
        const transcription = state.transcriptionData[id]
        if (!transcription) {
          console.error("Transcription not found in store")
          return
        }
        await updateTranscription(id, transcription)
      } else if (type === "extraction") {
        const extraction = state.extractionData[id]
        if (!extraction) {
          console.error("Extraction not found in store")
          return
        }
        await updateExtraction(id, extraction)
      }
    } catch (error) {
      console.error(`Failed to save ${type} data:`, error)
    }
  },

  upsertTranslationData: (id, value) => {
    get().translationData[id] = value
  },

  upsertTranscriptionData: (id, value) => {
    get().transcriptionData[id] = value
  },

  upsertExtractionData: (id, value) => {
    get().extractionData[id] = value
  },

  removeTranslationData: (id) => {
    delete get().translationData[id]
  },

  removeTranscriptionData: (id) => {
    delete get().transcriptionData[id]
  },

  removeExtractionData: (id) => {
    delete get().extractionData[id]
  },

  renameTranslationData: (id, name) => {
    if (get().translationData[id]) {
      get().translationData[id].title = name
    }
  },

  renameTranscriptionData: (id, name) => {
    if (get().translationData[id]) {
      get().translationData[id].title = name
    }
  },

  renameExtractionData: (id, name) => {
    if (get().extractionData[id]) {
      get().extractionData[id].episodeNumber = name
    }
  },
}))
