import { create } from "zustand"
import { Extraction, Transcription, Translation } from "@/types/project"

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
