"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Item {
  title: string
  url: string
  icon?: LucideIcon
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
              <SidebarMenuButton tooltip={item.title}>
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
