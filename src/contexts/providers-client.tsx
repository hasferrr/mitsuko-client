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

  useEffect(() => {
    const midtransScriptUrl = process.env.NODE_ENV === 'production'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    const scriptTag = document.createElement('script')
    scriptTag.src = midtransScriptUrl

    const myMidtransClientKey = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
      : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_TEST

    if (myMidtransClientKey) {
      scriptTag.setAttribute('data-client-key', myMidtransClientKey)
    }

    document.body.appendChild(scriptTag)

    return () => {
      document.body.removeChild(scriptTag)
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
