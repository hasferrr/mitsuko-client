"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Loader2, CircleDollarSign, AlertCircle } from "lucide-react"
import { useThemeStore } from "@/stores/use-theme-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbPage } from "./ui/breadcrumb"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useEffect, useState } from "react"
import { useSessionStore } from "@/stores/use-session-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUserData } from "@/lib/api/user"
import { UserData } from "@/types/user"
import { cn } from "@/lib/utils"

export function Navbar() {
  const _pathname = usePathname()
  const [pathname, setPathname] = useState("")

  // User data
  const session = useSessionStore(state => state.session)
  const { data: user, isLoading, isFetching, isError, refetch } = useQuery<UserData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserData,
    enabled: !!session?.user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Theme
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const setIsDarkMode = useThemeStore(state => state.setIsDarkMode)

  // Process
  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)
  const isProcessing = isTranslatingSet.size > 0 || isExtractingSet.size > 0 || isTranscribingSet.size > 0

  // Project Store
  const currentProject = useProjectStore(state => state.currentProject)

  const tlId = useTranslationDataStore(state => state.currentId)
  const tsId = useTranscriptionDataStore(state => state.currentId)
  const exId = useExtractionDataStore(state => state.currentId)

  const tlData = useTranslationDataStore(state => state.data)
  const tsData = useTranscriptionDataStore(state => state.data)
  const exData = useExtractionDataStore(state => state.data)

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

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pr-8">
      <div className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="text-foreground hover:underline">
              <Link href="/dashboard" className="flex items-center gap-2">
                Dashboard
              </Link>
            </BreadcrumbItem>
            {currentProject && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 hover:underline">
                    <Link href="/project">
                      {currentProject.name}
                    </Link>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {currentProject && pathname && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 hover:underline hidden md:block">
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

          {isFetching || isLoading ? (
            <div className="flex items-center gap-2 text-sm mr-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">Loading credits...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-sm mr-4">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-500">Error</span>
            </div>
          ) : user && (
            <div
              className="flex items-center gap-2 text-sm mr-4 cursor-pointer hover:underline"
              onClick={() => refetch()}
              title="Click to refresh"
            >
              <CircleDollarSign className="h-4 w-4" />
              <span className={cn(user.credit < 0 && "text-red-500")}>
                {Math.round(user.credit).toLocaleString()} credits
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="transition-none"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
