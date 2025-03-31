import { supabase } from '@/lib/supabase'
import { useSessionStore } from '@/stores/use-session-store'
import { createContext, PropsWithChildren, useEffect } from 'react'

const SessionStoreContext = createContext(undefined)

export default function SessionStoreProvider({ children }: PropsWithChildren) {
  const setSession = useSessionStore((state) => state.setSession)

  useEffect(() => {
    if (typeof window === "undefined") return

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
      })
      .catch((error) => {
        console.error('Failed to fetch session:', error)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SessionStoreContext.Provider value={undefined}>
      {children}
    </SessionStoreContext.Provider>
  )
}
