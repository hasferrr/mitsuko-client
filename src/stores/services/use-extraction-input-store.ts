import { create } from "zustand"

interface FileItem {
  id: string
  name: string
  content: string
}

interface ExtractionInputStore {
  selectedFiles: FileItem[]
  isBatchMode: boolean
  setSelectedFiles: (selectedFiles: FileItem[]) => void
  setIsBatchMode: (isBatchMode: boolean) => void
}

export const useExtractionInputStore = create<ExtractionInputStore>()(
  (set) => ({
    selectedFiles: [],
    isBatchMode: false,
    setSelectedFiles: (selectedFiles) => set({ selectedFiles }),
    setIsBatchMode: (isBatchMode) => set({ isBatchMode }),
  })
)
