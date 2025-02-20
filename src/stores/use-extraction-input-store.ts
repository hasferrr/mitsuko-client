import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FileItem {
  id: string
  name: string
  content: string
}

interface ExtractionInputStore {
  episodeNumber: string
  subtitleContent: string
  previousContext: string
  selectedFiles: FileItem[]
  isBatchMode: boolean
  setEpisodeNumber: (episodeNumber: string) => void
  setSubtitleContent: (subtitleContent: string) => void
  setPreviousContext: (previousContext: string) => void
  setSelectedFiles: (selectedFiles: FileItem[]) => void
  setIsBatchMode: (isBatchMode: boolean) => void
}

export const useExtractionInputStore = create<ExtractionInputStore>()(
  persist(
    (set) => ({
      episodeNumber: "",
      subtitleContent: "",
      previousContext: "",
      selectedFiles: [],
      isBatchMode: false,
      setEpisodeNumber: (episodeNumber) => set({ episodeNumber }),
      setSubtitleContent: (subtitleContent) => set({ subtitleContent }),
      setPreviousContext: (previousContext) => set({ previousContext }),
      setSelectedFiles: (selectedFiles) => set({ selectedFiles }),
      setIsBatchMode: (isBatchMode) => set({ isBatchMode }),
    }),
    {
      name: 'extraction-input-storage',
    }
  )
)
