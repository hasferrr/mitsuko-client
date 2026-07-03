import { Footer } from "@/components/layout/footer"
import { FloatingIndicators } from "@/components/layout/floating-indicators"
import { Navbar } from "@/components/layout/navbar"
import { PropsWithChildren } from "react"
import { AppSidebarWrapper } from "@/components/sidebar/app-sidebar-wrapper"
import { Metadata } from "next"
import { META_TITLE } from "@/constants/metadata"
import { FeaturesPrefetcher } from "@/components/layout/features-prefetcher"
import { MaintenanceBanner } from "@/components/layout/maintenance-banner"

export const metadata: Metadata = {
  title: META_TITLE,
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <AppSidebarWrapper header={<><MaintenanceBanner /><Navbar /></>}>
        <div className="flex flex-col min-h-[calc(100vh-3.6rem)]">
          <FloatingIndicators />
          <FeaturesPrefetcher />
          <div className="md:mx-8 flex grow">
            {children}
          </div>
          <Footer />
        </div>
      </AppSidebarWrapper>
    </div>
  )
}
