"use client"

import Image from "next/image"
import { useState } from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import ImageLogo from "@/static/waifu.png"

const SIDEBAR_TAGLINES = [
  "AI-Powered Tools",
  "Translation Studio",
  "Subtitle Workshop",
  "Localization Suite",
  "Creative Toolkit",
  "Translation Companion",
  "Language Lab",
  "Atelier de Sous-titres",
  "Compagnon de Trad",
  "Studio Sottotitoli",
  "字幕工房",
  "翻訳の相棒",
  "Kawaii subs (o^^o)",
  "Yatta! Tools (^-^)/",
]

function getCurrentTimeTagline() {
  const minuteTime = Math.floor(Date.now() / (60 * 1000))

  return SIDEBAR_TAGLINES[minuteTime % SIDEBAR_TAGLINES.length]
}

export function SidebarHeaderIcon() {
  const [tagline] = useState(getCurrentTimeTagline)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Home"
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center">
            <Image
              width={4 * 7 * 2}
              height={4 * 7 * 2}
              src={ImageLogo}
              alt="Mitsuko Logo"
              className="size-7 object-cover rounded-lg"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Mitsuko</span>
            <span className="truncate text-xs" suppressHydrationWarning>{tagline}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
