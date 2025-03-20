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
  saveData: (id: string, type: ProjectType, revalidate?: boolean) => Promise<void>
  upsertData: (id: string, type: ProjectType, value: Translation | Transcription | Extraction) => void
  removeData: (id: string, type: ProjectType) => void
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
      const data = state.translationData[id]
      if (!data) return
      data[key as keyof Translation] = value
    } else if (type === "transcription") {
      const data = state.transcriptionData[id]
      if (!data) return
      data[key as keyof Transcription] = value
    } else if (type === "extraction") {
      const data = state.extractionData[id]
      if (!data) return
      data[key as keyof Extraction] = value
    }
  },

  saveData: async (id, type, revalidate) => {
    const state = get()
    let result = null

    try {
      if (type === "translation") {
        const translation = state.translationData[id]
        if (!translation) {
          console.error("Translation not found in store")
          return
        }
        result = await updateTranslation(id, translation)
      } else if (type === "transcription") {
        const transcription = state.transcriptionData[id]
        if (!transcription) {
          console.error("Transcription not found in store")
          return
        }
        result = await updateTranscription(id, transcription)
      } else if (type === "extraction") {
        const extraction = state.extractionData[id]
        if (!extraction) {
          console.error("Extraction not found in store")
          return
        }
        result = await updateExtraction(id, extraction)
      }
    } catch (error) {
      console.error(`Failed to save ${type} data:`, error)
    }

    if (revalidate && result) {
      if (type === "translation") {
        set({ translationData: { ...state.translationData, [id]: result as Translation } })
      } else if (type === "transcription") {
        set({ transcriptionData: { ...state.transcriptionData, [id]: result as Transcription } })
      } else if (type === "extraction") {
        set({ extractionData: { ...state.extractionData, [id]: result as Extraction } })
      }
    }
  },

  upsertData: (id, type, value) => {
    const obj = type === "translation"
      ? get().translationData
      : type === "transcription"
        ? get().transcriptionData
        : type === "extraction"
          ? get().extractionData
          : {}
    obj[id] = value
  },

  removeData: (id, type) => {
    const obj = type === "translation"
      ? get().translationData
      : type === "transcription"
        ? get().transcriptionData
        : type === "extraction"
          ? get().extractionData
          : {}
    delete obj[id]
  },
}))
