import { Toaster } from "sonner"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { PropsWithChildren } from "react"
import { AppSidebarWrapper } from "@/components/sidebar/app-sidebar-wrapper"

export default function Layout({ children }: PropsWithChildren) {
  return (
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
  )
}
