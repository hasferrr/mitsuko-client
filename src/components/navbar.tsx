"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Loader2 } from "lucide-react"
import { useThemeStore } from "@/stores/use-theme-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useExtractionStore } from "@/stores/use-extraction-store"
import { NAVBAR_IMG_LINK } from "@/constants/external-links"
import { useTranscriptionStore } from "@/stores/use-transcription-store"
import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbPage } from "./ui/breadcrumb"
import { useProjectStore } from "@/stores/use-project-store"
import { capitalize } from "@/lib/utils"

export function Navbar() {
  const _pathname = usePathname()
  const pathname = capitalize(_pathname.slice(1).replaceAll("-", " "))

  const isDarkModeGlobal = useThemeStore(state => state.isDarkMode)
  const setIsDarkModeGlobal = useThemeStore(state => state.setIsDarkMode)

  const currentProject = useProjectStore(state => state.currentProject)

  const isTranslating = useTranslationStore(state => state.isTranslating)
  const isExtracting = useExtractionStore(state => state.isExtracting)
  const isTranscribing = useTranscriptionStore(state => state.isTranscribing)

  const isProcessing = isTranslating || isExtracting || isTranscribing

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pr-8">
      <div className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block text-foreground hover:underline">
              <Link href="/" className="flex items-center gap-2">
                <img
                  width={4 * 6}
                  height={4 * 6}
                  src={NAVBAR_IMG_LINK}
                  alt="Logo"
                  className="w-6 h-6 object-cover"
                />
                Mitsuko
              </Link>
            </BreadcrumbItem>
            {currentProject && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {currentProject.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {currentProject && pathname && (
              <>
                <BreadcrumbSeparator className="block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {pathname}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2 ml-auto">
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-foreground/80 mr-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden md:block">Processing...</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsDarkModeGlobal(!isDarkModeGlobal)} className="transition-none">
            {isDarkModeGlobal ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
