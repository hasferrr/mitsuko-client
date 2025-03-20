import { create } from "zustand"
import { Extraction } from "@/types/project"
import { updateExtraction } from "@/lib/db/extraction"

interface ExtractionDataStore {
  currentId: string | null
  data: Record<string, Extraction>
  setCurrentId: (id: string) => void
  mutateData: (id: string, key: keyof Extraction, value: any) => void
  saveData: (id: string, revalidate?: boolean) => Promise<void>
  upsertData: (id: string, value: Extraction) => void
  removeData: (id: string) => void
}

export const useExtractionDataStore = create<ExtractionDataStore>((set, get) => ({
  currentId: null,
  data: {},
  setCurrentId: (id) => set({ currentId: id }),
  mutateData: (id, key, value) => {
    const data = get().data[id]
    if (!data) return
    data[key] = value
  },
  saveData: async (id, revalidate) => {
    const extraction = get().data[id]
    if (!extraction) {
      console.error("Extraction not found in store")
      return
    }

    try {
      const result = await updateExtraction(id, extraction)
      if (revalidate && result) {
        set({ data: { ...get().data, [id]: result } })
      }
    } catch (error) {
      console.error("Failed to save extraction data:", error)
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
