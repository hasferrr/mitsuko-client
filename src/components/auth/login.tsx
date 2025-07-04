"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useSessionStore } from "@/stores/use-session-store"
import { User } from "./user"
import { UserSettings } from "./user-settings"
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
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { IconBrandGoogleFilled } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function Login() {
  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)

  const isThirdPartyModelEnabled = useLocalSettingsStore((state) => state.isThirdPartyModelEnabled)
  const toggleThirdPartyModel = useLocalSettingsStore((state) => state.toggleThirdPartyModel)

  const [mounted, setMounted] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!session && isThirdPartyModelEnabled) {
      toggleThirdPartyModel()
    }
  }, [session, isThirdPartyModelEnabled])

  const signUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/login/`
      }
    })
  }

  const signInWithEmailPassword = () => {
    startTransition(async () => {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      }
    })
  }

  const signUpWithEmailPassword = () => {
    startTransition(async () => {
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login/`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        alert("Check your email for the confirmation link!")
        setEmail("")
        setPassword("")
      }
    })
  }

  const signOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut()
      setSession(null)
      setIsConfirmOpen(false)
    })
  }

  if (!mounted) return null

  if (!session) {
    return (
      <div className={cn(
        "mx-auto flex max-w-sm flex-col items-center justify-center gap-4",
        process.env.NODE_ENV === "development" && "w-full",
      )}>
        <Button onClick={signUp} className="w-full">
          <IconBrandGoogleFilled className="h-4 w-4" />
          Sign in with Google
        </Button>
        {process.env.NODE_ENV === "development" && (
          <>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="flex w-full gap-2">
              <Button
                onClick={signInWithEmailPassword}
                className="w-full"
                disabled={isPending}
              >
                Sign In
              </Button>
              <Button
                onClick={signUpWithEmailPassword}
                className="w-full"
                variant="outline"
                disabled={isPending}
              >
                Sign Up
              </Button>
            </div>
          </>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="max-w-6xl flex flex-col gap-4 p-4 m-auto">
      <User />
      <UserSettings />
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogTrigger asChild>
          <Button disabled={isPending} className="w-fit" variant="outline">
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
            <Button disabled={isPending} onClick={signOut}>Sign out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
