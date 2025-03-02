import { create } from "zustand"

interface InitRefStore {
  initRefSubtitle: React.RefObject<boolean>
  initRefEndIndex: React.RefObject<boolean>
}

export const useInitRefStore = create<InitRefStore>()(() => ({
  initRefSubtitle: { current: true },
  initRefEndIndex: { current: true },
}))
