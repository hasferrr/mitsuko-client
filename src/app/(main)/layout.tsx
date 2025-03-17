"use client"

import { Toaster } from "sonner"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { useThemeStore } from "@/stores/use-theme-store"
import { PropsWithChildren } from "react"
import SessionStoreProvider from "@/contexts/session-context"
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper"

export default function Layout({ children }: PropsWithChildren) {
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  return (
    <Providers>
      <div className={`${isDarkMode ? "dark" : ""} bg-background text-foreground min-h-screen`}>
        <AppSidebarWrapper header={<Navbar />}>
          <main className="md:mx-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AppSidebarWrapper>
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
