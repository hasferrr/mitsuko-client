"use client"

import { Toaster } from "sonner"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { PropsWithChildren } from "react"
import SessionStoreProvider from "@/contexts/session-context"
import ProjectStoreProvider from "@/contexts/project-context"
import UnsavedChangesProvider from "@/contexts/unsaved-changes-context"
import { AppSidebarWrapper } from "@/components/sidebar/app-sidebar-wrapper"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <div className="bg-background text-foreground min-h-screen">
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
      <ProjectStoreProvider>
        <UnsavedChangesProvider>
          {children}
        </UnsavedChangesProvider>
      </ProjectStoreProvider>
    </SessionStoreProvider>
  )
}
