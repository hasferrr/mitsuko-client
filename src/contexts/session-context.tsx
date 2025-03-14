import { supabase } from '@/services/supabase'
import { Session } from '@supabase/supabase-js'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionStore {
  session: Session | null
  setSession: (session: Session | null) => void
}

const SessionStoreContext = createContext<StoreApi<SessionStore> | undefined>(undefined)

const sessionStore = createStore<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    {
      name: 'session-store',
    }
  )
)

export default function SessionStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(() => sessionStore)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        store.setState({ session })
      })
      .catch((error) => {
        console.error('Failed to fetch session:', error)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      store.setState({ session })
    })

    return () => subscription.unsubscribe()
  }, [store])

  return (
    <SessionStoreContext.Provider value={store}>
      {children}
    </SessionStoreContext.Provider>
  )
}

export function useSessionStore<T>(selector: (state: SessionStore) => T) {
  const context = useContext(SessionStoreContext)
  if (!context) {
    throw new Error('SessionStore.Provider is missing')
  }
  return useStore(context, selector)
}
