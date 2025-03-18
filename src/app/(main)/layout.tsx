"use client"

import { Toaster } from "sonner"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { useThemeStore } from "@/stores/use-theme-store"
import { PropsWithChildren } from "react"
import SessionStoreProvider from "@/contexts/session-context"
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper"
import { cn } from "@/lib/utils"

export default function Layout({ children }: PropsWithChildren) {
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  return (
    <Providers>
      <div className={cn("bg-background text-foreground min-h-screen", isDarkMode && "dark")}>
        <AppSidebarWrapper header={<Navbar />}>
          <div className="flex flex-col min-h-[calc(100vh-3.6rem)]">
            <div className="md:mx-8 flex flex-grow">
              {children}
            </div>
            <Footer />
          </div>
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
