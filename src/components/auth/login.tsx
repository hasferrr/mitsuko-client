"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { useSessionStore } from "@/stores/use-session-store"
import { User } from "./user"
import { LogOutIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export function Login() {
  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)

  const [mounted, setMounted] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

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
    setIsConfirmOpen(false)
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
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit" variant="outline">
            <LogOutIcon className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to sign out?</DialogTitle>
            <DialogDescription>
              You will be logged out of your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={signOut}>Sign out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
