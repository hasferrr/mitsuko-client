"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Disc,
  HistoryIcon,
  House,
  Languages,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { CHANGE_LOG_LINK, DISCORD_LINK } from "@/constants/external-links"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: House,
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
  projects: [
    {
      id: "1",
      name: "Design Engineering",
      translations: [],
      transcriptions: [],
      extractions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Sales & Marketing",
      translations: [],
      transcriptions: [],
      extractions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Travel",
      translations: [],
      transcriptions: [],
      extractions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavMain items={data.links} label="Links" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
