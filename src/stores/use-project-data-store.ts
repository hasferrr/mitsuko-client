import { create } from "zustand"
import { Extraction, Transcription } from "@/types/project"
import { useTranscriptionDataStore } from "./use-transcription-data-store"
import { useExtractionDataStore } from "./use-extraction-data-store"

type ProjectType = "transcription" | "extraction"

interface ProjectDataStore {
  currentTranscriptionId: string | null
  currentExtractionId: string | null
  setCurrentTranscriptionId: (id: string) => void
  setCurrentExtractionId: (id: string) => void
  mutateData: (id: string, type: ProjectType, key: keyof Transcription | keyof Extraction, value: any) => void
  saveData: (id: string, type: ProjectType, revalidate?: boolean) => Promise<void>
  upsertData: (id: string, type: ProjectType, value: Transcription | Extraction) => void
  removeData: (id: string, type: ProjectType) => void

  transcriptionData: Record<string, Transcription>
  extractionData: Record<string, Extraction>
}

export const useProjectDataStore = create<ProjectDataStore>((set, get) => ({
  currentTranscriptionId: null,
  currentExtractionId: null,

  setCurrentTranscriptionId: (id) => {
    set({ currentTranscriptionId: id })
    useTranscriptionDataStore.getState().setCurrentId(id)
  },
  setCurrentExtractionId: (id) => {
    set({ currentExtractionId: id })
    useExtractionDataStore.getState().setCurrentId(id)
  },

  mutateData: (id, type, key, value) => {
    if (type === "transcription") {
      useTranscriptionDataStore.getState().mutateData(id, key as keyof Transcription, value)
    } else if (type === "extraction") {
      useExtractionDataStore.getState().mutateData(id, key as keyof Extraction, value)
    }
  },

  saveData: async (id, type, revalidate) => {
    if (type === "transcription") {
      await useTranscriptionDataStore.getState().saveData(id, revalidate)
    } else if (type === "extraction") {
      await useExtractionDataStore.getState().saveData(id, revalidate)
    }
  },

  upsertData: (id, type, value) => {
    if (type === "transcription") {
      useTranscriptionDataStore.getState().upsertData(id, value as Transcription)
    } else if (type === "extraction") {
      useExtractionDataStore.getState().upsertData(id, value as Extraction)
    }
  },

  removeData: (id, type) => {
    if (type === "transcription") {
      useTranscriptionDataStore.getState().removeData(id)
    } else if (type === "extraction") {
      useExtractionDataStore.getState().removeData(id)
    }
  },

  get transcriptionData() {
    return useTranscriptionDataStore.getState().data
  },
  get extractionData() {
    return useExtractionDataStore.getState().data
  },
}))
