"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { useSessionStore } from "@/stores/use-session-store"

export function Login() {
  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const signUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/login/`
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (!mounted) return null

  return (
    <div className="mx-auto flex flex-col gap-4 items-center justify-center">
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
