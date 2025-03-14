"use client"

import { supabase } from "@/services/supabase"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { useSessionStore } from "@/stores/use-session-store"

export function Login() {
  const { session, setSession } = useSessionStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/login`
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (!mounted) return null

  return (
    <div className="mx-auto flex flex-col gap-4 items-center justify-center max-w-5xl my-10 md:min-h-[22rem] min-h-[20rem]">
      {!session ? (
        <Button onClick={signUp}>Sign in with Google</Button>
      ) : (
        <>
          <h2>Welcome, {session.user?.email}</h2>
          <Button onClick={signOut} className="w-fit">Sign out</Button>
        </>
      )}
    </div>
  )
}
