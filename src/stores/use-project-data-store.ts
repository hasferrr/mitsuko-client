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
  }
}))
