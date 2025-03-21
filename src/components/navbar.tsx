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
import { useProjectDataStore } from "@/stores/use-project-data-store"
import { useEffect, useState } from "react"

export function Navbar() {
  const _pathname = usePathname()
  const [pathname, setPathname] = useState("")

  // Theme
  const isDarkModeGlobal = useThemeStore(state => state.isDarkMode)
  const setIsDarkModeGlobal = useThemeStore(state => state.setIsDarkMode)

  // Process
  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const isExtracting = useExtractionStore(state => state.isExtracting)
  const isTranscribing = useTranscriptionStore(state => state.isTranscribing)
  const isProcessing = isTranslatingSet.size || isExtracting || isTranscribing

  // Project Store
  const currentProject = useProjectStore(state => state.currentProject)

  const tlId = useProjectDataStore(state => state.currentTranslationId)
  const tsId = useProjectDataStore(state => state.currentTranscriptionId)
  const exId = useProjectDataStore(state => state.currentExtractionId)

  const tlData = useProjectDataStore(state => state.translationData)
  const tsData = useProjectDataStore(state => state.transcriptionData)
  const exData = useProjectDataStore(state => state.extractionData)

  useEffect(() => {
    setPathname("")
    const len = 40
    const getTruncatedTitle = (title: string) => title.length > len ? title.slice(0, len) + "..." : title
    if (_pathname === "/translate" && tlId && tlData[tlId]) {
      setPathname(getTruncatedTitle(tlData[tlId].title))
    }
    if (_pathname === "/transcribe" && tsId && tsData[tsId]) {
      setPathname(getTruncatedTitle(tsData[tsId].title))
    }
    if (_pathname === "/extract-context" && exId && exData[exId]) {
      setPathname("Episode " + getTruncatedTitle(exData[exId].episodeNumber))
    }
  }, [_pathname, tlId, tsId, exId, tlData, tsData, exData])

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
                  <BreadcrumbPage className="line-clamp-1 hover:underline">
                    <Link href="/">
                      {currentProject.name}
                    </Link>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {currentProject && pathname && (
              <>
                <BreadcrumbSeparator className="block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 hover:underline">
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
