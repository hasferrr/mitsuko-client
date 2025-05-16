import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { PropsWithChildren } from "react"
import { AppSidebarWrapper } from "@/components/sidebar/app-sidebar-wrapper"
import { Metadata } from "next"
import { META_TITLE } from "@/constants/metadata"
import AnnouncementPopUp from "@/components/announcement-popup"
export const metadata: Metadata = {
  title: META_TITLE,
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <AnnouncementPopUp />
      <AppSidebarWrapper header={<Navbar />}>
        <div className="flex flex-col min-h-[calc(100vh-3.6rem)]">
          <div className="md:mx-8 flex flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </AppSidebarWrapper>
    </div>
  )
}
