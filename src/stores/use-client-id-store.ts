import { create } from 'zustand'

interface ClientIdStore {
  clientId: string | null
  setClientId: (id: string) => void
}

export const useClientIdStore = create<ClientIdStore>()(
  (set) => ({
    clientId: null,
    setClientId: (id) => set({ clientId: id }),
  })
)
