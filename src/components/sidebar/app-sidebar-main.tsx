"use client"

import { type LucideIcon } from "lucide-react"
import { type Icon as TablerIcon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/stores/data/use-project-store"

interface Item {
  title: string
  url: string
  icon?: LucideIcon | TablerIcon
  newTab?: boolean
  onClick?: () => void
}

interface AppSidebarMainProps {
  items: Item[],
  label?: string
}

export function AppSidebarMain({
  items,
  label,
}: AppSidebarMainProps) {
  const pathname = usePathname()
  const currentProject = useProjectStore((state) => state.currentProject)
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {label ? label : "Platform"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <Link
              href={item.url}
              target={cn(item.newTab && "_blank")}
              rel={cn(item.newTab && "noopener noreferrer")}
              onClick={item.onClick}
            >
              <SidebarMenuButton
                tooltip={item.title}
                isActive={
                  pathname.startsWith(item.url)
                  && (
                    item.url === "/batch"
                      ? !currentProject?.isBatch || !currentProject
                      : item.url === "/project" ? !currentProject : true
                  )
                }
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
