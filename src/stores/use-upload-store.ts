import { create } from 'zustand'
import type { ClientUploadState } from '@/types/uploads'

interface UploadStore {
  uploadMap: Record<string, ClientUploadState | undefined>
  isUploadingMap: Record<string, boolean>
  setUpload: (id: string, upload: ClientUploadState | null) => void
  setIsUploading: (id: string, value: boolean) => void
  getUpload: (id: string) => ClientUploadState | undefined
  getIsUploading: (id: string) => boolean
}

export const useUploadStore = create<UploadStore>()((set, get) => ({
  uploadMap: {},
  isUploadingMap: {},
  setUpload: (id, upload) => set((state) => ({
    uploadMap: upload
      ? { ...state.uploadMap, [id]: upload }
      : Object.fromEntries(Object.entries(state.uploadMap).filter(([key]) => key !== id))
  })),
  setIsUploading: (id, value) => set((state) => ({
    isUploadingMap: { ...state.isUploadingMap, [id]: value }
  })),
  getUpload: (id) => get().uploadMap[id],
  getIsUploading: (id) => get().isUploadingMap[id] ?? false,
}))
