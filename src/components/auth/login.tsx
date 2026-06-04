"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { User } from "./user"
import { UserSettings } from "./user-settings"
import { KeyRoundIcon, LogOutIcon } from "lucide-react"
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
import { IconBrandGoogleFilled } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function Login() {
  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)

  const [mounted, setMounted] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [showEmailLogin, setShowEmailLogin] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const continueWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/login/`,
        scopes: "https://www.googleapis.com/auth/userinfo.email",
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
      } else {
        setEmail("")
        setPassword("")
      }
    })
  }

  const handleEmailPasswordSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending || !email || !password) return
    signInWithEmailPassword()
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
        toast.success("Check your email for the confirmation link")
        setEmail("")
        setPassword("")
      }
    })
  }

  const updatePassword = () => {
    startTransition(async () => {
      setError(null)

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setError(error.message)
      } else {
        toast.success("Password updated")
        setNewPassword("")
        setConfirmPassword("")
        setIsPasswordDialogOpen(false)
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
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4">
        <Button onClick={continueWithGoogle}>
          <IconBrandGoogleFilled className="size-4" />
          Continue with Google
        </Button>
        {showEmailLogin ? (
          <>
            <div className="flex justify-center text-xs uppercase">
              <div className="bg-background px-2 text-muted-foreground">
                Or log in with password
              </div>
            </div>
            <form className="flex flex-col gap-2 items-center" onSubmit={handleEmailPasswordSubmit}>
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
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending || !email || !password}
                >
                  {process.env.NODE_ENV === "development" ? "Log in" : "Log in with password"}
                </Button>
                {process.env.NODE_ENV === "development" && (
                  <Button
                    type="button"
                    onClick={signUpWithEmailPassword}
                    variant="outline"
                    disabled={isPending || !email || !password}
                  >
                    Sign up
                  </Button>
                )}
              </div>
            </form>
          </>
        ) : (
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => setShowEmailLogin(true)}
          >
            Log in with password
          </button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="max-w-6xl flex flex-col gap-6 p-4 m-auto">
      <User />
      <UserSettings />
      <div className="flex w-fit gap-2">
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogTrigger asChild>
            <Button disabled={isPending} variant="outline">
              <LogOutIcon className="size-4" />
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
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isPending} variant="outline">
              <KeyRoundIcon className="size-4" />
              Set password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set account password</DialogTitle>
              <DialogDescription>
                Add a password to your Google account so you can also sign in with your email address.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                disabled={isPending || !newPassword || !confirmPassword}
                onClick={updatePassword}
              >
                Save password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
