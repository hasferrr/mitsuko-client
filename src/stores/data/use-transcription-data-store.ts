import { create } from "zustand"
import { Transcription } from "@/types/project"
import { updateTranscription, createTranscription, getTranscription, deleteTranscription } from "@/lib/db/transcription"
import { Subtitle } from "@/types/types"

interface TranscriptionDataStore {
  currentId: string | null
  data: Record<string, Transcription>
  // CRUD methods
  createTranscriptionDb: (projectId: string, data: Pick<Transcription, "title" | "transcriptionText" | "transcriptSubtitles">) => Promise<Transcription>
  getTranscriptionDb: (projectId: string, transcriptionId: string) => Promise<Transcription | undefined>
  updateTranscriptionDb: (transcriptionId: string, changes: Partial<Pick<Transcription, "title" | "transcriptionText" | "transcriptSubtitles" | "selectedMode" | "customInstructions">>) => Promise<Transcription>
  deleteTranscriptionDb: (projectId: string, transcriptionId: string) => Promise<void>
  // getters
  getTitle: () => string
  getTranscriptionText: () => string
  getTranscriptSubtitles: () => Subtitle[]
  getSelectedMode: () => "clause" | "sentence"
  getCustomInstructions: () => string
  // setters
  setCurrentId: (id: string | null) => void
  setTitle: (id: string, title: string) => void
  setTranscriptionText: (id: string, transcriptionText: string) => void
  setTranscriptSubtitles: (id: string, subtitles: Subtitle[]) => void
  setSelectedMode: (id: string, selectedMode: "clause" | "sentence") => void
  setCustomInstructions: (id: string, customInstructions: string) => void
  // data manipulation methods
  mutateData: <T extends keyof Transcription>(id: string, key: T, value: Transcription[T]) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Transcription) => void
  removeData: (id: string) => void
}

export const useTranscriptionDataStore = create<TranscriptionDataStore>((set, get) => ({
  currentId: null,
  data: {},
  // CRUD methods
  createTranscriptionDb: async (projectId, data) => {
    const transcription = await createTranscription(projectId, data)
    set(state => ({ data: { ...state.data, [transcription.id]: transcription } }))
    return transcription
  },
  getTranscriptionDb: async (projectId, transcriptionId) => {
    const transcription = await getTranscription(projectId, transcriptionId)
    if (transcription) {
      set(state => ({ data: { ...state.data, [transcriptionId]: transcription } }))
    }
    return transcription
  },
  updateTranscriptionDb: async (transcriptionId, changes) => {
    const transcription = await updateTranscription(transcriptionId, changes)
    set(state => ({ data: { ...state.data, [transcriptionId]: transcription } }))
    return transcription
  },
  deleteTranscriptionDb: async (projectId, transcriptionId) => {
    await deleteTranscription(projectId, transcriptionId)
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
    return id ? get().data[id]?.selectedMode : "clause"
  },
  getCustomInstructions: () => {
    const id = get().currentId
    return id ? get().data[id]?.customInstructions : ""
  },
  // setters implementation
  setCurrentId: (id) => set({ currentId: id }),
  setTitle: (id, title) => {
    get().mutateData(id, "title", title)
  },
  setTranscriptionText: (id, transcriptionText) => {
    get().mutateData(id, "transcriptionText", transcriptionText)
  },
  setTranscriptSubtitles: (id, subtitles) => {
    get().mutateData(id, "transcriptSubtitles", subtitles)
  },
  setSelectedMode: (id, selectedMode) => {
    get().mutateData(id, "selectedMode", selectedMode)
  },
  setCustomInstructions: (id, customInstructions) => {
    get().mutateData(id, "customInstructions", customInstructions)
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
  saveData: async (id) => {
    const transcription = get().data[id]
    if (!transcription) {
      console.error("Transcription not found in store")
      return
    }
    try {
      const result = await updateTranscription(id, transcription)
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
