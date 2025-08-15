import { create } from 'zustand'
import type { UploadProgress } from '@/lib/api/file-upload'

interface UploadStore {
  uploadProgress: UploadProgress | null
  isUploading: boolean
  setUploadProgress: (progress: UploadProgress | null) => void
  setIsUploading: (value: boolean) => void
}

export const useUploadStore = create<UploadStore>()((set) => ({
  uploadProgress: null,
  isUploading: false,
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setIsUploading: (value) => set({ isUploading: value }),
}))
