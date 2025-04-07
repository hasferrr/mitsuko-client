"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { useSessionStore } from "@/stores/use-session-store"
import { User } from "./user"
import { LogOutIcon } from "lucide-react"

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

  if (!session) {
    return (
      <div className="mx-auto flex flex-col gap-4 items-center justify-center">
        <Button onClick={signUp}>Sign in with Google</Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl flex flex-col gap-4 p-4 m-auto">
      <User />
      <Button onClick={signOut} className="w-fit" variant="outline">
        <LogOutIcon className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}
