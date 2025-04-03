import { create } from "zustand"
import { Session } from "@supabase/supabase-js"

interface SessionStore {
  session: Session | null
  setSession: (session: Session | null) => void
}

export const useSessionStore = create<SessionStore>()(
  (set) => ({
    session: null,
    setSession: (session) => set({ session }),
  })
)

