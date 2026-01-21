"use client"

import * as Sentry from '@sentry/nextjs'
import { supabase } from '@/lib/supabase'
import { useSessionStore } from '@/stores/use-session-store'
import type { Session } from '@supabase/supabase-js'
import { createContext, PropsWithChildren, useEffect } from 'react'

const SessionStoreContext = createContext(undefined)

export default function SessionStoreProvider({ children }: PropsWithChildren) {
  const setSession = useSessionStore((state) => state.setSession)

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateSentryUser = (session: Session | null) => {
      const user = session?.user

      if (user) {
        Sentry.setUser({ id: user.id })
      } else {
        Sentry.setUser(null)
      }
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        updateSentryUser(session)
      })
      .catch((error) => {
        console.error('Failed to fetch session:', error)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      updateSentryUser(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  return (
    <SessionStoreContext.Provider value={undefined}>
      {children}
    </SessionStoreContext.Provider>
  )
}
