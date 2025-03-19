import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PropsWithChildren } from "react"

export const AppSidebarWrapper = ({ children, header }: PropsWithChildren & {
  header?: React.ReactNode
}) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {header}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
