import { create } from "zustand"

interface UnsavedChangesStore {
  hasChanges: boolean
  setHasChanges: (hasChanges: boolean) => void
}

export const useUnsavedChangesStore = create<UnsavedChangesStore>()((set) => ({
  hasChanges: false,
  setHasChanges: (hasChanges) => set({ hasChanges }),
}))
