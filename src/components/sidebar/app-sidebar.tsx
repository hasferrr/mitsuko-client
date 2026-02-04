"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Box,
  Cloud,
  Folder,
  House,
  HistoryIcon,
  SwatchBook,
  LibraryBig,
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
import { DISCORD_LINK } from "@/constants/external-links"
import { useProjectStore } from "@/stores/data/use-project-store"
import { SidebarHeaderIcon } from "./sidebar-header-icon"
import { IconBrandDiscord } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
    },
    {
      title: "Projects",
      url: "/project",
      icon: Folder,
    },
    {
      title: "Batches",
      url: "/batch",
      icon: Box,
    },
    {
      title: "Cloud",
      url: "/cloud",
      icon: Cloud,
    },
    {
      title: "Library",
      url: "/library",
      icon: LibraryBig,
    },
    {
      title: "Tools",
      url: "/tools",
      icon: SwatchBook,
    },
  ],
  links: [
    {
      title: "Discord",
      url: DISCORD_LINK,
      icon: IconBrandDiscord,
      newTab: true,
    },
    {
      title: "Changelog",
      url: "/changelog",
      icon: HistoryIcon,
      newTab: false,
    },
  ],
}

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const projects = useProjectStore((state) => state.projects)
  const visibleProjects = projects.filter(p => !p.isBatch)
  const batchProjects = projects.filter(p => p.isBatch)
  const createProject = useProjectStore((state) => state.createProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Sidebar className={cn("z-20 -tracking-[0.01em]", className)} collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <Link href="/">
          <SidebarHeaderIcon />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarMain items={data.navMain.map(item => ({
          ...item,
          onClick: (item.url === "/project" || item.url === "/batch")
            ? () => {
              if (pathname.startsWith(item.url)) {
                setCurrentProject(null)
              }
            }
            : undefined
        }))} />
        <AppSidebarProjects
          projects={visibleProjects}
          addButtonFn={() => {
            void (async () => {
              const newProject = await createProject(`Project ${new Date().toLocaleDateString()}`)
              setCurrentProject(newProject)
              router.push("/project")
            })()
          }}
          showExportImport={batchProjects.length === 0}
        />
        {batchProjects.length > 0 && (
          <AppSidebarProjects
            projects={batchProjects}
            label="Batch"
            addButtonFn={() => {
              void (async () => {
                const newProject = await createProject(`Batch ${new Date().toLocaleDateString()}`, true)
                setCurrentProject(newProject)
                router.push("/batch")
              })()
            }}
            addButtonLabel="Add Batch"
          />
        )}
        <AppSidebarMain items={data.links} label="Links" />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
