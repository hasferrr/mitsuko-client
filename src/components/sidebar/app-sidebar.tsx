"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Disc,
  Folder,
  HistoryIcon,
  House,
  Languages,
} from "lucide-react"

import { AppSidebarMain } from "@/components/sidebar/app-sidebar-main"
import { AppSidebarProjects } from "@/components/sidebar/app-sidebar-projects"
import { AppSidebarUser } from "@/components/sidebar/app-sidebar-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { CHANGE_LOG_LINK, DISCORD_LINK } from "@/constants/external-links"
import { useProjectStore } from "@/stores/data/use-project-store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const projects = useProjectStore((state) => state.projects)
  const createProject = useProjectStore((state) => state.createProject)

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: House,
      },
      {
        title: "Project",
        url: "/project",
        icon: Folder,
      },
      {
        title: "Translate",
        url: "/translate",
        icon: Languages,
      },
      {
        title: "Transcribe",
        url: "/transcribe",
        icon: AudioWaveform,
      },
      {
        title: "Extract Context",
        url: "/extract-context",
        icon: BookOpen,
      },
    ],
    links: [
      {
        title: "Discord",
        url: DISCORD_LINK,
        icon: Disc,
        newTab: true,
      },
      {
        title: "Changelog",
        url: CHANGE_LOG_LINK,
        icon: HistoryIcon,
        newTab: true,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <AppSidebarMain items={data.navMain} />
        <AppSidebarProjects
          projects={projects}
          addButtonFn={() => {
            createProject("Project " + crypto.randomUUID().slice(0, 3))
          }}
        />
        <AppSidebarMain items={data.links} label="Links" />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
