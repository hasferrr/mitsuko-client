"use client"

import { PropsWithChildren, useState } from "react"
import SessionStoreProvider from "@/contexts/session-context"
import ProjectStoreProvider from "@/contexts/project-context"
import UnsavedChangesProvider from "@/contexts/unsaved-changes-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

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
