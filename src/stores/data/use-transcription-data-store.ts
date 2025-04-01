import { create } from "zustand"
import { Transcription } from "@/types/project"
import { updateTranscription } from "@/lib/db/transcription"
import { Subtitle } from "@/types/types"

interface TranscriptionDataStore {
  currentId: string | null
  data: Record<string, Transcription>
  // getters
  getTitle: () => string
  getTranscriptionText: () => string
  getTranscriptSubtitles: () => Subtitle[]
  // setters
  setCurrentId: (id: string | null) => void
  setTitle: (id: string, title: string) => void
  setTranscriptionText: (id: string, transcriptionText: string) => void
  setTranscriptSubtitles: (id: string, subtitles: Subtitle[]) => void
  // data manipulation methods
  mutateData: <T extends keyof Transcription>(id: string, key: T, value: Transcription[T]) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Transcription) => void
  removeData: (id: string) => void
}

export const useTranscriptionDataStore = create<TranscriptionDataStore>((set, get) => ({
  currentId: null,
  data: {},

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
