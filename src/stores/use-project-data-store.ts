import { create } from "zustand"
import { Extraction, Transcription, Translation } from "@/types/project"
import { useTranslationDataStore } from "./use-translation-data-store"
import { useTranscriptionDataStore } from "./use-transcription-data-store"
import { useExtractionDataStore } from "./use-extraction-data-store"

type ProjectType = "extraction" | "transcription" | "translation"

interface ProjectDataStore {
  currentTranslationId: string | null
  currentTranscriptionId: string | null
  currentExtractionId: string | null
  setCurrentTranslationId: (id: string) => void
  setCurrentTranscriptionId: (id: string) => void
  setCurrentExtractionId: (id: string) => void
  mutateData: (id: string, type: ProjectType, key: keyof Translation | keyof Transcription | keyof Extraction, value: any) => void
  saveData: (id: string, type: ProjectType, revalidate?: boolean) => Promise<void>
  upsertData: (id: string, type: ProjectType, value: Translation | Transcription | Extraction) => void
  removeData: (id: string, type: ProjectType) => void

  translationData: Record<string, Translation>
  transcriptionData: Record<string, Transcription>
  extractionData: Record<string, Extraction>
}

export const useProjectDataStore = create<ProjectDataStore>((set, get) => ({
  currentTranslationId: null,
  currentTranscriptionId: null,
  currentExtractionId: null,

  setCurrentTranslationId: (id) => {
    set({ currentTranslationId: id })
    useTranslationDataStore.getState().setCurrentId(id)
  },
  setCurrentTranscriptionId: (id) => {
    set({ currentTranscriptionId: id })
    useTranscriptionDataStore.getState().setCurrentId(id)
  },
  setCurrentExtractionId: (id) => {
    set({ currentExtractionId: id })
    useExtractionDataStore.getState().setCurrentId(id)
  },

  mutateData: (id, type, key, value) => {
    if (type === "translation") {
      useTranslationDataStore.getState().mutateData(id, key as keyof Translation, value)
    } else if (type === "transcription") {
      useTranscriptionDataStore.getState().mutateData(id, key as keyof Transcription, value)
    } else if (type === "extraction") {
      useExtractionDataStore.getState().mutateData(id, key as keyof Extraction, value)
    }
  },

  saveData: async (id, type, revalidate) => {
    if (type === "translation") {
      await useTranslationDataStore.getState().saveData(id, revalidate)
    } else if (type === "transcription") {
      await useTranscriptionDataStore.getState().saveData(id, revalidate)
    } else if (type === "extraction") {
      await useExtractionDataStore.getState().saveData(id, revalidate)
    }
  },

  upsertData: (id, type, value) => {
    if (type === "translation") {
      useTranslationDataStore.getState().upsertData(id, value as Translation)
    } else if (type === "transcription") {
      useTranscriptionDataStore.getState().upsertData(id, value as Transcription)
    } else if (type === "extraction") {
      useExtractionDataStore.getState().upsertData(id, value as Extraction)
    }
  },

  removeData: (id, type) => {
    if (type === "translation") {
      useTranslationDataStore.getState().removeData(id)
    } else if (type === "transcription") {
      useTranscriptionDataStore.getState().removeData(id)
    } else if (type === "extraction") {
      useExtractionDataStore.getState().removeData(id)
    }
  },

  get translationData() {
    return useTranslationDataStore.getState().data
  },
  get transcriptionData() {
    return useTranscriptionDataStore.getState().data
  },
  get extractionData() {
    return useExtractionDataStore.getState().data
  },
}))
