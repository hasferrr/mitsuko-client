import { create } from "zustand"
import { persist } from "zustand/middleware"
import { SubOnlyTranslated } from "@/types/types"

interface HistoryItem {
  title: string
  content: string[]
  json: SubOnlyTranslated[]
  timestamp: string
}

interface HistoryStore {
  history: HistoryItem[]
  addHistory: (title: string, content: string[], json: SubOnlyTranslated[]) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (title, content, json) => {
        const timestamp = new Date().toLocaleString()
        set((state) => ({
          history: [...state.history, { title, content, json, timestamp }],
        }))
      },
      clearHistory: () => set({ history: [] })
    }),
    {
      name: "history-storage",
    }
  )
)
