"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Disc,
  Folders,
  HistoryIcon,
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
  user: {
    name: "yuki",
    email: "e@mail.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Folders,
    },
    {
      title: "Translate",
      url: "/",
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
      name: "Design Engineering",
      url: "/",
    },
    {
      name: "Sales & Marketing",
      url: "/",
    },
    {
      name: "Travel",
      url: "/",
    },
  ],
  links: [
    {
      name: "Discord",
      url: DISCORD_LINK,
      icon: Disc,
    },
    {
      name: "Changelog",
      url: CHANGE_LOG_LINK,
      icon: HistoryIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} noMore />
        <NavProjects projects={data.links} label="Links" noDropDown noMore newTabLink />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
