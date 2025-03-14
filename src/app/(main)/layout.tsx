"use client"

import { Toaster } from "sonner"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { useThemeStore } from "@/stores/use-theme-store"
import { PropsWithChildren } from "react"
import SessionStoreProvider from "@/contexts/session-context"

export default function Layout({ children }: PropsWithChildren) {
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  return (
    <Providers>
      <div className={`${isDarkMode ? "dark" : ""} bg-background text-foreground min-h-screen`}>
        <Navbar />
        {children}
        <Footer />
        <Toaster />
      </div>
    </Providers>
  )
}

function Providers({ children }: PropsWithChildren) {
  return (
    <SessionStoreProvider>
      {children}
    </SessionStoreProvider>
  )
}
