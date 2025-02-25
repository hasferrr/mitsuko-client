import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { SubOnlyTranslated, SubtitleTranslated, Parsed } from "@/types/types"
import { indexedDBStorage } from "@/lib/indexed-db-storage"

interface HistoryItem {
  title: string
  content: string[]
  json: SubOnlyTranslated[]
  subtitles: SubtitleTranslated[]
  parsed: Parsed
  timestamp: string
}

interface HistoryStore {
  history: HistoryItem[]
  addHistory: (
    title: string,
    content: string[],
    json: SubOnlyTranslated[],
    subtitles: SubtitleTranslated[],
    parsed: Parsed
  ) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (title, content, json, subtitles, parsed) => {
        const timestamp = new Date().toLocaleString()
        set((state) => ({
          history: [
            ...state.history,
            { title, content, json, subtitles, parsed, timestamp },
          ],
        }))
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "history-storage",
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
)
