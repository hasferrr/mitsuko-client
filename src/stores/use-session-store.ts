import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Session } from "@supabase/supabase-js"

interface SessionStore {
  session: Session | null
  _hasHydrated: boolean
  setSession: (session: Session | null) => void
  setHasHydrated: (state: boolean) => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      _hasHydrated: false,
      setSession: (session) => set({ session }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "session-store",
      partialize: (state) => ({
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

