import { create } from "zustand"

interface UnsavedChangesStore {
  hasChangesRef: React.RefObject<boolean>
  setHasChanges: (val: boolean) => void
}

export const useUnsavedChangesStore = create<UnsavedChangesStore>()((set, get) => ({
  hasChangesRef: { current: false },
  setHasChanges: (val) => get().hasChangesRef.current = val,
}))
