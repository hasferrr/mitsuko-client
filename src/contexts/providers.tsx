"use client"

import { PropsWithChildren, useEffect, useState } from "react"
import SessionStoreProvider from "@/contexts/session-context"
import ProjectStoreProvider from "@/contexts/project-context"
import UnsavedChangesProvider from "@/contexts/unsaved-changes-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useThemeStore } from "@/stores/use-theme-store"

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("advanced-settings-storage")
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SessionStoreProvider>
        <ProjectStoreProvider>
          <UnsavedChangesProvider>
            {children}
          </UnsavedChangesProvider>
        </ProjectStoreProvider>
      </SessionStoreProvider>
    </QueryClientProvider>
  )
}
