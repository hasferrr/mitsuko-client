import { create } from "zustand"
import { Transcription } from "@/types/project"
import { updateTranscription } from "@/lib/db/transcription"

interface TranscriptionDataStore {
  currentId: string | null
  data: Record<string, Transcription>
  setCurrentId: (id: string) => void
  mutateData: (id: string, key: keyof Transcription, value: any) => void
  saveData: (id: string, revalidate?: boolean) => Promise<void>
  upsertData: (id: string, value: Transcription) => void
  removeData: (id: string) => void
}

export const useTranscriptionDataStore = create<TranscriptionDataStore>((set, get) => ({
  currentId: null,
  data: {},
  setCurrentId: (id) => set({ currentId: id }),
  mutateData: (id, key, value) => {
    const data = get().data[id]
    if (!data) return
    data[key] = value
  },
  saveData: async (id, revalidate) => {
    const transcription = get().data[id]
    if (!transcription) {
      console.error("Transcription not found in store")
      return
    }

    try {
      const result = await updateTranscription(id, transcription)
      if (revalidate && result) {
        set({ data: { ...get().data, [id]: result } })
      }
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
  }
}))
