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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useEffect, useState } from "react"
import { useSessionStore } from "@/stores/use-session-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"
import { cn } from "@/lib/utils"
import { FeedbackWrapper } from "@/components/feedback/feedback-wrapper"

export function Navbar() {
  const _pathname = usePathname()
  const [pathname, setPathname] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // User data
  const session = useSessionStore(state => state.session)
  const { data: user, isLoading, isFetching, isError } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
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

  useEffect(() => {
    if (!isProcessing) {
      setIsPopoverOpen(false)
    }
  }, [isProcessing])

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
          <FeedbackWrapper>
            <Button
              variant="outline"
              size="sm"
              className="h-7 mr-4"
            >
              Feedback
            </Button>
          </FeedbackWrapper>

          {isProcessing && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-foreground/80 mr-4 cursor-pointer hover:underline">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden md:block">Processing...</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Currently Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      List of items currently being processed.
                    </p>
                  </div>
                  {isPopoverOpen && (
                    <div className="grid gap-2 max-h-60 overflow-y-auto text-sm">
                      {isTranslatingSet.size > 0 && (
                        <div>
                          <p className="font-semibold mb-1">Translate:</p>
                          {Array.from(isTranslatingSet).map(id => (
                            <div key={`tl-${id}`} className="truncate">
                              - {tlData[id]?.title || `Item ${id}`}
                            </div>
                          ))}
                        </div>
                      )}
                      {isTranscribingSet.size > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold mb-1">Transcribe:</p>
                          {Array.from(isTranscribingSet).map(id => (
                            <div key={`ts-${id}`} className="truncate">
                              - {tsData[id]?.title || `Item ${id}`}
                            </div>
                          ))}
                        </div>
                      )}
                      {isExtractingSet.size > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold mb-1">Extract:</p>
                          {Array.from(isExtractingSet).map(id => (
                            <div key={`ex-${id}`} className="truncate">
                              - {exData[id] ? `Episode ${exData[id].episodeNumber}` : `Item ${id}`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-sm mr-4 cursor-pointer hover:underline"
              title="Click to add credits"
            >
              <CircleDollarSign className="h-4 w-4" />
              <span className={cn(user.credit < 0 && "text-red-500")}>
                {Math.round(user.credit).toLocaleString()} credits
              </span>
            </Link>
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
