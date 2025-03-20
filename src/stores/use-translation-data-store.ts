import { create } from "zustand"
import { Translation } from "@/types/project"
import { updateTranslation } from "@/lib/db/translation"

interface TranslationDataStore {
  currentId: string | null
  data: Record<string, Translation>
  setCurrentId: (id: string) => void
  mutateData: (id: string, key: keyof Translation, value: any) => void
  saveData: (id: string, revalidate?: boolean) => Promise<void>
  upsertData: (id: string, value: Translation) => void
  removeData: (id: string) => void
}

export const useTranslationDataStore = create<TranslationDataStore>((set, get) => ({
  currentId: null,
  data: {},
  setCurrentId: (id) => set({ currentId: id }),
  mutateData: (id, key, value) => {
    const data = get().data[id]
    if (!data) return
    data[key] = value
  },
  saveData: async (id, revalidate) => {
    const translation = get().data[id]
    if (!translation) {
      console.error("Translation not found in store")
      return
    }

    try {
      const result = await updateTranslation(id, translation)
      if (revalidate && result) {
        set({ data: { ...get().data, [id]: result } })
      }
    } catch (error) {
      console.error("Failed to save translation data:", error)
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
