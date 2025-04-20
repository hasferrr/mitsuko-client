"use client"

import { PropsWithChildren, useEffect, useState } from "react"
import SessionStoreProvider from "@/contexts/session-context"
import ProjectStoreProvider from "@/contexts/project-context"
import UnsavedChangesProvider from "@/contexts/unsaved-changes-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useThemeStore } from "@/stores/use-theme-store"
import { ModelCostProvider } from "@/contexts/model-cost-context"
import { ModelCreditCost } from "@/types/model-cost"

interface ProvidersProps extends PropsWithChildren {
  modelCosts: Map<string, ModelCreditCost>
}

export default function ProvidersClient({ children, modelCosts }: ProvidersProps) {
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
            <ModelCostProvider value={modelCosts}>
              {children}
            </ModelCostProvider>
          </UnsavedChangesProvider>
        </ProjectStoreProvider>
      </SessionStoreProvider>
    </QueryClientProvider>
  )
}
