"use client"

import Link from "next/link"
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogInIcon,
  LogOutIcon,
  Sparkles,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSessionStore } from "@/stores/use-session-store"
import { supabase } from "@/lib/supabase"
import { useState, useTransition } from "react"

export function AppSidebarUser() {
  const { isMobile } = useSidebar()
  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const user = {
    name: session?.user.user_metadata.name ?? "",
    email: session?.user.email ?? "",
    avatar: session?.user.user_metadata.avatar_url ?? null,
  }

  const name = (() => {
    const s = user.name.split(" ")
    if (s.length < 2) {
      return user.name.slice(0, 2).toUpperCase()
    }
    return (s[0][0] + s[1][0]).toUpperCase()
  })()

  const signOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut()
      setSession(null)
      setIsConfirmOpen(false)
      setIsDropdownOpen(false)
    })
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            {session ? (
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex"
                >
                  <div className="h-8 w-8">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar || null} alt={user.name} />
                      <AvatarFallback className="rounded-lg">{name}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            ) : (
              <Link href="/auth/login">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex"
                  tooltip="Sign In"
                >
                  <div className="flex justify-center items-center pl-1 pr-2">
                    <LogInIcon size={4 * 5} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    Click to Sign In
                  </div>
                </SidebarMenuButton>
              </Link>
            )}
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar || null} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{name}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem disabled>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem disabled>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <Link href="/auth/login">
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isPending}
                onSelect={(e) => e.preventDefault()}
                onClick={() => setIsConfirmOpen(true)}
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu >
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
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
    </>
  )
}